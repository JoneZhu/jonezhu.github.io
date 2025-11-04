---
title: Swift视频动态缩放Transform顺序问题
date: 2025-11-04 23:41:20
categories:
  - 技术
  - 技术甜点
---
## 问题描述

在实现视频"镜头推进"效果时，发现当设置中心点为 (0.5, 0.5) 时，预期画面应该聚焦到正中央，但实际效果却偏向左上角。

## 问题根源

**核心问题：CGAffineTransform 的操作顺序错误**

### 错误的实现（问题代码）

```swift
// ❌ 错误：先平移，再缩放
var transform = baseTransform
transform = transform.translatedBy(x: -cropX, y: -cropY)  // 先平移
transform = transform.scaledBy(x: zoom, y: zoom)          // 再缩放
```

**问题表现：**
- 日志显示：平移 `tx=-576.0, ty=-324.0`
- 缩放后：`tx` 和 `ty` 的值**没有变化**，仍然是 `-576.0, -324.0`
- 结果：画面偏移量不足，无法正确聚焦到目标中心点

### 正确的实现（修复代码）

```swift
// ✅ 正确：先缩放，再平移
var transform = baseTransform
transform = transform.scaledBy(x: zoom, y: zoom)          // 先缩放
transform = transform.translatedBy(x: -cropX, y: -cropY)  // 再平移
```

**修复效果：**
- 缩放后在"放大的坐标系"中执行平移
- 平移量会被自动放大，达到正确的偏移效果
- 画面准确聚焦到目标中心点

## 深入理解：为什么顺序很重要？

### 1. CGAffineTransform 的矩阵本质

`CGAffineTransform` 本质上是一个 **3x3 的仿射变换矩阵**：

```
┌          ┐
│ a  b  0  │
│ c  d  0  │
│ tx ty 1  │
└          ┘
```

- `a, d`：缩放和旋转
- `b, c`：旋转和倾斜
- `tx, ty`：平移

### 2. 变换的组合顺序

在 Swift 中，`transform.translatedBy().scaledBy()` 看起来是"先平移后缩放"，但**实际的矩阵乘法顺序是相反的**！

```swift
transform.translatedBy(x, y).scaledBy(sx, sy)
```

实际执行：
```
最终矩阵 = [缩放矩阵] × [平移矩阵] × [原始矩阵]
```

点的变换：
```
新坐标 = [缩放矩阵] × [平移矩阵] × [原始点]
```

这意味着：**对点来说，先执行平移，再执行缩放**

### 3. 两种顺序的差异

#### 错误顺序：translatedBy 在前

```swift
transform.translatedBy(x: -576, y: -324).scaledBy(x: 2.5, y: 2.5)
```

**变换过程：**
```
1. 原始点：(960, 540)
2. 平移：(960 - 576, 540 - 324) = (384, 216)
3. 缩放：(384 × 2.5, 216 × 2.5) = (960, 540)  ❌
```

**问题：** 点被平移后又被缩放拉回去了，相当于在缩放后的画面中，中心点并没有移动到正确位置！

#### 正确顺序：scaledBy 在前

```swift
transform.scaledBy(x: 2.5, y: 2.5).translatedBy(x: -576, y: -324)
```

**变换过程：**
```
1. 原始点：(960, 540)
2. 缩放：(960 × 2.5, 540 × 2.5) = (2400, 1350)
3. 平移：(2400 - 576, 1350 - 324) = (1824, 1026)  ✓
```

**等效于：** 在原始坐标系中，先将裁剪区域的左上角 (576, 324) 移到原点，然后放大 2.5 倍，让中心点 (960, 540) 正好在画面中央。

## 可视化示例

### 场景设定
- 视频尺寸：1920 × 1080
- 目标中心点：(0.5, 0.5) → (960, 540) 像素
- 放大倍数：2.5×
- 裁剪区域：768 × 432（居中于 960, 540）
- 裁剪起点：(576, 324)

### 错误顺序的效果

```
原始视频 (1920×1080)
┌─────────────────────────────┐
│          [裁剪区域]          │
│          768×432            │
│            🏀               │ ← 中心点 (960, 540)
│                             │
└─────────────────────────────┘

步骤1: 平移 (-576, -324)
┌─────────────────────────────┐
│ 🏀                          │ ← 移到了 (384, 216)
│                             │
└─────────────────────────────┘

步骤2: 缩放 2.5×
┌─────────────────────────────┐
│                             │
│           🏀                │ ← 又被拉回 (960, 540)，偏左上
│                             │
└─────────────────────────────┘
❌ 结果：画面没有正确聚焦
```

