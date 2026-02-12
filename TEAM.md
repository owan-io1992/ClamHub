# ClamHub 开发团队指南

## 🏢 团队信息

**团队名称：** `clamhub-dev`
**团队描述：** ClamHub 项目开发团队 - 负责 Rust 后端、React 前端、CI/CD 和项目协调
**团队配置位置：** `.claude/teams/clamhub-dev/`
**任务列表位置：** `.claude/tasks/clamhub-dev/`

---

## 👥 团队角色

团队设计包含以下专业角色：

| 角色 | 职责 | 主要工作 |
|------|------|--------|
| **Team Lead** | 整体规划、协调、决策 | 架构设计、优先级管理、风险识别 |
| **Backend Dev** | Rust 后端开发 | Hub、Agent、gRPC、API 实现 |
| **Frontend Dev** | React 前端开发 | UI/UX、页面、组件、API 集成 |
| **DevOps/QA** | 测试、构建、部署 | CI/CD、测试、部署自动化 |

---

## 📊 任务执行计划

### 任务依赖关系图

```
Task #1: 项目规划
    ├─→ Task #2: mTLS 认证
    │       └─→ Task #4: 测试
    │           └─→ Task #5: CI/CD
    ├─→ Task #3: 用户认证
    │       └─→ Task #4: 测试
    ├─→ Task #6: 实时推送
    ├─→ Task #7: 报告功能
    ├─→ Task #8: 扫描优化
    └─→ Task #9: 文档编写
```

### 任务详情

| ID | 任务 | 优先级 | 分配给 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| #1 | 分析项目架构并制定开发计划 | 🔴 最高 | team-lead | ⏳ pending | - |
| #2 | 实现 mTLS 认证机制 | 🔴 高 | backend-dev | ⏳ pending | #1 |
| #3 | 实现 Web UI 用户认证 | 🔴 高 | backend-dev + frontend-dev | ⏳ pending | #1 |
| #4 | 添加单元测试和集成测试 | 🟠 中 | devops | ⏳ pending | #2, #3 |
| #5 | 设置 CI/CD 流水线 | 🟠 中 | devops | ⏳ pending | #4 |
| #6 | 实现实时推送（WebSocket/SSE） | 🟠 中 | backend-dev + frontend-dev | ⏳ pending | #1 |
| #7 | 增强报告功能和数据可视化 | 🟡 低 | frontend-dev | ⏳ pending | #1 |
| #8 | 优化 Agent 扫描逻辑 | 🟡 低 | backend-dev | ⏳ pending | #1 |
| #9 | 完善项目文档和部署指南 | 🟡 低 | team-lead | ⏳ pending | #2-8 |

---

## 🚀 快速开始

### 1. 查看任务列表
```bash
# 显示所有任务和当前状态
TaskList
```

### 2. 获取任务详情
```bash
# 查看特定任务的完整描述
TaskGet { taskId: "1" }
```

### 3. 启动任务
当团队成员准备好开始某个任务时：
```bash
# 标记为进行中
TaskUpdate {
  taskId: "1",
  status: "in_progress",
  owner: "team-lead"
}
```

### 4. 完成任务
任务完成后：
```bash
# 标记为已完成
TaskUpdate {
  taskId: "1",
  status: "completed"
}
```

### 5. 团队沟通
```bash
# 发送消息给特定成员
SendMessage {
  type: "message",
  recipient: "backend-dev",
  content: "你的消息内容",
  summary: "消息摘要"
}

# 广播给所有成员（谨慎使用）
SendMessage {
  type: "broadcast",
  content: "给全队的消息",
  summary: "消息摘要"
}
```

---

## 📋 任务管理工作流

### 流程图

```
Team Lead Review Tasks
        ↓
   分配给成员
        ↓
   成员启动任务 (status: in_progress)
        ↓
   开发 / 实现 / 测试
        ↓
   遇到阻碍？ → 发送消息寻求帮助
        ↓
   任务完成 (status: completed)
        ↓
   Team Lead 验收，解锁后续任务
```

---

