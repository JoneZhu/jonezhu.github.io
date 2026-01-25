---
title: 接口超时问题排查
date: 2026-01-26 01:24:16
categories:
  - 技术
  - 问题甜点
---

### 客户端错误日志
>  
[21:55:41] [WARN] [VideoApi] GET request to /video/wait-download timeout after 30 seconds

### 初步排查
A同事和B同事在北京都遇到了这个问题，我在保定没有遇到这个问题，所以基本判断是北京到上海的网络出现了问题。那么需要验证这个问题
1. 从网络上没差到相关公告，并且反馈给阿里云，阿里云告知并未出现
2. A同事的 ping 信息正常
3. traceroute -n 47.101.156.168  信息也正常
开始陷入了僵局，开始猜测怀疑方向错误，登陆A同事的账号，发现遇到类似问题，开始感觉不是网络的问题
### 定位问题
1. 那么请求到底有没打到nginx上呢？ 连上nginx 服务器，查看 nginx 日志，发现关键信息

>  
2026/01/25 16:07:40 [warn] 9#9: *1889 an upstream response is buffered to a temporary file /var/cache/nginx/proxy_temp/0/06/0000000060 while reading upstream, client: 101.19.115.189, server: api.xxxxx.com, request: "GET /api/v2/xxxx/xxxx HTTP/1.1", upstream: "http:///api/v2/xxxxx", host: "api.like-sports.com"

2. 问了下AI，AI的答复如下，那么说明该情况会影响性能，所以应该不是这里的问题，那么确实也没其他地方可以怀疑，所以按照AI的建议改缓存大小，问题解决

>  
我分析了这个警告信息。这个警告表明 /api/v2/xxx 接口返回的响应太大,超过了 Nginx 的代理缓冲区大小,导致 Nginx 将响应数据临时写入磁盘文件。这会影响性能。 问题原因:

### 结束
虽然写磁盘文件虽然影响性能，应该也不致于30s 搞不定， 灵光一闪想到，这个nginx 是基于docker ，应该是没有挂在临时文件存储的位置，导致临时文件写不进去，然后超时了。