### 正确顺序的效果

```
原始视频 (1920×1080)
┌─────────────────────────────┐
│          [裁剪区域]          │
│          768×432            │
│            🏀               │ ← 中心点 (960, 540)
│                             │
└─────────────────────────────┘

步骤1: 缩放 2.5×
┌───────────────────────────────────────────────┐
│                                               │
│                    🏀                         │ ← (2400, 1350)
│                                               │
│                                               │
└───────────────────────────────────────────────┘

步骤2: 平移 (-576, -324)
         ┌─────────────────────┐
         │                     │
         │        🏀           │ ← (1824, 1026) - 正中央！
         │                     │
         └─────────────────────┘
✓ 结果：画面完美聚焦到中心
```

## 关键要点

### 1. Transform 链式调用的反直觉特性

```swift
// 代码顺序：A → B
transform.A().B()

// 实际执行：B → A（对点的变换来说）
```

**记忆技巧：** 最右边的操作先作用于点，就像数学中的函数组合 `f(g(x))`

### 2. 坐标系的概念

- **先缩放再平移**：平移发生在"放大后的坐标系"中
  - 平移 -576 在 2.5× 坐标系中 ≈ 平移 -1440 在原始坐标系中

- **先平移再缩放**：平移发生在"原始坐标系"中
  - 平移 -576 就是 -576，缩放不会影响它

### 3. 为什么会犯这个错误？

直觉上会认为：
> "我要先把画面移到正确位置，然后再放大"

但正确的思路应该是：
> "我要放大画面，然后在放大的坐标系中调整位置"

## 代码


