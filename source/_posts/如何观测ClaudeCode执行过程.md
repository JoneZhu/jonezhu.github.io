---
title: 如何观测ClaudeCode执行过程
date: 2026-02-18 16:04:42
categories:
  - 技术
  - 技术甜点
---
### 核心工具
0. mac
1. Proxyman
2. claude code 解析工具

### 抓包原理

![Img](/images/img_20260218173229_1.png)
0. 可能看起来这张图有点复杂，有点乱，是因为在大陆地区，大陆不能直接访问到 claude 的地址，需要通过代理访问。而我们目前的主流 VPN 软件和这个抓包工具 Proxyman 都会去更改系统的代理配置。会导致冲突。经过我若干次的尝试之后，发现Proxyman 本身是支持 VPN。
1. Proxy Man 对于系统的，呃，代理进行管理、变更。同时呢，它也会覆盖掉 VPN 软件对于系统的变更，所以最终生效的呢还是这个，呃，Proxy Man 的配置。 
2. 那么Claude Code 的请求最终都会转发到 Proxyman
3. Proxyman并不是直接发出请求，而是将请求转发到VPN的端口上
### Proxyman 工具的使用
1. 淘宝买一个，很便宜
2. 配置本地 VPN 的端口。
![Img](/images/img_20260218173951_2.png)
3. 打开终端 设置->自动设置->打开新终端
![Img](/images/img_20260218174514_4.png)
4. 在claude中打开项目并进行测试
![Img](/images/img_20260218174645_5.png)
5. 根据域名筛选请求
![Img](/images/img_20260218174405_3.png)
6. 导出
![Img](/images/img_20260218174800_6.png)


### claude code 解析工具的使用
1. 导出之后的内容呢，是一个文件夹。 里边是一个一个的json文件。阅读起来呢比较麻烦，所以这时候需要用到另外一个工具，[CC-Parser ](https://jonezhu.github.io/CC-Parser/)
2. 选中刚才导出的文件夹即可