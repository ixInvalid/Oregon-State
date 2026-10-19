# super_secret_secure_secrets

- **Category:** Reverse Engineering
- **Target:** `nc super-secret-secure-secrets.ctf-league.osusec.org 1303`
- **Binary:** `challenge`
- **Architecture:** ELF 64-bit LSB PIE, x86-64, Dynamically Linked, Stripped

---

## Core Concepts Covered

1. **Binary Inspection:** Identifying an ELF executable and extracting embedded strings using `file` and `strings`.
2. **Static Analysis:** Using Ghidra to inspect a compiled binary without its original source code.
3. **Cross-References:** Finding where hardcoded strings are accessed by the program.
4. **Decompilation:** Reading reconstructed C-like pseudocode to understand program logic.
5. **XOR Encryption:** Reversing a byte-wise XOR transformation to recover a hardcoded password.

---

## Challenge Overview

Challenge provides a password vault that claims its password is secure because the original source code was discarded after compilation.

Connecting to the service displays a password prompt:

```text
This is your super secret secure safe
password vault. Keep it secure by using
a secret and safe password that is tots
not hardcoded anywhere. Good luck!

Please input the super secret secure safe secret password:
```

Goal is to reverse engineer the supplied binary, recover the expected password, and authenticate to the remote service.

---

## 1. Identifying the Binary

### 1. Inspecting the File Type

First step is to identify the executable format using `file`:

```bash
file challenge
```

Output:

```text
challenge: ELF 64-bit LSB pie executable, x86-64,
version 1 (SYSV), dynamically linked,
interpreter /lib64/ld-linux-x86-64.so.2,
BuildID[sha1]=26d613f9f848e6774ca65442309b060d84166c01,
for GNU/Linux 3.2.0, stripped
```

Identifies the file as a 64-bit Linux ELF executable using the x86-64 architecture.

Binary is has been **stripped**, meaning many original function and debugging symbols have been removed. This makes reverse engineering more challenging because the original source-level names are unavailable.

### 2. Extracting Embedded Strings

Next, I used `strings` to extract readable text from the executable:

```bash
strings -a challenge
```

Among the output were the following strings:

```text
Please input the super secret secure safe secret password:
Invalid Input. Try again:
You entered:
7k5819Q4602x7
t_[lVLbGEDzID
womp womp
flag.txt
```

Two unusual 13-character strings were particularly interesting:

- `7k5819Q4602x7`
- `t_[lVLbGEDzID`

Since the challenge involves password validation, these strings were potential clues to how the password was checked.

Binary also contained `flag.txt`, suggesting that a file-reading operation may occur somewhere in the program.

---

## 2. Analyzing the Binary in Ghidra

### 1. Importing the Executable

I opened Ghidra on macOS, created a new project, imported `challenge`, and ran the automatic analysis.

Ghidra identified the executable as an ELF binary and populated the Listing, Symbol Tree, and Decompiler windows.

Because the executable was stripped, many functions had automatically generated names such as `FUN_00102ab2` rather than their original source names.

### 2. Finding the Hardcoded Strings

I opened **Window → Defined Strings** and searched for the two suspicious strings found using `strings`.

Selecting `7k5819Q4602x7` showed two references to its address, while `t_[lVLbGEDzID` had four references.

Cross-references helped identify the functions that used the strings.

In Ghidra, a cross-reference (XREF) shows where an address is referenced by another instruction. Following these references is useful for tracing how hardcoded data is used by a program.

### 3. Locating the Password Validation Function

Following the references led to the function at `0x00102c83`, which I examined in the Decompiler window.

Reconstructed pseudocode was:

```cpp
bool FUN_00102c83(undefined8 param_1)
{
    char cVar1;
    bool bVar2;
    string local_48[32];
    undefined8 local_28;
    char *local_20;

    local_20 = "t_[lVLbGEDzID";
    local_28 = 0xd;

    cVar1 = FUN_00102bdf(param_1, 0xd);

    if (cVar1 == '\0') {
        FUN_00102ab2(local_48, param_1);
        cVar1 = FUN_00102c08(local_48, local_20);
        bVar2 = cVar1 == '\0';
        std::__cxx11::string::~string(local_48);
    }
    else {
        bVar2 = false;
    }

    return bVar2;
}
```

Function uses the hardcoded string `t_[lVLbGEDzID` and calls several helper functions.

Call to `FUN_00102bdf` passes the input and the value `0xd` (decimal 13). If this helper returns zero, the program proceeds to call `FUN_00102ab2`, passing the input and a string buffer. Resulting string is then passed to `FUN_00102c08` alongside the hardcoded string.

We can see this ndicates that the input undergoes a transformation before the final comparison. Exact behavior of the helper functions can be determined by inspecting their decompiled implementations.

---

## 3. Reversing the Password Transformation

### 1. Inspecting the Transformation Function

Following the call to `FUN_00102ab2` revealed the function responsible for constructing a transformed string.

Its decompiled pseudocode contains the following operations:

```cpp
std::__cxx11::string::string(param_1);

local_28 = &local_29;
FUN_00102fae(local_58, "7k5819Q4602x7", &local_29);
FUN_0010307c(&local_29);
```

Function initializes a string and constructs another string using the hardcoded value `7k5819Q4602x7`.

Inside a loop, it retrieves a byte from the input and a byte from the hardcoded string. Important operation is:

```cpp
std::__cxx11::string::operator+=(
    param_1,
    *pbVar2 ^ bVar1
);
```

`^` operator represents bitwise XOR.

Function therefore appears to build a new string by XORing corresponding bytes from the input and the hardcoded string, then appending the results.

### 2. Understanding XOR

XOR is reversible because applying the same value twice cancels it out:

(A ⊕ B) ⊕ B = A

If the program checks whether the transformed input matches a known string, the original input can be recovered by XORing that expected result with the same hardcoded value.

Two strings identified during analysis are:

```text
Hardcoded Value:  7k5819Q4602x7
Comparison Vsalue: t_[lVLbGEDzID
```

Candidate password can be calculated as:

password[i] = comparison[i] ⊕ hardcoded[i]

### 3. Recovering the Password with Python

I used Python to reproduce the XOR operation:

```python
key = b"7k5819Q4602x7"
expected = b"t_[lVLbGEDzID"

password = bytes(
    a ^ b for a, b in zip(expected, key)
)

print(password.decode())
```

Output:

```text
C4nTgu3sstH1s
```

Because XOR is its own inverse, this calculation reverses the transformation and produces the candidate password.

---

## 4. Verifying the Password

I connected to the remote service:

```bash
nc super-secret-secure-secrets.ctf-league.osusec.org 1303
```

At the password prompt, I entered the recovered candidate:

```text
C4nTgu3sstH1s
```

Service accepted the password, confirming that the recovered value was correct.

Flag 1
`osu{5up3r_s3cre1_4nd_s3cur3}`