``` swift

import AVFoundation
import CoreGraphics

// MARK: - 动态效果参数
struct DynamicEffectParams {
    let startCenterX: CGFloat
    let startCenterY: CGFloat
    let endCenterX: CGFloat
    let endCenterY: CGFloat
    let fixedCenterX: CGFloat  // 固定中心点 X
    let fixedCenterY: CGFloat  // 固定中心点 Y
    let scaleFactor: CGFloat
    let startTimeMs: Int
    let endTimeMs: Int
    let scoreTimeMs: Int
}

// MARK: - 关键帧数据
struct ZoomKeyframe {
    let time: CMTime
    let zoomFactor: CGFloat
    let transform: CGAffineTransform
}

// MARK: - 动态缩放配置
struct DynamicZoomConfig {
    // MVP 模式配置
    static let fixedZoomStartOffset: Double = 2.8     // 进球前2.8秒开始
    static let fixedZoomEndOffset: Double = 0.8       // 进球后0.8秒结束

    // 完整版配置
    static let minZoomFactor: CGFloat = 1.5           // 最小放大倍数
    static let maxZoomFactor: CGFloat = 3.0           // 最大放大倍数
    static let defaultZoomFactor: CGFloat = 2.5       // 默认放大倍数

    // 时间计算配置
    static let minZoomDuration: Double = 1.0          // 最小缩放时长（秒）
    static let bufferTimeRatio: Double = 0.3          // 缓冲时间比例

    // 缓动和关键帧配置
    static let easingPower: Double = 0.7              // 缓动函数指数
    static let keyframeInterval: Double = 0.05         // 关键帧间隔（秒）

    // 中心点插值配置
    static let centerPathEasingPower: Double = 0.5    // 中心点路径缓动指数
}

// MARK: - 动态缩放处理器
class DynamicZoomProcessor {
    static let shared = DynamicZoomProcessor()
    private let logger = Logger.shared

    private init() {}

    // MARK: - 公开接口

    /// 应用动态缩放效果（完整版）
    func applyDynamicZoom(
        to layerInstruction: AVMutableVideoCompositionLayerInstruction,
        params: DynamicEffectParams,
        videoSize: CGSize,
        baseTransform: CGAffineTransform,
        videoDuration: Double
    ) -> Bool {
        logger.info("DynamicZoomProcessor", "==== 开始应用动态缩放效果（完整版）====")
        logger.info("DynamicZoomProcessor", "视频尺寸: \(videoSize.width) x \(videoSize.height)")
        logger.info("DynamicZoomProcessor", "视频时长: \(videoDuration)秒")

        // 1. 计算缩放参数
        guard let zoomParams = calculateZoomParams(
            params: params,
            videoDuration: videoDuration
        ) else {
            logger.warning("DynamicZoomProcessor", "⚠️ 缩放参数计算失败")
            return false
        }

        logger.info("DynamicZoomProcessor", "缩放参数计算成功:")
        logger.info("DynamicZoomProcessor", "  - 起始中心点: (\(params.startCenterX), \(params.startCenterY))")
        logger.info("DynamicZoomProcessor", "  - 结束中心点: (\(params.endCenterX), \(params.endCenterY))")
        logger.info("DynamicZoomProcessor", "  - 固定中心点: (\(params.fixedCenterX), \(params.fixedCenterY)) [使用此点作为推进目标]")
        logger.info("DynamicZoomProcessor", "  - 最大缩放: \(zoomParams.maxZoom)x")
        logger.info("DynamicZoomProcessor", "  - 开始时间: \(zoomParams.startTime)s")
        logger.info("DynamicZoomProcessor", "  - 结束时间: \(zoomParams.endTime)s")

        // 2. 生成关键帧（使用固定中心点作为推进目标）
        let keyframes = generateKeyframesWithFixedCenter(
            fixedCenter: CGPoint(x: params.fixedCenterX, y: params.fixedCenterY),
            maxZoom: zoomParams.maxZoom,
            startTime: zoomParams.startTime,
            endTime: zoomParams.endTime,
            videoSize: videoSize,
            baseTransform: baseTransform
        )

        logger.info("DynamicZoomProcessor", "生成了 \(keyframes.count) 个关键帧")

        // 3. 应用transform到每个关键帧
        for (index, keyframe) in keyframes.enumerated() {
            layerInstruction.setTransform(keyframe.transform, at: keyframe.time)

            if index < 3 || index >= keyframes.count - 3 {
                logger.info("DynamicZoomProcessor", "  关键帧[\(index)]: 时间=\(keyframe.time.seconds)s, 缩放=\(keyframe.zoomFactor)x")
            }
        }

        logger.info("DynamicZoomProcessor", "✅ 动态缩放效果应用成功")
        return true
    }

    // MARK: - 私有方法

    /// 计算缩放参数（完整版：动态计算）
    private func calculateZoomParams(
        params: DynamicEffectParams,
        videoDuration: Double
    ) -> (centerX: CGFloat, centerY: CGFloat, maxZoom: CGFloat, startTime: Double, endTime: Double)? {
        // 1. 计算时间范围（使用轨迹数据的实际时间）
        let startTimeS = Double(params.startTimeMs) / 1000.0
        let endTimeS = Double(params.endTimeMs) / 1000.0
        let scoreTimeS = Double(params.scoreTimeMs) / 1000.0

        logger.info("DynamicZoomProcessor", "轨迹时间范围:")
        logger.info("DynamicZoomProcessor", "  - 起始时间: \(startTimeS)s (\(params.startTimeMs)ms)")
        logger.info("DynamicZoomProcessor", "  - 结束时间: \(endTimeS)s (\(params.endTimeMs)ms)")
        logger.info("DynamicZoomProcessor", "  - 进球时间: \(scoreTimeS)s (\(params.scoreTimeMs)ms)")

        // 2. 计算实际的缩放时间范围
        let trajectoryDuration = endTimeS - startTimeS
        let bufferTime = trajectoryDuration * DynamicZoomConfig.bufferTimeRatio

        // 缩放开始时间：轨迹起始时间之前一点
        var zoomStartTime =  startTimeS

        // 缩放结束时间：轨迹结束时间之后一点
        var zoomEndTime =  endTimeS

        // 确保最小时长
        let zoomDuration = zoomEndTime - zoomStartTime
        if zoomDuration < DynamicZoomConfig.minZoomDuration {
            logger.warning("DynamicZoomProcessor", "⚠️ 计算的缩放时长(\(zoomDuration)s)小于最小值，调整为最小时长")

            let center = (zoomStartTime + zoomEndTime) / 2
            let halfMinDuration = DynamicZoomConfig.minZoomDuration / 2

            zoomStartTime = max(0, center - halfMinDuration)
            zoomEndTime = min(videoDuration, center + halfMinDuration)
        }

        logger.info("DynamicZoomProcessor", "计算的缩放时间范围:")
        logger.info("DynamicZoomProcessor", "  - 开始: \(zoomStartTime)s")
        logger.info("DynamicZoomProcessor", "  - 结束: \(zoomEndTime)s")
        logger.info("DynamicZoomProcessor", "  - 时长: \(zoomEndTime - zoomStartTime)s")

        // 3. 计算运动距离，用于动态确定缩放倍数
        let distance = calculateDistance(
            from: CGPoint(x: params.startCenterX, y: params.startCenterY),
            to: CGPoint(x: params.endCenterX, y: params.endCenterY)
        )

        logger.info("DynamicZoomProcessor", "运动距离: \(distance) (归一化)")

        // 4. 动态计算缩放倍数
        let calculatedZoom = calculateOptimalZoomFactor(
            distance: distance,
            requestedZoom: params.scaleFactor
        )

        logger.info("DynamicZoomProcessor", "缩放倍数:")
        logger.info("DynamicZoomProcessor", "  - 请求的: \(params.scaleFactor)x")
        logger.info("DynamicZoomProcessor", "  - 计算的: \(calculatedZoom)x")

        // 5. 使用固定中心点作为推进目标
        let centerX = params.fixedCenterX
        let centerY = params.fixedCenterY

        return (
            centerX: centerX,
            centerY: centerY,
            maxZoom: calculatedZoom,
            startTime: zoomStartTime,
            endTime: zoomEndTime
        )
    }

    /// 计算两点之间的距离（归一化坐标）
    private func calculateDistance(from start: CGPoint, to end: CGPoint) -> CGFloat {
        let dx = end.x - start.x
        let dy = end.y - start.y
        return sqrt(dx * dx + dy * dy)
    }

    /// 计算最优缩放倍数
    /// 基于运动距离和请求的缩放倍数，智能调整
    private func calculateOptimalZoomFactor(distance: CGFloat, requestedZoom: CGFloat) -> CGFloat {
        // 如果运动距离很小，可以使用更大的缩放
        // 如果运动距离很大，使用较小的缩放以保持画面稳定

        var optimalZoom = requestedZoom

        // 运动距离阈值（归一化坐标）
        let smallDistance: CGFloat = 0.1   // 小距离阈值
        let largeDistance: CGFloat = 0.5   // 大距离阈值

        if distance < smallDistance {
            // 小距离运动：可以放大更多
            optimalZoom = min(requestedZoom * 1.2, DynamicZoomConfig.maxZoomFactor)
            logger.info("DynamicZoomProcessor", "小距离运动，增加缩放倍数")
        } else if distance > largeDistance {
            // 大距离运动：减少缩放以保持稳定
            optimalZoom = max(requestedZoom * 0.8, DynamicZoomConfig.minZoomFactor)
            logger.info("DynamicZoomProcessor", "大距离运动，减少缩放倍数")
        }

        // 确保在合理范围内
        optimalZoom = max(DynamicZoomConfig.minZoomFactor, min(optimalZoom, DynamicZoomConfig.maxZoomFactor))

        return optimalZoom
    }

    /// 生成关键帧数组（使用固定中心点）
    private func generateKeyframesWithFixedCenter(
        fixedCenter: CGPoint,
        maxZoom: CGFloat,
        startTime: Double,
        endTime: Double,
        videoSize: CGSize,
        baseTransform: CGAffineTransform
    ) -> [ZoomKeyframe] {
        var keyframes: [ZoomKeyframe] = []

        let interval = DynamicZoomConfig.keyframeInterval  // 0.05秒
        let duration = endTime - startTime
        let frameCount = Int(ceil(duration / interval)) + 1

        for i in 0..<frameCount {
            let time = startTime + Double(i) * interval
            let clampedTime = min(time, endTime)

            // 计算当前时间点的进度（0-1）
            let progress = (clampedTime - startTime) / duration

            // 🎯 计算缩放倍数（带缓动）
            let zoomFactor = calculateZoomWithEasing(progress: progress, maxZoom: maxZoom)

            // 🎯 使用固定中心点（不进行插值）
            let center = fixedCenter

            // 创建 transform
            let transform = createZoomTransform(
                zoom: zoomFactor,
                center: center,
                videoSize: videoSize,
                baseTransform: baseTransform
            )

            let cmTime = CMTime(seconds: clampedTime, preferredTimescale: 1000)
            keyframes.append(ZoomKeyframe(time: cmTime, zoomFactor: zoomFactor, transform: transform))
        }

        return keyframes
    }

    /// 生成关键帧数组（完整版：支持中心点插值）
    private func generateKeyframesWithInterpolation(
        startCenter: CGPoint,
        endCenter: CGPoint,
        maxZoom: CGFloat,
        startTime: Double,
        endTime: Double,
        videoSize: CGSize,
        baseTransform: CGAffineTransform
    ) -> [ZoomKeyframe] {
        var keyframes: [ZoomKeyframe] = []

        let interval = DynamicZoomConfig.keyframeInterval  // 0.1秒
        let duration = endTime - startTime
        let frameCount = Int(ceil(duration / interval)) + 1

        for i in 0..<frameCount {
            let time = startTime + Double(i) * interval
            let clampedTime = min(time, endTime)

            // 计算当前时间点的进度（0-1）
            let progress = (clampedTime - startTime) / duration

            // 🎯 计算缩放倍数（带缓动）
            let zoomFactor = calculateZoomWithEasing(progress: progress, maxZoom: maxZoom)

            // 🎯 计算中心点（带插值和缓动）
            let center = interpolateCenter(
                from: startCenter,
                to: endCenter,
                progress: progress
            )

            // 创建 transform
            let transform = createZoomTransform(
                zoom: zoomFactor,
                center: center,
                videoSize: videoSize,
                baseTransform: baseTransform
            )

            let cmTime = CMTime(seconds: clampedTime, preferredTimescale: 1000)
            keyframes.append(ZoomKeyframe(time: cmTime, zoomFactor: zoomFactor, transform: transform))
        }

        return keyframes
    }

    /// 计算带缓动的缩放倍数
    private func calculateZoomWithEasing(progress: Double, maxZoom: CGFloat) -> CGFloat {
        // 应用缓动函数
        let easedProgress = easeInOut(progress: progress, power: DynamicZoomConfig.easingPower)

        // 从 1.0 逐渐放大到 maxZoom
        return 1.0 + (maxZoom - 1.0) * CGFloat(easedProgress)
    }

    /// 中心点插值（带缓动）
    private func interpolateCenter(from start: CGPoint, to end: CGPoint, progress: Double) -> CGPoint {
        // 应用中心点路径缓动
        let easedProgress = easeInOut(progress: progress, power: DynamicZoomConfig.centerPathEasingPower)

        // 线性插值
        let x = start.x + (end.x - start.x) * CGFloat(easedProgress)
        let y = start.y + (end.y - start.y) * CGFloat(easedProgress)

        return CGPoint(x: x, y: y)
    }

    /// 计算指定时间点的缩放倍数
    private func calculateZoom(
        at time: Double,
        params: (centerX: CGFloat, centerY: CGFloat, maxZoom: CGFloat, startTime: Double, endTime: Double)
    ) -> CGFloat {
        // 放大开始前
        if time < params.startTime {
            return 1.0
        }

        // 放大结束后
        if time > params.endTime {
            return params.maxZoom
        }

        // 放大过程中
        let duration = params.endTime - params.startTime
        let elapsed = time - params.startTime
        let progress = elapsed / duration  // 0-1

        // 应用缓动函数
        let easedProgress = easeInOut(progress: progress, power: DynamicZoomConfig.easingPower)

        // 计算当前缩放倍数
        return 1.0 + (params.maxZoom - 1.0) * CGFloat(easedProgress)
    }

    /// 缓动函数（幂函数）
    private func easeInOut(progress: Double, power: Double) -> Double {
        return pow(progress, power)
    }

    /// 创建镜头推进的Transform
    private func createZoomTransform(
        zoom: CGFloat,
        center: CGPoint,  // 归一化坐标 (0-1)
        videoSize: CGSize,
        baseTransform: CGAffineTransform
    ) -> CGAffineTransform {

        // 1. 计算裁剪区域尺寸
        let visibleWidth = videoSize.width / zoom
        let visibleHeight = videoSize.height / zoom
        logger.info("DynamicZoomProcessor", "  步骤1 - 裁剪区域尺寸:")
        logger.info("DynamicZoomProcessor", "    - 可见宽度: \(visibleWidth)")
        logger.info("DynamicZoomProcessor", "    - 可见高度: \(visibleHeight)")

        // 2. 计算中心点的绝对坐标
        let absoluteCenterX = center.x * videoSize.width
        let absoluteCenterY = center.y * videoSize.height

        // 3. 计算裁剪区域的起始坐标
        var cropX = absoluteCenterX - visibleWidth / 2
        var cropY = absoluteCenterY - visibleHeight / 2


        // 4. 边界检测和修正
        let originalCropX = cropX
        let originalCropY = cropY
        cropX = max(0, min(cropX, videoSize.width - visibleWidth))
        cropY = max(0, min(cropY, videoSize.height - visibleHeight))


        // 5. 构建Transform（注意顺序）
        var transform = baseTransform  // 保留原始旋转/镜像


        // 先缩放
        transform = transform.scaledBy(x: zoom, y: zoom)
        // 再平移（在缩放后的坐标系中平移）
        transform = transform.translatedBy(x: -cropX, y: -cropY)
*/
        logger.info("DynamicZoomProcessor", "✅ [createZoomTransform] Transform创建完成")
        return transform
    }
}


```


