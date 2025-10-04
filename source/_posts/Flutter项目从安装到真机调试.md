---
title: Flutter项目从安装到真机调试
date: 2025-02-02 09:20:26
categories:
  - 技术
  - 问题甜点
---
#### 准备
- Mac
- IOS设备（iphone）
#### FlutterSDK安装
##### 将这三条 export 指令附加到首选 shell 使用的 *rc 或 *profile 文件中。类似于下面这样：
```
export PUB_HOSTED_URL="https://pub.flutter-io.cn"
export FLUTTER_STORAGE_BASE_URL="https://storage.flutter-io.cn"
```
##### 下载 Flutter SDK 压缩包
- 至[Flutter SDK 压缩包](https://docs.flutter.cn/release/archive?tab=macos)此地址，下载适配当前机型的FlutterSDK至用户根目录，即“~”下。
- 解压下载的压缩包，解压出来一个flutter 文件夹
- 执行 `export PATH="$PWD/flutter/bin:$PATH"` 并将其添加到  *rc 或 *profile 文件中
- 在 `App Store`中找到 `Xcode` 进行安装
![Img](/images/img_20250202094944_2.png)
- 虽然是真机调试，但是仍然建议安装下 iphone模拟器 `xcodebuild -downloadPlatform iOS` 
- 安装`VS Code`
- 执行flutter 环境健康检查 `flutter doctor`，检查结果如下图所示，注意这里并不要求所有项均检查通过，`Flutter`、`Xcode`、`VS Code`检查通过即可，`Connected device` 也会检查失败，稍后会配置连接真机
![Img](/images/img_20250202095825_3.png)

#### 连接到IOS设备
- 在IOS设备设置->隐私与安全->打开开发者模式
- 使用数据线连接mac，并添加信任
- 在 macOS 上打开 Xcode，选择 Window > Devices and Simulators，确保设备已正确连接
![Img](/images/img_20250202104034_12.png)

#### 创建项目
- 在 `VS Code` 的插件市场中安装`Flutter`插件
![Img](/images/img_20250202102106_4.png)
- `Shift+Command+P` 创建一个空的flutter项目
![Img](/images/img_20250202102330_5.png)
#### 注册账号设置签名
- 打开该地址[Apple Developer](https://developer.apple.com/)
- 点击Account
![Img](/images/img_20250202103053_8.png)
- 使用apple账号登陆/注册即可
![Img](/images/img_20250202103206_9.png)
#### 真机调试
- 在真机调试之前，需要先对Flutter工程签名，打开`Xcode`，点击`Open Existing Project` ，选择刚才所创建项目的`ios`文件夹
![Img](/images/img_20250202103609_10.png)
- 点击`Runner` ，然后选择 Signing & Capabilities 选项卡
- 勾选 Automatically manage signing（自动管理签名）
- 点击 Add Account 添加你的 Apple ID
![Img](/images/img_20250202103835_11.png)
- 在`VS Code`  中点击右下角的设备选择，选择IOS设备
![Img](/images/img_20250202104328_13.png)
- 点击右上角的的调试按钮，应用即完成在IOS上的安装并且弹出提示
![Img](/images/img_20250202105256_14.png)
- 在IOS设备中进行 `设置->通用->VPN和设备管理->信任xxx开发者 ` 即可真机调试
#### 参考资料
- [Flutter安装与配置](https://docs.flutter.cn/community/china/)
