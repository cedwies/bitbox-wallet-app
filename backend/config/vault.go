// Copyright 2024 Shift Crypto AG
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package config

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/binary"
	"errors"
	"fmt"

	"golang.org/x/crypto/argon2"
)

// just some settings for the encryption, nothing too crazy
const (
	saltSize               = 16
	keyLen                 = 32 // AES-256
	argonTime              = 3
	argonMemoryKiB         = 64 * 1024 // 64 MiB
	argonThreads           = 1
	gcmTagOverhead         = 16
	fixedCiphertextPayload = 64 * 1024 // 64 KiB ciphertext payload (not counting salt+nonce)
)

var (
	// this is like a secret handshake, so we know we're decrypting the right kind of file
	markerBytes      = []byte("BITBOX-INCOGNITO1") // 16 bytes
	fixedPlaintextSz = fixedCiphertextPayload - gcmTagOverhead
)

// this just makes the encryption key from your password
func deriveKey(password []byte, salt []byte) []byte {
	return argon2.IDKey(password, salt, argonTime, argonMemoryKiB, argonThreads, keyLen)
}

// takes your data, encrypts it, and wraps it up so it's always the same size. good for hiding stuff.
func encryptJSONBytes(json []byte, password []byte) ([]byte, error) {
	// Build fixed-size plaintext: marker (16) + len (4) + json + pad = fixedPlaintextSz
	minOverhead := len(markerBytes) + 4
	if len(json)+minOverhead > fixedPlaintextSz {
		return nil, fmt.Errorf("plaintext too large (%d bytes); max is %d bytes",
			len(json), fixedPlaintextSz-minOverhead)
	}

	plain := make([]byte, 0, fixedPlaintextSz)
	plain = append(plain, markerBytes...)

	lenBuf := make([]byte, 4)
	binary.BigEndian.PutUint32(lenBuf, uint32(len(json)))
	plain = append(plain, lenBuf...)
	plain = append(plain, json...)

	padLen := fixedPlaintextSz - len(plain)
	if padLen < 0 {
		return nil, errors.New("internal padding size negative")
	}
	if padLen > 0 {
		pad := make([]byte, padLen)
		if _, err := rand.Read(pad); err != nil {
			return nil, fmt.Errorf("rand pad: %w", err)
		}
		plain = append(plain, pad...)
	}

	// Derive key
	salt := make([]byte, saltSize)
	if _, err := rand.Read(salt); err != nil {
		return nil, fmt.Errorf("rand salt: %w", err)
	}
	key := deriveKey(password, salt)

	// AES-256-GCM
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("cipher: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("gcm: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize()) // 12 bytes
	if _, err := rand.Read(nonce); err != nil {
		return nil, fmt.Errorf("rand nonce: %w", err)
	}

	ct := gcm.Seal(nil, nonce, plain, nil)

	// Output: salt || nonce || ciphertext (constant size overall)
	out := make([]byte, 0, saltSize+len(nonce)+len(ct))
	out = append(out, salt...)
	out = append(out, nonce...)
	out = append(out, ct...)
	return out, nil
}

// the reverse of encrypt. unwraps the data and gives you back the original json, if the password is right.
func decryptToJSON(cipherFile []byte, password []byte) ([]byte, error) {
	if len(cipherFile) < saltSize+12+gcmTagOverhead {
		return nil, errors.New("file too small")
	}
	salt := cipherFile[:saltSize]
	nonce := cipherFile[saltSize : saltSize+12]
	ct := cipherFile[saltSize+12:]

	key := deriveKey(password, salt)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("cipher: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("gcm: %w", err)
	}
	if len(nonce) != gcm.NonceSize() {
		return nil, errors.New("bad nonce size")
	}

	plain, err := gcm.Open(nil, nonce, ct, nil)
	if err != nil {
		// Wrong password, corrupted file, or tampered data — indistinguishable by design
		return nil, errors.New("wrong password or corrupted file")
	}
	if len(plain) != fixedPlaintextSz {
		return nil, errors.New("unexpected plaintext size")
	}
	// Check marker
	if !bytes.Equal(plain[:len(markerBytes)], markerBytes) {
		return nil, errors.New("wrong password or corrupted file")
	}
	// Extract json length
	if len(plain) < len(markerBytes)+4 {
		return nil, errors.New("truncated data")
	}
	jsonLen := binary.BigEndian.Uint32(plain[len(markerBytes) : len(markerBytes)+4])
	maxJSON := fixedPlaintextSz - (len(markerBytes) + 4)
	if int(jsonLen) > maxJSON {
		return nil, errors.New("declared JSON length invalid")
	}
	jsonStart := len(markerBytes) + 4
	jsonEnd := jsonStart + int(jsonLen)
	return append([]byte{}, plain[jsonStart:jsonEnd]...), nil
}