## 🔄 团队成员成生命周期

### 添加新成员

```bash
# 使用 Task 工具生成新成员
Task {
  description: "生成后端开发者",
  prompt: "你是 ClamHub 项目的后端开发者，加入 clamhub-dev 团队工作...",
  subagent_type: "general-purpose",
  team_name: "clamhub-dev",
  name: "backend-dev"
}
```

### 成员监控

- 成员在完成任务后会自动进入 **idle** 状态（正常现象）
- 空闲成员仍然可以接收消息和任务分配
- 不要将空闲视为不可用 - 发送消息即可唤醒他们

### 关闭团队

所有任务完成后，关闭团队：
```bash
# 1. 向所有成员发送关闭请求
SendMessage {
  type: "shutdown_request",
  recipient: "backend-dev",
  content: "项目完成，准备关闭"
}

# 2. 成员批准关闭后
TeamDelete
```

---

## 📁 项目结构

```
ClamHub/
├── .claude/                           # 团队配置（新）
│   ├── teams/clamhub-dev/
│   │   └── config.json               # 团队配置文件
│   └── tasks/clamhub-dev/
│       ├── 1.json ~ 9.json           # 任务定义
│
├── hub/                               # Rust Hub 服务
├── agent/                             # Rust Agent 客户端
├── proto/                             # gRPC Protocol Buffers
├── web/                               # React 前端
│
├── PLAN.md                            # 原始项目计划
├── TEAM.md                            # 本文档（团队工作指南）
└── README.md                          # 项目 README
```

---

## 💬 沟通规范

### 消息类型

1. **状态更新** - 使用 TaskUpdate 而不是发送消息
2. **问题反馈** - 直接向相关成员发送 DM
3. **紧急通知** - 使用 broadcast（仅在必要时）
4. **协作请求** - 在任务中添加依赖或发送消息说明

### 良好实践

- ✅ 在消息中提供上下文和背景
- ✅ 使用简洁的摘要（5-10 字）
- ✅ 定期查看 TaskList 了解团队进度
- ❌ 不要频繁 broadcast
- ❌ 不要在文本中重复发送 JSON 状态

---

## 🎯 关键里程碑

| 里程碑 | 目标 | 关键任务 |
|--------|------|---------|
| **M1: 安全加固** | mTLS + 用户认证 | #2, #3 |
| **M2: 质量保证** | 完整的测试覆盖 | #4, #5 |
| **M3: 功能增强** | 实时更新、报告、优化 | #6, #7, #8 |
| **M4: 发布就绪** | 文档完善、部署就绪 | #9 |

---

## 📚 资源链接

- **项目 README**: `README.md`
- **原始计划**: `PLAN.md`
- **架构文档**: `docs/`（待完善）
- **Hub 代码**: `hub/src/main.rs`
- **Agent 代码**: `agent/src/main.rs`
- **Web 前端**: `web/src/`

---

## ❓ 常见问题

**Q: 如何查看某个成员的当前任务？**
A: 查看 TaskList，找到 owner 为该成员的任务。

**Q: 任务可以跳过依赖吗？**
A: 不建议。依赖关系确保了逻辑顺序，跳过可能导致返工。

**Q: 成员空闲了是什么意思？**
A: 正常状态。成员完成任务或等待输入时会空闲。发送消息或分配新任务即可激活。

**Q: 如何修改已创建的任务？**
A: 使用 TaskUpdate 工具修改 subject、description、status 等。

**Q: 可以添加新任务吗？**
A: 可以。使用 TaskCreate 添加新任务，然后用 TaskUpdate 设置依赖关系。

---

## 🔐 最佳实践

1. **定期同步** - 每天检查 TaskList 了解进度
2. **明确沟通** - 任务卡住时立即沟通而不是浪费时间
3. **及时反馈** - 任务完成或遇到问题时立即更新状态
4. **依赖管理** - 充分利用任务依赖确保执行顺序
5. **文档更新** - 重要决策或变更更新相关文档

---

**最后更新：** 2026-02-12
**团队负责人：** team-lead
