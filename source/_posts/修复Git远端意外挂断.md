---
title: 修复Git远端意外挂断
date: 2024-10-03 20:17:00
categories:
  - 技术
  - 问题甜点
tags:
---
今天在执行命令 git push 时，终端报了下面的错误:

```
枚举对象中: 25, 完成.
对象计数中: 100% (25/25), 完成.
使用 12 个线程进行压缩
压缩对象中: 100% (20/20), 完成.
error: RPC 失败。HTTP 400 curl 22 The requested URL returned error: 400
send-pack: unexpected disconnect while reading sideband packet
写入对象中: 100% (20/20), 1.29 MiB | 1.99 MiB/s, 完成.
总共 20（差异 8），复用 0（差异 0），包复用 0
fatal: 远端意外挂断了
Everything up-to-date
```
Google了一下，应该是Buffer太小的原因，使用下面的命令修复后就可以正常 git push 了。

```
git config http.postBuffer 100000000
git config ssh.postBuffer 100000000
```
