---
title: Dify如何对接OpenAI-API-compatible协议模型
date: 2024-12-13 20:35:48
categories:
  - 技术
  - AI
tags:
---
#### 如何添加自定义模型
1. 打开设置
![Img](/images/img_20241213203633_1.png)
2. 在模型供应商中找到OpenAI-API-compatible，并点击设置
![Img](/images/img_20241213203644_2.png)
3. 添加模型
![Img](/images/img_20241213203656_4.png)
#### 参数说明
##### 模型类型
- 可选参数分别是LLM、Text Embedding、Speech2text、Rerank、TTS LLM：文本生成模型
- LLM：对话模型
- Text Embedding：文本 Embedding 模型
- Rerank： Rerank 模型（[重新排序模型](https://docs.dify.ai/zh-hans/learn-more/extended-reading/retrieval-augment/rerank)） 
- Speech2text ：语音转文字
- TTS： 文字转语音
##### API endpoint URL
Base URL
##### Completion mode
- 对话：主要用于生成与用户的对话，能够理解用户输入并产生自然的回应
- 补全：主要用于根据给定的文本片段生成或补全后续内容，比如BERT、用到的比较少
##### 模型上下文长度
 模型的最大上下文长度，若不清楚可填写默认值 4096。
#####  最大token上限
模型返回内容的最大 token 数量，若模型无特别说明，则可与模型上下文长度保持一致。
##### Function calling
- [Function Call](https://openai.com/index/function-calling-and-other-api-updates/)：用于在Dify平台内直接执行函数；比如gpt-3.5/gpt-4
- [Tool Call](https://platform.stepfun.com/docs/guide/tool_call )：Tool call 可以扩展语言模型的功能，使其能够执行额外的操作，如搜索信息、科学计算、访问数据库等。这样模型可以为用户提供更精准的信息，帮助开发者更好地处理业务需求。
##### Vision 
是否支持多模态
##### 流模式返回结果的分隔符
流模式下数据块的分隔符 默认：\n
