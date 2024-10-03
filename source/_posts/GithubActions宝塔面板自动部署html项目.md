---
title: GithubActions宝塔面板自动部署html项目
date: 2024-10-03 08:17:00
categories:
  - 技术
  - 工具
tags:
  - CI/CD
---
### 前提条件
- 1.有一个 GitHub 账户，并且 HTML 项目已经托管在 GitHub 上。
- 2.已经安装并配置好了宝塔面板，并且有一个可用的网站配置。
- 3.有 SSH 访问权限到托管宝塔面板的服务器。


### 步骤
#### 第一步：在宝塔面板中设置
确保在宝塔面板中已经配置了网站，并知道部署的目标目录。通常，这个目录可能是 `/www/wwwroot/yourdomain.com`。

#### 第二步：生成 SSH 密钥
在本地计算机上生成 SSH 密钥对，用于 GitHub Actions 与服务器进行安全通信。

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```
不要为密钥设置密码。生成后，会得到两个文件：`id_rsa` 和 `id_rsa.pub`。
#### 第三步：配置服务器
- 1.将公钥（`id_rsa.pub`）内容添加到服务器的 `~/.ssh/authorized_keys` 文件中。
- 2.确保 SSH 服务运行，并且能通过 SSH 使用私钥登录到服务器。
#### 第四步：配置 GitHub Secrets
- 1.登录到 GitHub，打开项目。
- 2.点击项目的 Settings > Secrets > Actions。
- 3.添加以下 Secrets：
    - `SSH_PRIVATE_KEY` - 将你的私钥 `id_rsa` 的内容粘贴到这里。
    - `SSH_HOST` - 服务器的 IP 地址或域名。
    - `SSH_USERNAME` - 服务器的 SSH 用户名。
    - `DEPLOY_PATH` - HTML 文件应该部署到的路径，例如 `/www/wwwroot/yourdomain.com`。

#### 第五步：创建 GitHub Action 工作流
在项目根目录下，创建一个 `.github/workflows` 目录，并在该目录中创建一个 YAML 文件，例如 `deploy.yml`：

```
name: Deploy HTML project to Baota Panel

on:
  push:
    branches:
      - main  # 或者你使用的是 master 分支

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up SSH
      uses: webfactory/ssh-agent@v0.5.3
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

    - name: Rsync files
      run: rsync -avz --delete ./ ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }}:${{ secrets.DEPLOY_PATH }}

```
这个工作流会在每次推送到 `main` 分支时触发，使用 SSH 私钥登录到你的服务器，并使用 rsync 同步文件到部署路径。
### 问题1 ： Set Up SSH fail
#### 详细错误如下
![Img](/images/img_20241003092847_1.png)

```
Run webfactory/ssh-agent@v0.5.3
Adding GitHub.com keys to /home/runner/.ssh/known_hosts
Starting ssh-agent
SSH_AUTH_SOCK=/tmp/ssh-XXXXXXXUm3fC/agent.1739
SSH_AGENT_PID=1740
Adding private key(s) to agent
Error loading key "(stdin)": error in libcrypto
Error: Command failed: ssh-add -
Error loading key "(stdin)": error in libcrypto
```

#### 解决思路
从代码 `Error loading key "(stdin)": error in libcrypto` 可大概得知key的格式有问题，重新设置`SSH_PRIVATE_KEY` 解决
### 问题2 ：rsync: connection unexpectedly closed
#### 详细错误信息

```
debug1: read_passphrase: can't open /dev/tty: No such device or address
Host key verification failed.
rsync: connection unexpectedly closed (0 bytes received so far) [sender]
rsync error: unexplained error (code 255) at io.c(231) [sender=3.2.7]
Error: Process completed with exit code 255.
```

![Img](/images/img_20241003093136_2.png)
#### 问题解决
从错误输出内容`rsync: connection unexpectedly closed` 推测是ssh client 连接服务器异常，从详细错误信息中看不出为什么连接异常。
如果说从0到1的过程我们看不出问题在哪里，那么能不能先看看0到0.5是否可以成功，所以在actions 加入测试连接ssh服务器的步骤。
```
- name: Test SSH connection
    run: |
    ssh -o StrictHostKeyChecking=no ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }} "echo 'SSH connection successful'"
```
然后再做测试，错误变为`Error: Process completed with exit code 23.`
那么就说明这个问题已经基本解决了。
#### 为什么加入`Test SSH connection` 连接服务器就成功了呢？ 


### `Error: Process completed with exit code 23.` 问题
#### 详细错误

```
Transferred: sent 5224, received 5916 bytes, in 2.0 seconds
Bytes per second: sent 2592.4, received 2935.8
debug1: Exit status 23
rsync error: some files/attrs were not transferred (see previous errors) (code 23) at main.c(1338) [sender=3.2.7]

sent 585 bytes  received 1,682 bytes  647.71 bytes/sec
total size is 174,544  speedup is 76.99
Error: Process completed with exit code 23.
```
![Img](/images/img_20241003094859_4.png)

#### 问题分析
通过查询资料可得知 `exit code 23 `部分传输成功。志杰看日志也无从得知到底是哪个文件传输失败。只能开启了漫无目的网上搜索资料中，网上对于 `exit code 23` 做了不下8种原因的归纳，没办法直接得知具体传输失败的文件。
在没办法什么好的解决方案下，开始看Rsync 的详细输出日志，日志也比较多有369行。
从头到位的阅读后发现第323行的内容如下

```
rsync: [generator] delete_file: unlink(.user.ini) failed: Operation not permitted (1)
```
再看宝塔该文件的权限是root
![Img](/images/img_20241003095057_5.png)
#### 解决方案
基本定位到了传输失败的文件，那么也比较容易解决，在通过rsync同步文件添加 `--exclude='.user.ini'`，即可解决问题

### 以上问题都解决了，接下来贴一下完整的deploy.yaml

```
name: Deploy HTML project to Baota Panel

on:
  push:
    branches:
      - main  # 或者你使用的是 master 分支

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Check formatted output
      run: |
        echo "Username: ${{ secrets.SSH_USERNAME }}x"
        echo "Host: ${{ secrets.SSH_HOST }}x"
        echo "Path: ${{ secrets.DEPLOY_PATH }}x"
    - name: Checkout code
      uses: actions/checkout@v2
    - name: Set up SSH
      uses: webfactory/ssh-agent@v0.5.3
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
    - name: Test SSH connection
      run: |
        ssh -o StrictHostKeyChecking=no ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }} "echo 'SSH connection successful'"

    - name: Rsync files detail
      run: rsync -avz --delete --exclude '.git/' --exclude '.github/' --exclude 'README.md' --exclude '.gitignore' --exclude='.user.ini' --ignore-errors --partial --verbose --quiet -e "ssh -vvv" ./ ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }}:${{ secrets.DEPLOY_PATH }}
```



