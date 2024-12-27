---
title: Dify架构
date: 2024-12-27 13:38:02
---
Dify 包括 3 个业务服务组件 api / worker / web (Frontend)，以及 6 个基础组件 vector db / db / redis / nginx / ssrf_proxy / sandbox。
![Img](/images/img_20241227133934_1.png)

#### dify-web：
- 只用来返回前端页面，负载比较小
#### dify-api
- 基于 python flask 框架，flask是轻量级 Web 应用框架，dify大部分请求都会打到这个节点上。此节点挂掉会导致dify不可用。
#### dify-worker
- 基于 python Celery 框架，用于处理异步任务和调度任务，类似于xxl-job，挂掉了重启就可以了。异步处理后台任务，如数据处理、文件转换或批量操作。
#### dify-sandbox
- dify-sandbox是一个代码运行环境，支持多种编程语言，包括Python、Nodejs等，用户在Dify Workflow中使用到的如Code节点、Template Transform节点、LLM节点的Jinja2语法、Tool节点的Code Interpreter等都基于DifySandbox运行。
#### dify-ssrf-proxy：
- 正向代理节点，类似于nginx，sandbox节点向外部的请求都需要经过该节点，防止sandbox内不运行的代码进行ssrf攻击。