# sw-elevator

- **Category:** Linux / Forensics
- **Points:** 50
- **Target:** `ssh chal@chal.ctf-league.osusec.org -p 1302`
- **Initial Password:** `LetMeOnTheElevator`
- **Flag Format:** `osu{...}`

---

## Core Concepts Covered
1. **Linux Navigation & Discovery:** Traversing directory structures, uncovering hidden dotfiles (`ls -a`), and escaping whitespace/special characters in filenames.
2. **Text Filtering & Searching:** Filtering targets across single and recursive directories using `grep` and extracting embedded ASCII strings from binaries using `strings`.
3. **Process Auditing & System Inspection:** Viewing arguments of active processes (`ps aux`) and querying local service ports using `curl`.
4. **File Operations & Artifact Recovery:** Decompressing compressed archives (`tar`), managing executable permissions (`chmod +x`), and inspecting Vim crash swap artifacts (`.swp`).

---

## Challenge Overview
Challenge emulates a multi-stage privilege escalation "elevator." Starting at `level0`, each level requires finding credentials for the next user account (`levelN_54848`) to switch sessions using `su --login <user>` until reaching the penthouse at Level 14.

Along the way, two flags are located in the filesystem root (`/`):
- **Flag 1:** Accessible by `level7` (`/flag_1.txt`)
- **Flag 2:** Accessible by `level14` (`/flag_2.txt`)

---

## Level-by-Level Walkthrough

### Level 0 -> Level 1: Basic File Inspection
- **Hint/README:** *"Have you seen my cat? Once you find credentials, log in with `su --login usernamehere`"*
- **Solution:**
  Inspect the contents of `creds_level1/`:
  ```bash
  cat creds_level1/creds_level1.txt
  ```
- **Credentials:** `level1_54848` : `469170`

---

### Level 1 -> Level 2: Recursive Text Search
- **Hint/README:** *"linux gives u tons of tools to run around directories like you're a little monkey and they're trees"*
- **Solution:**
  Directory contains nested subdirectories (`bnaoos2z/`, `g0bra55i/`). Recursively search for matching credential terms:
  ```bash
  grep -r "user" bnaoos2z/
  grep -r "pass" bnaoos2z/
  ```
  Found in `bnaoos2z/0lxgab1u/fux1hr12/k6i9qi1w/fttsz8kb/la7f8nw5/creds_level2.txt`.
- **Credentials:** `level2_54848` : `ed6898`

---

### Level 2 -> Level 3: Filtering Massive Files
- **Hint/README:** *"rocky raccoon checked into his room... hint: grep."*
- **Solution:**
  `creds_level3.txt` contains the entire King James Bible. Filter directly for the credential patterns:
  ```bash
  grep "level" creds_level3.txt
  grep "password" creds_level3.txt
  ```
- **Credentials:** `level3_54848` : `137a1f`

---

### Level 3 -> Level 4: Execution Permissions
- **Hint/README:** *"Can you get creds_level4.sh to run?"*
- **Solution:**
  A shell script `creds_level4.sh` exists without execute permissions. Add executable rights and run it:
  ```bash
  chmod +x creds_level4.sh
  ./creds_level4.sh
  ```
- **Credentials:** `level4_54848` : `580136`

---

### Level 4 -> Level 5: Hidden Files & Directories
- **Hint/README:** *"Have you seen my file? hint: ls has a lot of options :)"*
- **Solution:**
  List all hidden entries (prefixed with `.`) and read the nested hidden credential file:
  ```bash
  ls -a
  cd .hidden_creds_level5/
  ls -a
  cat .creds_level5.txt
  ```
- **Credentials:** `level5_54848` : `ec4fa4`

---

### Level 5 -> Level 6: Handling Whitespace and Shell Metacharacters
- **Hint/README:** *"filename is weird! can u read it anyway?"*
- **Solution:**
  Target file path contains spaces and an exclamation mark: `look in here/creds in here!`. Escape the special characters or enclose the path in quotes:
  ```bash
  cat look\ in\ here/creds\ in\ here\!
  ```
