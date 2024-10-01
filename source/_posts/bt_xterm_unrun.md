---
title: 宝塔终端异常
date: 2024-09-17 18:00:00
categories:
  - 技术
  - 问题天带你
tags:
---

## 宝塔终端异常
### 详细错误
我最近注意到宝塔面板的终端功能似乎出现了异常。当我尝试打开终端时，界面显示如下图所示。
![Img](/images/img_20241001221158_1.png)

### 分析
起初，我便转而使用腾讯云的原生终端进行操作。但不久后，我感觉事情有些不妥，似乎某处必有蹊跷。于是，我启动了开发人员工具，检查了网络状态，一切正常。进一步审视控制台，我发现了web socket无法正常工作的问题。
![Img](/images/img_20241001222046_2.png)


我对此感到困惑，不解为何web socket会出现问题。我突然意识到可能是因为我在宝塔面板与服务器之间增设了一层nginx，其架构如下图所示。
![Img](/images/img_20241001222307_3.png)
我开始怀疑，这是否与我配置的nginx有关，或许它未能正确支持web socket。如下是我的nginx配置

```
location / {
    proxy_pass http://127.0.0.1:8888;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
access_log  /www/wwwlogs/access.log;
```

### 解决方案
我向AI寻求帮助，AI建议如果nginx需要支持web socket，则必须添加以下四项配置。

```
# WebSocket 支持
proxy_http_version 1.1;  # 使用 HTTP/1.1
proxy_set_header Upgrade $http_upgrade;  # 设置 Upgrade 头部
proxy_set_header Connection "upgrade";  # 设置 Connection 头部为 upgrade

# 为 WebSocket 设置更长的超时时间，防止连接过早关闭
proxy_read_timeout 600s;
```
配置的解释如下
- proxy_http_version 1.1：WebSocket 需要 HTTP/1.1，因为 HTTP/1.0 不支持 Upgrade 头部。
- proxy_set_header Upgrade $http_upgrade 和 proxy_set_header Connection "upgrade"：这两行配置确保了 HTTP 到 WebSocket 的协议切换能够正确处理。
- proxy_read_timeout 600s：增加了读取超时时间，以防 WebSocket 连接在长时间无数据交换时被关闭。
添加上如上配置之后，宝塔终端恢复正常。
![Img](/images/img_20241001222942_4.png)





