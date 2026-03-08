---
title: 警惕API到MCP转换
date: 2026-03-07 23:28:20
categories:
  - 技术
  - 认知
---
### 为什么是警惕

1. **性能 & 效率问题**（Token 爆炸、上下文污染）：
    - 传统 API 是为**人类开发者**设计的：细粒度（granular）、原子操作（atomic），比如一个订单流程可能要调用 10+ 个小 API（查库存 → 扣款 → 更新状态 → 发通知）。
    - AI Agent 喜欢“链式调用”（chain calls）：它会傻傻地一个接一个 call，导致：
        - **Token 过度消耗**：每个调用都吃 context window，费用飙升、速度慢。
        - **上下文污染**：中间结果堆积，AI 脑子乱，容易 hallucinate 或出错。
        - **性能下降**：Agent 整体变笨、变慢。
2. **安全 & 合规大坑**（最致命）：
    - 内部 API 常暴露**敏感数据**（用户隐私、财务）或**危险操作**（删除、修改核心数据、无限额转账）。
    - 人类开发者有防护：代码审、架构模式（RBAC、审计日志）、review PR。
    - 但 AI Agent 是**自治的**（autonomous）：它根据 prompt 自己决定调用什么。一旦 prompt 被注入或 Agent 失控（比如被越狱、误解意图），它可能：
        - 批量泄露数据。
        - 执行破坏性操作（删库跑路）。
    - MCP 直接暴露后，**没有可靠的、确定性的方式阻止误用**（no deterministic guardrails）——不像人类有“道德判断”或强制 review。

一句话：**直接转换 = 把内部系统的“钥匙串”直接塞给一个可能犯傻的 AI**，短期爽，长期炸。

### 推荐的正确做法

- **别 naive 转换**：别一键工具自动转。
- **专门为 Agent 设计安全的 MCP Server**：
    - 在现有 API **基础上适配**（wrapper / facade 层）。
    - 针对 Agent 工作流重新设计：粗粒度操作（coarse-grained，比如“创建订单”而不是 10 个原子调用）、内置安全校验（最小权限、rate limit、human-in-loop for 高危操作）。
    - 加防护：认证、授权、审计、toxic flow analysis（有害流程分析，参考 Vol.33 另一个 blip）。
    - 用工具如 MCP-Scan 扫描漏洞。
- 目标：让 Agent 高效、安全地用，而不是“原样暴露”。

### 实际场景举例

- 坏例子：你的 FastAPI 有 /users/{id}/delete，用 FastAPI-MCP 一转，Agent 就能直接删用户（如果 prompt 说“清理测试数据”它可能乱删）。
- 好例子：建专用 MCP Server，只暴露 /agent/create-order（内部封装 10 个 API + 校验 + 日志），高危操作要人工确认或限流。

一句话总结这个  **MCP 是好东西，能让 AI Agent 真·连系统，但别 naive 把旧 API 一键转过去——会吃 Token、污染上下文、直接开安全后门。先 Hold 住，专门为 Agent 建安全的 MCP 层再上**。