- **Credentials:** `level6_54848` : `622023`

---

### Level 6 -> Level 7: Environment Variables
- **Hint/README:** *"I saw a secret key in an environment variable :o"*
- **Solution:**
  Inspect system environment variables to locate the key:
  ```bash
  printenv
  ```
  Found: `SECRET_KEY=wowlinuxisreall1lllycool`. Pass this secret key as an argument to the executable script:
  ```bash
  chmod +x creds_level7
  ./creds_level7 wowlinuxisreall1lllycool
  ```
- **Credentials:** `level7_54848` : `6d818e`

---

### Intermediate Milestone: Flag 1
At Level 7, the README hints: *"Oh no ive been hacked and my files have been base64 encoded. also, there's a flag thingy at the root. what could that be?"*

Check permissions on `/flag_1.txt`:
```bash
ls -l /flag_1.txt
# -rwxr-----. 1 root level7 29 flag_1.txt
cat /flag_1.txt
```

> **Flag 1:** `osu{11NUX_54V3D_MY_M4rr14g3}`

---

### Level 7 -> Level 8: Base64 Decoding
- **Solution:**
  `creds_level8.txt` contains a Base64-encoded string:
  ```bash
  cat creds_level8.txt | base64 --decode
  # NextUser: level8_54848 Password: 3fa335
  ```
- **Credentials:** `level8_54848` : `3fa335`

---

### Level 8 -> Level 9: Inspecting Running Processes
- **Hint/README:** *"I think I might've accidentally exposed my password when starting my server. Could you please check for me?"*
- **Solution:**
  Check process tables using `ps aux` and filter for your session suffix (`54848`):
  ```bash
  ps aux | grep "pass"
  ```
  Process Line Output:
  ```text
  runuser -u level8_54848 -- nohup /home/level8_54848/server.sh --username=level9_54848 --password=c91b82
  ```
- **Credentials:** `level9_54848` : `c91b82`

---

### Level 9 -> Level 10: Standard Inspection
- **Solution:**
  Exit vim via `:q` and then read the credential file directly:
  ```bash
  cat creds_level10.txt
  ```
- **Credentials:** `level10_54848` : `3196e5`

---

### Level 10 -> Level 11: Binary String Extraction
- **Hint/README:** *"Woah! A wild executable file! I wonder if it has any STRINGS in it..."*
- **Solution:**
  Extract printable text strings embedded inside the compiled ELF binary `creds_level11`:
  ```bash
  strings creds_level11 | grep -E "user|password"
  ```
- **Credentials:** `level11_54848` : `aefb65`

---

### Level 11 -> Level 12: Vim Swap Artifact Recovery
- **Hint/README:** *"Oh, no! My computer crashed while I was writing down the next credentials!"*
- **Solution:**
  `creds_level12.txt` is empty, but uncommitted changes persist in the Vim swap file (`.creds_level12.txt.swp`):
  ```bash
  ls -a
  cat .creds_level12.txt.swp
  ```
- **Credentials:** `level12_54848` : `191ac4`

---

### Level 12 -> Level 13: Local Network Service Queries
- **Hint/README:** *"localhost is serving something really cool on port 54848. How can I reach it from the command line?"*
- **Solution:**
  Query the local HTTP listener via `curl`:
  ```bash
  curl http://localhost:54848
  ```
- **Credentials:** `level13_54848` : `49e64b`

---

### Level 13 -> Level 14: Archive Extraction
- **Hint/README:** *"Oops! All compressed tar archive!"*
- **Solution:**
  Decompress the gzipped tar archive:
  ```bash
  tar -xf compressed_creds_level14.tar.gz
  cat creds_level14.txt
  ```
- **Credentials:** `level14_54848` : `77ccf5`

---

### Penthouse: Flag 2
- **Hint/README:** *"You made it to the penthouse! What's in /flag_2.txt?"*
- **Solution:**
  Read the final flag file from root:
  ```bash
  cat /flag_2.txt
  ```

> **Flag 2:** `osu{N0_l0N63r_A_11NUX_L4rP3r}`