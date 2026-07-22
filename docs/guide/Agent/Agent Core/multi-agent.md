# multi-agent
## 1. SAS vs MAS
SAS = Single-Agent System
MAS = Multi-Agent System
**MAS 不是 Pareto improvement**。不是说多 agent 一定比单 agent 好，而是有些任务适合，有些任务反而会被协调成本拖累。

## 2. 四种 MAS 架构
```
1. Independent
多个 agent 并行做事，但彼此不交流。
适合：生成多个方案、并行尝试、最后选最优。

2. Decentralized
多个 agent 彼此自由通信，没有中心管理者。
适合：高度可拆分、探索性强的大任务。
问题：协调成本最高，容易混乱。

3. Centralized
一个 manager / orchestrator 统一分配任务，其他 agent 执行。
适合：流程清晰、需要统一控制的任务。
问题：中心节点可能成为瓶颈。

4. Hybrid
中心 orchestrator + 局部 agent 协作。
适合：真实复杂工程任务，比如软件开发、多角色协作。
特点：最实用，但实现也更复杂。
```

在 MAS 里，harness 通常包括：

```
任务怎么拆agent 
怎么启动谁负责什么agent 
之间怎么通信共享状态放哪里
冲突怎么处理
失败怎么重试
结果怎么合并
怎么评估质量日志
怎么记录
权限和工具怎么控制
```

