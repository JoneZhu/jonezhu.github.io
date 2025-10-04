---
title: 多module下Maven打包异常
date: 2024-11-19 14:10:22
categories:
  - 技术
  - 问题甜点
tags:
---
#### 问题现象
在A服务的打包过程中出现以下错误：
```
[ERROR] Failed to execute goal on project oms-service: Could not resolve dependencies for project com.tem:oms-service:jar:1.1.2-SNAPSHOT: Failed to collect dependencies at com.tem:tem-cbp-api:jar:1.1.7-SNAPSHOT: Failed to read artifact descriptor for com.tem:tem-cbp-api:jar:1.1.7-SNAPSHOT: Could not transfer artifact com.tem:tem-cbp:pom:${revision} from/to tojoy-mall (http://0.0.0.0:8081/repository/maven-public/): Failed to transfer file: http://10.98.66.231:8081/repository/maven-public/com/tem/tem-cbp/$%7Brevision%7D/tem-cbp-$%7Brevision%7D.pom. Return code is: 400 , ReasonPhrase:Invalid repository path. -> [Help 1]
```
![Img](/images/img_20241119141821_1.png)

#### 根本原因
从错误信息来看，是由于无法在maven仓库中找到文件 `http://0.0.0.0:8081/repository/maven-public/com/tem/tem-cbp/$%7Brevision%7D/tem-cbp-$%7Brevision%7D.pom` 导致的问题。在maven仓库中确实找不到该文件，从文件名也可以看出，这并非一个标准的maven包。为何A服务的编译需要下载此文件呢？观察这似乎是一个pom文件，应与tem-cbp项目相关。然而，A服务只依赖于tem-cbp-api包。于是，下载了tem-cbp-api.jar并解压后发现，tem-cbp-api的pom内容如下：

![Img](/images/img_20241119142549_3.png)
从中可以分析出tem-cbp-api依赖于tem-cbp.pom，因此在maven仓库中下载这个文件是合理的。然而，这里的`<version>${revision}</version>`是否正确呢？通过对比法，下载了一个正常的jar包并解压后发现，其中不存在`${revision}`的情况。于是手动替换了`${revision}`为`<version>1.1.7-SNAPSHOT</version>`。
![Img](/images/img_20241119142609_4.png)
然后再次尝试对A服务进行打包，发现问题已解决。基本可以确定问题的根本原因是子模块的版本号没有正确替换导致的，问题应该出在maven方面。
#### 解决方案
解决方案相对简单，即升级本地的maven版本。检查本地maven版本为`apache-maven-3.3.3`，升级至下一个稳定版本 `apache-maven-3.6.3`，重新打包编译，问题解决。



