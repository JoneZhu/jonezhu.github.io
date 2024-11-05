---
title: dubbo ConnectionLoss问题
date: 2024-10-16 21:03:32
categories:
  - 技术
  - 问题甜点
tags:
---

```
2024-10-14 11:39:04,485 ERROR [Curator-Framework-0] [org.apache.curator.framework.imps.CuratorFrameworkImpl] JWECdKFLShu8reZ0CX48NQ - Background retry gave up
org.apache.curator.CuratorConnectionLossException: KeeperErrorCode = ConnectionLoss
	at org.apache.curator.framework.imps.CuratorFrameworkImpl.performBackgroundOperation(CuratorFrameworkImpl.java:1015)
	at org.apache.curator.framework.imps.CuratorFrameworkImpl.backgroundOperationsLoop(CuratorFrameworkImpl.java:986)
	at org.apache.curator.framework.imps.CuratorFrameworkImpl.access$300(CuratorFrameworkImpl.java:97)
	at org.apache.curator.framework.imps.CuratorFrameworkImpl$4.call(CuratorFrameworkImpl.java:376)
	at java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266)
	at java.util.concurrent.FutureTask.run(FutureTask.java)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.access$201(ScheduledThreadPoolExecutor.java:180)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:293)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
2024-10-14 11:39:04,588 WARN [Curator-ConnectionStateManager-0] [org.apache.dubbo.remoting.zookeeper.curator5.Curator5ZookeeperClient] JWECdKFLShu8reZ0CX48NQ -  [DUBBO] Curator zookeeper connection of session 0 timed out. connection timeout value is 3000, session expire timeout value is 60000, dubbo version: 2.7.21, current host: 10.99.0.141
2024-10-14 11:40:05,955 WARN [Curator-ConnectionStateManager-0] [org.apache.curator.framework.state.ConnectionStateManager] JWECdKFLShu8reZ0CX48NQ - Session timeout has elapsed while SUSPENDED. Injecting a session expiration. Elapsed ms: 60444. Adjusted session timeout ms: 60000
2024-10-14 11:42:57,958 ERROR [WebSocketConnectReadThread-147] [com.iplatform.common.router.sync.SyncWebSocketClient]  - websocket 客户端出现异常
java.lang.NullPointerException
```
