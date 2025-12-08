---
title: 在OSS的Bucket中挂载域名和证书
date: 2025-12-07 23:10:36、
categories:
  - 技术
  - 工具
---
当然这个流程足够的简单哈，我也是发现问AI的结果不尽如人意所以记录一下
- 首先是申请免费证书在[SSL后台](https://yundun.console.aliyun.com/?spm=5176.2020520112.console-base_product-drawer-right.dproducts-and-services-cas.5c023efd2NGqSo&p=cas#/certExtend/free/cn-hangzhou?adSearchParams=%7B%22Keyword%22%3A%22%22%2C%22CurrentPage%22%3A1%7D)的个人测试证书Tab页创建证书，可以勾选快捷签发
- 到OSS管理后台的[Bucket列表](https://oss.console.aliyun.com/bucket)点击对应的Bucket，在域名管理中绑定域名，然后点击域名托管，选择第一步申请的证书即可。