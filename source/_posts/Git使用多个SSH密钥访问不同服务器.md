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
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_github
  IdentitiesOnly yes

# GitLab SSH 配置
Host gitlab.com
  HostName gitlab.com
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

这些命令应该返回一条消息，确认你已成功认证，但 Git 不提供 shell 访问。

### 步骤 5: 使用 Git

现在，当你使用 Git 与 GitHub 或 GitLab 交互时，SSH 会自动根据你访问的主机使用正确的密钥。你无需进行任何特别的 Git 配置，只需确保使用正确的仓库 URL 即可。

通过以上步骤，你可以为不同的 Git 服务配置不同的 SSH 密钥，使工作流程更加安全和高效。