# BitBoxApp (Incognito Mode branch)

This branch extends the BitBoxApp with an **experimental “incognito mode”** for the webserver build.  
The goal is to prevent sensitive account data from being written unencrypted to disk, and to require a password to unlock watch-only accounts when incognito mode is active.

---

## Build & Run

Requirements (same as upstream):

- Go 1.24  
- Node.js 20.x, NPM 10.x  
- Qt 6.8.2 (with WebEngine)  

Steps:

```bash
# clone with submodules
git clone --recursive git@github.com:cedwies/bitbox-wallet-app.git
cd bitbox-wallet-app

# check out incognito-branch
git checkout incognito-mode

# initialize environment
make envinit

# start backend
make servewallet

# for first use
make buildweb

# start frontend
make webdev
```

This serves the UI on [http://localhost:8080](http://localhost:8080).  
The HTTP API is served by `servewallet`.

---

## Incognito Mode (what this branch adds)

- Incognito mode can be enabled/disabled in settings (general)
- Backend flag `incognitoMode` prevents `accounts.json` from being written to disk in cleartext.
- When enabled, saved watch-only accounts must be unlocked with a password before use.
- When `incognitoMode` is enabled, a fixed sized encrypted accounts.json is always present, to not reveal whether watch-only accounts have been saved or not.

---

## Limitations & Future Work

This is **not yet a full incognito mode**. Open issues:

1. **Security hardening**
   - In-memory key management is basic; wiping on lock/logout should be more robust.
   - Need fuzzing, integration, and adversarial testing.
2. **Database layer**
   - The `bbolt` DB still writes sensitive watch-only account data to disk.  
     Options:  
     - Write encrypted snapshots every X commits (hurts performance, probably not feasible), or  
     - Replace with a fully encrypted DB backend.
     - Disable DB writes (to disk) during incognito mode (hurts performance after each restart of the app)
3. **Testing**
   - Unit tests and integration tests for the new API are still minimal.
   - Needs reproducible coverage (happy paths, wrong passwords, tampering).
4. **Scope**
   - Currently only implemented for the **webserver variant** (`servewallet`).  
   - Desktop and mobile builds are not yet wired up.
5. **Only valid passwords**
   - Currently, when a user enters a wrong password to unlock the App in incognito mode, only the correct password works. 
   - One modification is to treat every password as valid, while simply showing no remembered watch-only accounts when the password cannot decrypt the `accounts.json`
6. **Benchmark encryption of accounts.json**
   - Currently, an encrypted `accounts.json` is padded to ~64 kb
   - One can reduce the padded size (e.g. to 32 kb) to improve performance, as long as a valid `accounts.json` is almost guaranteed to not exceed the padding size.

---

## Motivation

I know this is only a starting point: the feature needs hardening, testing, and deeper backend changes.  
But I wanted to contribute something concrete that opens the conversation about privacy and disk persistence in BitBoxApp.
This fork also served as a quick self-onboarding into the BitBoxApp.
