---
title: NPM Unsupported URL Type link 问题
date: 2024-09-13 18:00:00
categories:
  - 技术
  - 技术甜点
tags:
  - npm
---
## NPM Unsupported URL Type link 问题
### 详细错误
npm install 执行过程中出现以下错误
```
npm ERR! code EUNSUPPORTEDPROTOCOL
npm ERR! Unsupported URL Type "link:": link:./scripts/eslint-plugin
npm ERR! A complete log of this run can be found in:
```
![Img](/images/img_20240914154435_1.png)
### 解决方案
使用npm替代pnpm，我思考本身就应该用pnpm，npm 应该是不支持这种方式
### 解决过程
我在构建GitHub博客时遇到了一些技术难题。本博客基于Node.js开发的Hexo框架，需借助npm等工具进行包管理与代码编译。虽然我已在本地成功搭建了Hexo项目，并通过GitHub Action顺利完成了构建与发布，但本地环境中的npm install命令却屡遭挫败，错误信息显示npm不支持链接本地文件。
![Img](/images/img_20240914154702_2.png)
我怀疑是本地的npm或node版本有误，GitHub Action能够无障碍执行该命令。于是我尝试了从Node 16升至Node 20的多个版本，却仍旧无法解决问题。进一步的探索让我将NPM从8.x版本升级至10.x，但问题依旧。查阅众多资料后，大部分意见认为NPM不支持此类链接方式，尽管也有少数不同的声音。

差了很多这种问题的资料，发现有建议将链接依赖的方式进行修改，但这在我的项目中并不可行，因为相关的地址与包信息无从找起。此外，也有建议使用yarn打包或采用PNPM替代NPM。经过尝试，我发现PNPM在包构建和依赖拉取上速度很快，最终顺利解决了问题。

我作为一个小白查了一下 npm和pnpm的关系：
- 1 npm：作为Node.js的官方包管理工具，自Node.js问世以来便广泛应用于项目依赖管理和包安装。
- 2 pnpm：则是为了提供更高效的包管理方案而开发的npm替代品，它通过硬链接和符号链接的方法，有效节约磁盘空间并加速安装过程。

最终，使用pnpm，我的安装与构建过程变得异常流畅，问题得以圆满解决。