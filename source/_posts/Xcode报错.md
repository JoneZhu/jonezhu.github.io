---
title: Xcode 报错 "Framework 'Pods_Runner' not found"
date: 2025-08-25 15:51:12
categories:
  - 技术
  - 问题甜点
---
这个错误通常出现在使用 CocoaPods 管理的 iOS 项目中，特别是 Flutter 项目中。以下是原因和解决方法：

## 错误原因
1. **CocoaPods 依赖未正确安装**：项目使用了 CocoaPods 管理依赖，但必要的框架未正确安装或链接  
2. **Flutter 项目常见问题**：在 Flutter 项目中，'Pods_Runner' 是 CocoaPods 生成的主框架
3. **Xcode 工作空间未正确打开**：没有通过 `.xcworkspace` 文件打开项目，而是使用了 `.xcodeproj`
## 解决方法
 **清理和重建**：
    flutter clean
    cd ios
    pod deintegrate
    cd ../
    flutter pub get
    cd ios
    pod install
    cd ../