# Multi-Agent 架构

> 当一个 Agent 不够用时,要不要上多 Agent?怎么上?

---

## 一、为什么考虑 Multi-Agent

**Single-Agent System (SAS)** 已经能做很多事:

- 接收输入 → 推理 → 调用工具 → 输出

但当任务变复杂,SAS 会出现几个问题:

- **上下文爆炸**:长任务把整个历史塞进 prompt,token 爆掉
- **角色混乱**:同一个 Agent 又要做规划、又要写代码、又要测,职责不清
- **工具太多**:一个 Agent 暴露几十个工具,模型选错工具的概率上升
- **难以并行**:单 Agent 串行执行,慢

**Multi-Agent System (MAS)** 的核心思路是:把任务拆给多个专精的 Agent 协作,每个 Agent 关注自己的一小片。

但要记住一个反直觉的事实:

> **MAS 不是 Pareto improvement**
>
> 多 Agent 不一定比单 Agent 好。有些任务适合,有些反而被协调成本拖累。

---

## 二、四种 MAS 架构

### 1. Independent (独立式)

```
Agent A ──→ 方案 1
Agent B ──→ 方案 2   ──→ 选择最优
Agent C ──→ 方案 3
```

**特点**:
- 多个 Agent 并行做事,**彼此不通信**
- 各自独立产生结果,最后由人或上层选最优

**适用**:
- 需要**多种方案对比**(架构选型、UI 草图、写作风格)
- 任务可完全并行,无依赖

**真实例子**:
- GitHub Copilot Workspace 的多方案预览
- LLM 评估场景:同一道题让多个模型各答一次,取最优

**问题**:
- 浪费算力(3 个 Agent 算 3 遍)
- 任务必须有"可比性",不能完全独立

---

### 2. Decentralized (去中心化)

```
Agent A ←──→ Agent B
   ↑ ↕           ↕
   └─→ Agent C ←─┘
```

**特点**:
- 多个 Agent 彼此**自由通信**,没有中心节点
- 像群智网络,任意两个都能对话

**适用**:
- 高度可拆分、探索性强的大任务
- 模拟"组织协作"(多个角色互相辩论)

**真实例子**:
- MetaGPT:多角色(产品/架构/开发/QA)互相通信模拟软件公司
- AutoGen 的 Group Chat 模式
- 学术辩论场景

**问题**:
- **协调成本最高**,容易陷入无限通信循环
- 难以调试(没有 single source of truth)
- 结果可能发散(没有统一约束)

---

### 3. Centralized (中心化)

```
       Orchestrator (Manager)
      ↙      ↓      ↘
   Agent A  Agent B  Agent C
```

**特点**:
- 一个 manager / orchestrator 统一分配任务,其他 Agent 执行
- 所有跨 Agent 通信都经过中心

**适用**:
- 流程清晰、需要统一控制的任务
- 工作流可拆成"步骤 + 子任务"

**真实例子**:
- LangGraph 的 StateGraph + 多 Node
- LangChain 的 MultiActionAgent
- CrewAI 的 hierarchical 模式

**问题**:
- **中心节点是瓶颈**:所有通信过它,延迟/故障都集中
- 中心 Agent 的 prompt 容易变成"巨型 if-else"
- 拆任务逻辑写在 orchestrator 里,容易膨胀

---

### 4. Hybrid (混合)

```
       Orchestrator
      ↙      ↓      ↘
   Agent A  Group B  Agent C
              ↓
         Agent B1, B2
```

**特点**:
- 中心 orchestrator 管顶层
- 局部 Agent 之间可以**内部通信**,不一定要过中心

**适用**:
- 真实复杂工程任务(软件开发、多角色协作)
- 既需要顶层流程控制,又允许局部自由协作

**真实例子**:
- Claude Code 的多 subagent 协作
- 大型 RAG 系统的"调度 + 专家"模式
- 软件公司的部门结构(总经理管 PM,PM 管开发组,开发组内部协作)

**特点**:
- **最实用,但实现也最复杂**
- 调试难:既要 trace 中心,又要 trace 局部

---

## 三、怎么选?决策表

| 场景 | 推荐架构 | 理由 |
|---|---|---|
| 多种方案对比、选最优 | Independent | 简单,无协调成本 |
| 探索性研究、辩论 | Decentralized | 让想法互相碰撞 |
| 清晰工作流(数据 pipeline) | Centralized | 易于追踪与重放 |
| 软件开发、多角色协作 | Hybrid | 现实组织结构的映射 |
| 简单 RAG / 单任务工具 | SAS | 上 MAS 是过度设计 |

**经验法则**:

> 任务**不可拆** 或 **拆完协调成本 > 并行收益** → SAS
>
> 任务**强依赖顺序** → Centralized
>
> 任务**强独立多解** → Independent
>
> 任务**多角色且局部有内部协作** → Hybrid

---

## 四、协调成本:MAS 的隐藏税

MAS 的真正难点不是写多个 Agent,**是让它们协调**。

一个完整的 harness 需要解决:

```
- 任务怎么拆
- 怎么启动,谁负责
- Agent 之间怎么通信
- 共享状态放哪里
- 冲突怎么处理
- 失败怎么重试
- 结果怎么合并
- 怎么评估质量
- 日志怎么记录
- 权限和工具怎么控制
```

每多一个 Agent,这些问题就多一份。**实际项目里,协调代码往往比 Agent 本身还多**。

---

## 五、RopeMind 选哪种?

RopeMind 是 Agentic RAG 工作台,任务是"理解仓库 + 回答问题"。

我倾向 **Centralized + 少量 Hybrid**:

```
       Orchestrator (主 Agent)
      ↙      ↓       ↘
  仓库扫描  代码阅读  问答生成
  (子 Agent)
```

- **主 Agent** 决定下一步做什么(读文件 / 搜代码 / 生成回答)
- **子 Agent** 各管一摊,互不通信
- 子 Agent 的结果回主 Agent,统一控制流程

为什么不选 Decentralized? 因为 RopeMind 的每一步都有明确下一步,**自由通信反而会乱**。

为什么不选纯 Independent? 因为 RopeMind 不是"选最优",是"按顺序做"。

---

## 六、反模式:什么时候 MAS 反而拖后腿

- **任务太小**:一个 LLM 调用能搞定的事,拆 3 个 Agent 是浪费时间
- **协调代码失控**:为了协调写了几千行胶水代码,bug 反而多
- **结果难对齐**:多个 Agent 各自说不同的"事实",最后合成时矛盾
- **调试地狱**:一个任务失败,不知道是哪个 Agent 错
- **成本爆炸**:N 个 Agent = N 倍 token,有些场景下不可接受

**真正需要 MAS 的场景,通常是产品已经稳定、单 Agent 触到天花板之后**。不要一上来就 MAS。

---

## 七、一句话总结

> MAS 是工具,不是信仰。先 SAS 做到极限,再判断要不要拆。
> 拆的时候选最简单的架构(独立 < 中心 < 去中心),能用 Independent 解决就别上 Hybrid。
