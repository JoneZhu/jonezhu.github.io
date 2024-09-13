---
title: Git中的submodule
date: 2024-09-13 18:00:00
categories:
  - 技术
  - 工具
tags:
  - git
  - 编程
---
## Git中的submodule
### 背景
今天在使用github action 的过程中遇到一个问题，错误的内容是“No url found for submodule path 'themes/stellar' in .gitmodules”，虽然我使用git已经有七八年了，但是submodule我基本上没有接触。所以我想顺便了解下git的submodule。
![Img](source/images//img_20240913210658_1.png)
submodule适用于什么样子的问题呢？
在大型项目中，通常需要将代码根据功能拆分成不同的子模块，主项目依赖于这些子模块，但不需要关心子模块的内部开发细节。因此，所有源码并不总是放在同一个Git仓库中。
### 使用`submodule`的优势
使用`submodule`功能可以建立主项目与子模块之间的依赖关系，包括子模块路径、远程仓库地址和版本号。这与简单地将子模块文件夹加入到`.gitignore`文件中不同，后者需要用户有先验知识，知道在当前目录下放置子模块的特定版本代码。
### 使用流程

文章以两个示例项目`project-main`（主项目）和`project-sub-1`（子模块项目）来说明如何使用`submodule`。

1. **创建子模块**：在主项目`project-main`中，使用`git submodule add <submodule_url>`命令添加子模块`project-sub-1`。
2. **添加后的变化**：执行命令后，主项目仓库中会新增`.gitmodules`文件和子模块目录`project-sub-1`。`.gitmodules`文件记录了子模块的相关信息，如路径和URL。
3. **提交变更**：通常在添加子模块后，需要提交一次变更，以记录引入了某个子模块。

### 结果

提交后，主项目仓库会显示子模块文件夹，并标记子模块所在的仓库版本号。文章还提供了相关的截图，展示了添加子模块后的仓库状态。

总结来说，Git的`submodule`功能允许在主项目中引入并管理子模块，同时保持子模块的独立性和版本控制，这对于大型项目的协作开发非常有用。