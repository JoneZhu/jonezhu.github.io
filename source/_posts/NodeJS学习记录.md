---
title: 快速熟悉NodeJS
date: 2024-10-06 21:03:32
categories:
  - 技术
  - 语言
tags:
---
## 背景 
- 鉴于需要频繁浏览Github上的NodeJS开源项目，产生了学习NodeJS的需求。作为一位精通Java的资深开发者，所以无需从零开始掌握NodeJS。那么应该学习哪些内容呢？首先我要看代码是如何组织的，所以代码的目录结构我要能够看懂，其次那种完全不存在于Java语言上的特点，影响我阅读代码的部分我也要搞明白，当然那些特别高级很少在项目中使用的语言特性我认为优先级也不高。
- 在开始之前我们先探讨几个常见的问题你
    - NodeJS的设计理念
    - Go和NodeJS如何选择
## 语言的设计理念
NodeJS的作者说，他创造NodeJS的目的是为了实现高性能Web服务器，他首先看重的是事件机制和异步IO模型的优越性，而不是JS。但是他需要选择一种编程语言实现他的想法，这种编程语言不能自带IO功能，并且需要能良好支持事件机制。JS没有自带IO功能，天生就用于处理浏览器中的DOM事件，并且拥有一大群程序员，因此就成为了天然的选择。
## 语言的选择
- node和go的技术栈深度其实是差不多的，不存在node比go难，也不存在go比node难。其次语言负责具体实现，影响的是开发效率和维护成本，对大部分业务架构没有直接影响，因为现在是微服务时代。别扯性能问题，除非是cpu密集型，否则node各方面都不差。综上，我们关注语言对软件工程的影响。go的特点是把研发当作流水线的工人，没有发挥的余地，大佬和菜鸡写的代码维护性不会有特别大的差别。node加ts，外加各种npm工具链，项目维护性和优雅程度取决于团队内最高的几个员工，他们厉害，那么项目就好维护好开发。总的来说，go项目代码上限低，下限高。node项目代码上限高，下限低。
- 如果我是不怎么碰代码的管理者，比如技术总监或者CTO级别，我会让我的项目用go，因为招聘比node稍微好招点，而且节省服务成本，如果我是大头兵或者基层技术Leader，我会选node+nest，因为语法糖多，开发速度快，好维护，而且我的技术实力有信心参与开发维护好node项目。
## NodeJS目录结构
### 基本目录结构
- `/node_modules` - 这个目录包含所有的项目依赖库。这些依赖是通过 npm 或 yarn 这样的包管理工具安装的。通常不会把这个目录加入到版本控制系统（如 Git）中。
- `/src` - 这个目录包含所有的源代码。在大型项目中，这个目录下会有更详细的结构来组织不同类型的代码文件（如模型、服务、控制器等）。
- `/dist` 或 `/build` - 这是项目构建后的输出目录，通常包含经过转译（如 TypeScript 到 JavaScript）、压缩或其他构建步骤处理后的代码。这个目录的内容是用于生产环境的。
- `/test` - 包含所有测试代码和测试资源。这些测试可以是单元测试、集成测试或端到端测试。
- `/public` - 如果项目是一个 web 应用，这个目录通常用于存放静态文件，如 HTML、CSS、前端 JavaScript 文件和图片等。
- `/views` - 如果使用了模板引擎（如 EJS、Pug 等），这个目录用于存放模板文件。

### 核心文件
- `package.json` - 这是一个重要的文件，定义了项目的元数据、项目依赖、脚本、版本等信息。通过这个文件，npm 或 yarn 可以安装所有必要的包。
- `package-lock.json` 或 `yarn.lock` - 这些文件锁定了依赖的版本，确保项目在不同环境中的一致性。
- `.gitignore` - 这个文件用于 Git 版本控制，指定不应上传到 Git 仓库的文件或目录。
- `README.md` - 通常包含项目的说明、安装指南、使用方法等。
- `server.js` 或 `app.js` - 这通常是应用程序的入口文件，包含了启动服务器的代码。
### 配置文件
- `.env` - 存放环境变量的文件，通常用于存储敏感信息，如数据库密码、API 密钥等，不应该被加入到版本控制系统。
- `webpack.config.js`、`babel.config.js` - 如果使用了 Webpack、Babel 等工具，这些文件用于配置这些工具
- `tsconfig.json` - 如果项目使用 TypeScript，这个文件用于配置 TypeScript 编译器选项。
### 示例目录结构
以下是一个简单的 Node.js 项目目录结构示例：
```
/my-node-project
|-- node_modules/
|-- src/
|   |-- controllers/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   `-- index.js
|-- dist/
|-- test/
|-- public/
|-- views/
|-- package.json
|-- package-lock.json
|-- .gitignore
|-- README.md
`-- server.js
```
## 语言特性
### 模块和包
#### 重要概念
- 模块：在NodeJS中，一般将代码合理拆分到不同的JS文件中，每一个文件就是一个模块，而文件路径就是模块名。
- 主模块：通过命令行参数传递给NodeJS以启动程序的模块被称为主模块。主模块负责调度组成整个程序的其它模块完成工作。例如通过以下命令启动程序时，main.js就是主模块。`$ node main.js`
- 包：JS模块的基本单位是单个JS文件，但复杂些的模块往往由多个子模块组成。为了便于管理和使用，我们可以把由多个子模块组成的大模块称做包，并把所有子模块放在同一个目录里。
- 第三方包： 由第三方提供的一组模块，类似于放在maven仓库中的jar
#### 如何引入一个第三方包
- 安装包：使用 npm install 命令来安装一个包。例如，如果你想安装 express 这个流行的 Node.js web 框架 `npm install express`
- 引用包 ： 在你的 JavaScript 文件中通过 require 函数来引用这个包。`const express = require('express');`
### 进程管理
Node.js 服务确实可以构建多进程架构。Node.js 本身是单线程的，它使用事件驱动、非阻塞I/O模型来处理并发，这使得它非常适合处理I/O密集型的应用。然而，对于CPU密集型任务，单个Node.js进程可能不足以充分利用多核CPU的能力。这时，就可以通过多进程架构来提高应用的性能和可扩展性。
#### 何时需要多进程架构
- 1.充分利用多核CPU：最直接的原因是Node.js的单线程特性无法直接利用多核处理器。通过创建多个进程，每个CPU核心可以运行一个Node.js实例，从而提高应用的性能。

