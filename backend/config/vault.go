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

// crypto settings - nothing fancy, just solid defaults
const (
	saltSize               = 16
	keyLen                 = 32 // aes-256 key size
	argonTime              = 3  // iterations, pretty fast but still secure
	argonMemoryKiB         = 64 * 1024 // 64mb memory usage - reasonable for desktop
	argonThreads           = 1
	gcmTagOverhead         = 16 // gcm auth tag size
	fixedCiphertextPayload = 64 * 1024 // always output 64kb files to hide real data size
)

var (
	// magic bytes so we know this is our encrypted file format
	markerBytes      = []byte("BITBOX-INCOGNITO1") // exactly 16 bytes
	fixedPlaintextSz = fixedCiphertextPayload - gcmTagOverhead
)

// turn password into encryption key using argon2id (slow by design)
func deriveKey(password []byte, salt []byte) []byte {
	return argon2.IDKey(password, salt, argonTime, argonMemoryKiB, argonThreads, keyLen)
}

// encrypt json data and pad to fixed size so file size doesn't leak info
func encryptJSONBytes(json []byte, password []byte) ([]byte, error) {
	// pack everything into fixed size: magic + length + actual json + random padding
	minOverhead := len(markerBytes) + 4
	if len(json)+minOverhead > fixedPlaintextSz {
		return nil, fmt.Errorf("json too big (%d bytes); max is %d bytes",
			len(json), fixedPlaintextSz-minOverhead)
	}

	// start building the plaintext buffer
	plain := make([]byte, 0, fixedPlaintextSz)
	plain = append(plain, markerBytes...)

	// store json length as 4 bytes
	lenBuf := make([]byte, 4)
	binary.BigEndian.PutUint32(lenBuf, uint32(len(json)))
	plain = append(plain, lenBuf...)
	plain = append(plain, json...)

	// pad with random bytes to reach fixed size
	padLen := fixedPlaintextSz - len(plain)
	if padLen < 0 {
		return nil, errors.New("math error in padding calc")
	}
	if padLen > 0 {
		pad := make([]byte, padLen)
		if _, err := rand.Read(pad); err != nil {
			return nil, fmt.Errorf("failed to generate padding: %w", err)
		}
		plain = append(plain, pad...)
	}

	// generate random salt for key derivation
	salt := make([]byte, saltSize)
	if _, err := rand.Read(salt); err != nil {
		return nil, fmt.Errorf("failed to generate salt: %w", err)
	}
	key := deriveKey(password, salt)

	// set up aes-gcm encryption
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("aes setup failed: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("gcm setup failed: %w", err)
	}

	// random nonce for this encryption
	nonce := make([]byte, gcm.NonceSize()) // should be 12 bytes
	if _, err := rand.Read(nonce); err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %w", err)
	}

	// encrypt the plaintext
	ct := gcm.Seal(nil, nonce, plain, nil)

	// final output: salt + nonce + ciphertext (always same total size)
	out := make([]byte, 0, saltSize+len(nonce)+len(ct))
	out = append(out, salt...)
	out = append(out, nonce...)
	out = append(out, ct...)
	return out, nil
}

// decrypt and extract the original json from encrypted file
func decryptToJSON(cipherFile []byte, password []byte) ([]byte, error) {
	// basic sanity check on file size
	if len(cipherFile) < saltSize+12+gcmTagOverhead {
		return nil, errors.New("encrypted file too small")
	}
	
	// extract the parts: salt + nonce + actual ciphertext
	salt := cipherFile[:saltSize]
	nonce := cipherFile[saltSize : saltSize+12]
	ct := cipherFile[saltSize+12:]

	// derive the same key from password + salt
	key := deriveKey(password, salt)

	// set up decryption
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("aes setup failed: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("gcm setup failed: %w", err)
	}
	if len(nonce) != gcm.NonceSize() {
		return nil, errors.New("nonce has wrong size")
	}

	// try to decrypt - this will fail if password is wrong
	plain, err := gcm.Open(nil, nonce, ct, nil)
	if err != nil {
		// could be wrong password, corrupted file, or tampering - we can't tell which
		return nil, errors.New("wrong password or corrupted file")
	}
	
	// check we got the expected size back
	if len(plain) != fixedPlaintextSz {
		return nil, errors.New("decrypted data has wrong size")
	}
	
	// verify our magic marker is there
	if !bytes.Equal(plain[:len(markerBytes)], markerBytes) {
		return nil, errors.New("wrong password or corrupted file")
	}
	
	// extract the json length and bounds check it
	if len(plain) < len(markerBytes)+4 {
		return nil, errors.New("decrypted data too short")
	}
	jsonLen := binary.BigEndian.Uint32(plain[len(markerBytes) : len(markerBytes)+4])
	maxJSON := fixedPlaintextSz - (len(markerBytes) + 4)
	if int(jsonLen) > maxJSON {
		return nil, errors.New("json length field is invalid")
	}
	
	// extract just the json part (ignore the padding)
	jsonStart := len(markerBytes) + 4
	jsonEnd := jsonStart + int(jsonLen)
	return append([]byte{}, plain[jsonStart:jsonEnd]...), nil
}
