---
title: Git使用多个SSH密钥访问不同服务器
date: 2024-11-05 15:50:09
categories:
  - 技术
  - 工具
tags:
---
要配置 Git 以使用不同的 SSH 密钥访问不同的服务器（如 GitHub 和 GitLab），你可以通过 SSH 配置文件来指定每个服务器使用的密钥。这样做可以帮助你管理多个 SSH 密钥，并确保每次连接到特定的服务器时都使用正确的密钥。

### 步骤 1: 生成 SSH 密钥（如果尚未生成）

如果你还没有为 GitHub 和 GitLab 创建 SSH 密钥，可以按照以下步骤生成它们：

```bash
# 为 GitHub 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/id_rsa_github

# 为 GitLab 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/id_rsa_gitlab
```

这些命令将为每个服务创建一个独立的密钥对，并存储在 `~/.ssh` 目录下。

### 步骤 2: 将公钥添加到 GitHub 和 GitLab

接下来，需要将生成的公钥添加到相应的服务中。

- 将 `~/.ssh/id_rsa_github.pub` 文件的内容添加到 GitHub 账户的 SSH keys 中。
- 将 `~/.ssh/id_rsa_gitlab.pub` 文件的内容添加到 GitLab 账户的 SSH keys 中。

### 步骤 3: 配置 SSH

在你的 `~/.ssh` 目录中创建或编辑 `config` 文件，以指定每个主机使用的密钥：

```bash
# GitHub SSH 配置
Host github.com
  User git
  IdentityFile ~/.ssh/id_rsa_github
  IdentitiesOnly yes

# GitLab SSH 配置
Host gitlab.com
  User git
  IdentityFile ~/.ssh/id_rsa_gitlab
  IdentitiesOnly yes
```

在这个配置中：

- `Host` 是你用来在命令行中引用的别名。
- `HostName` 是实际的域名。
- `User` 通常是 `git`。
- `IdentityFile` 指向特定的私钥文件。
- `IdentitiesOnly yes` 确保 SSH 只使用指定的密钥。

### 步骤 4: 测试 SSH 连接

确保配置正确无误，可以测试 SSH 连接：

```bash
# 测试 GitHub 连接
ssh -T git@github.com

# 测试 GitLab 连接
ssh -T git@gitlab.com
```

这些命令应该返回一条消息`Welcome to GitLab`，已成功认证，否则会弹出输入密码，如果弹出输入密码请检查上边几个步骤的正确性，或者使用如下命令查看连接过程。
```bash
# 测试 GitHub 连接
ssh -vT git@github.com

# 测试 GitLab 连接
ssh -vT git@gitlab.com
```

### 步骤 5: 使用 Git

现在，当你使用 Git 与 GitHub 或 GitLab 交互时，SSH 会自动根据你访问的主机使用正确的密钥。你无需进行任何特别的 Git 配置，只需确保使用正确的仓库 URL 即可。

通过以上步骤，你可以为不同的 Git 服务配置不同的 SSH 密钥，使工作流程更加安全和高效。

### 问题
##### 在第一次使用返回 `The authenticity of host  can't be established`
```bash
The authenticity of host can't be established. ED25519 key fingerprint is SHA256:xxxxxxxxx. This key is not known by any other names. Are you sure you want to continue connecting (yes/no/[fingerprint])?
```
SSH 客户端正在尝试首次连接到一个 SSH 服务器，但是这个服务器的 SSH 密钥尚未被你的客户端认可或记录。这个消息是一个是否确实是你尝试连接的服务器的正确指纹。这通常涉及到与系统管理员或通过其他安全渠道（如内部文档、安全邮箱等）确认指纹是否正确。
1. 验证指纹：首先，你需要验证显示的指纹是否确实是你尝试连接的服务器的正确指纹。这通常涉及到与系统管理员或通过其他安全渠道（如内部文档、安全邮箱等）确认指纹是否正确。
2. 确认连接：
    - 如果指纹正确，你可以输入 yes 继续连接。这将把服务器的 SSH 密钥添加到你的 ~/.ssh/known_hosts 文件中，以后连接到此服务器时就不会再显示这个警告。
    - 如果指纹不正确或你不确定，选择 no 并进一步调查为什么会有指纹不匹配的情况发生。这可能是因为服务器的 SSH 密钥已经更换，或者可能是存在安全风险。

