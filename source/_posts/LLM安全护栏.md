---
title: LLM安全护栏
date: 2026-03-08 00:08:17
categories:
  - 技术
  - 认知
---
### NeMo Guardrails
**NeMo Guardrails** 是 NVIDIA 出品的开源工具包（Apache 2.0 许可，GitHub 星数 5k+），专门帮你给基于大模型（LLM）的聊天机器人、AI Agent、Copilot 等应用加“安全护栏”（guardrails）。  
简单说：别让 LLM 乱说话、泄露隐私、被越狱（jailbreak）、输出有害内容、跑题、生成假信息等。  
它像一个“中间人”：用户输入 → 先过 Guardrails 检查/改写 → 再给 LLM → LLM 输出 → 再过 Guardrails 检查/过滤 → 才给用户。  
这样就能可编程地控制 LLM 的行为，确保输出**安全、合规、切题、可靠**。

### 它怎么实现控制？
1. **Colang 语言**
   - 这是一种 NVIDIA 专为对话系统设计的“建模语言”（modeling language），超级简单，像写剧本或状态机。  
   - 用 Colang 定义“规则”（rails）和“对话流程”（flows）。  
   - 示例（伪代码风格）：
     ```
     define user ask politics
       "what are your political beliefs?"
       "who should I vote for?"

     define bot politics response
       "I'm sorry, I don't discuss politics."

     define flow politics check
       user ask politics
       bot politics response
       stop
     ```
     → 用户一提政治，AI 直接拒绝或给固定回复，不会让 LLM 自由发挥。

   - 支持定义：
     - 输入检查（防 jailbreak、敏感词、PII 泄露）
     - 输出检查（防有害内容、hallucination、越界）
     - 对话路径（强制走预设流程，比如客服 bot 必须先问问题再答）
     - 执行动作（调用工具前校验）

2. **内置/扩展的 Rails 类型**（2025–2026 年已很丰富）
   - **输入 Rails**：防 prompt injection、jailbreak、敏感输入。
   - **输出 Rails**：内容安全（暴力、仇恨、NSFW）、事实检查、RAG  grounding（确保基于检索内容回答）。
   - **对话 Rails**：话题控制（别聊政治/隐私）、风格控制（正式/幽默）。
   - **检索 Rails**：RAG 时确保相关性。
   - **执行 Rails**：调用工具/API 前校验权限。
   - 支持异步 API（性能好，低延迟），集成 LangChain、LlamaIndex、LangGraph 等框架。

   - **NIM 微服务**：2025 年后 NVIDIA 推了打包好的 Guardrails NIM，GPU 加速，低延迟部署。


### 实际落地例子
- **客服 bot**：强制不聊政治/价格敏感话题，输出必须礼貌、基于知识库。
- **企业内部 Agent**：防泄露公司机密（PII/敏感词过滤）、防越权调用工具。
- **RAG 应用**：确保回答 grounded in 检索内容，不 hallucinate。
- **合规场景**（金融/医疗）：强制输出审核、日志审计。

**NeMo Guardrails 是目前最成熟、可编程的 LLM 安全护栏工具之一**，尤其适合对话/Agent 应用。