- 2.提高应用的可靠性：在单进程模型中，一旦进程崩溃，整个应用都会停止响应。多进程模型可以提高容错性，一个进程的崩溃不会影响到其他进程。

- 3.分离服务组件：在微服务架构中，可以通过多进程的方式运行不同的服务，这样每个服务可以独立部署和扩展，互不影响。
#### 如何实现多进程架构
- 1. Cluster 模块：
Node.js 的 Cluster 模块允许简单地创建共享服务器端口的子进程。这个模块可以让Node.js的主进程（master process）自动地将传入的网络连接分发给子进程（worker processes），这样每个子进程都可以并行处理请求。

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  // 工作进程可以共享任何TCP连接。
  // 在本例子中，它是一个HTTP服务器
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('你好世界\n');
  }).listen(8000);

  console.log(`工作进程 ${process.pid} 已启动`);
}

```
- 2. Child Process 模块：这个模块可以用来创建和控制子进程。每个子进程都有自己的内存空间和V8实例。你可以用它来运行一些需要隔离处理的CPU密集型任务。
- 3. Worker Threads 模块：对于需要执行背景任务或者不想通过进程间通信处理复杂数据共享的场景，可以使用 Worker Threads。这是一个相对较新的方式，允许在单个Node.js进程内部创建多个线程。


### 事件机制
- 事件机制对开发者并是透明的
- Node.js 的事件机制基于事件驱动架构，核心思想是“异步非阻塞I/O”。这种架构允许 Node.js 在处理大量并发连接时保持高效，同时不需要为每个连接创建大量的线程，从而减少资源消耗。Node.js 的事件机制主要依赖于几个关键组件：事件循环（Event Loop）、观察者（Observers）、事件队列（Event Queue）和事件触发器（Event Emitter）。
####  1. 事件循环（Event Loop）
事件循环是 Node.js 的心脏，负责协调所有异步操作。它允许 Node.js 执行非阻塞I/O操作——尽管JavaScript是单线程的，但事件循环可以处理多个操作。它在内部使用不同的观察者来监视不同类型的事件（如文件I/O、网络通信等）。
事件循环的工作流程大致如下：
- 检查是否有待处理的异步I/O或定时器，如果有，执行相应的回调。
- 执行微任务队列中的回调，如 Promise 的 .then() 或 .catch()。
- 更新内部的观察者状态，准备下一次循环。

#### 2. 观察者（Observers）
观察者在事件循环中监视特定类型的事件。例如，文件系统观察者会监视文件相关操作的完成，网络观察者会监视网络请求。当一个操作完成时，观察者会将一个事件及其回调放入事件队列中。
#### 3. 事件队列（Event Queue）
事件队列是一个按顺序存储事件的队列。事件循环不断检查这个队列，当发现队列中有事件时，取出事件并执行其回调函数。这保证了事件的处理是有序的，即使它们可能是异步发生的。
#### 4. 事件触发器（Event Emitter）
Node.js 使用事件触发器模式来处理事件。events 模块提供了 EventEmitter 类，它是所有能够发射事件的对象的基础。模块、函数或任何其他对象可以继承 EventEmitter，获得发射和监听事件的能力。
例如，创建一个简单的事件触发器可能如下所示：

```
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('An event occurred!');
});

myEmitter.emit('event');
```
在这个示例中，我们创建了一个 MyEmitter 类的实例，它继承自 EventEmitter。我们订阅了一个名为 event 的事件，并定义了一个简单的回调函数。然后，我们通过调用 emit 方法触发了 event 事件，导致打印出 "An event occurred!"。
### 异步编程
- NodeJS最大的卖点——事件机制和异步IO，对开发者并不是透明的。开发者需要按异步方式编写代码才用得上这个卖点，而这一点也遭到了一些NodeJS反对者的抨击。但不管怎样，异步编程确实是NodeJS最大的特点，没有掌握异步编程就不能说是真正学会了NodeJS。本章将介绍与异步编程相关的各种知识。
- 关于异步编程可以参考[七天学会NodeJS](https://nqdeng.github.io/7-days-nodejs/#6) 我这里就不搬运了。
## 引用资料
- [nodejs和go的语言选择](https://www.zhihu.com/question/583192972/answer/2888081409)
- [七天学会NodeJS](https://nqdeng.github.io/7-days-nodejs/)
