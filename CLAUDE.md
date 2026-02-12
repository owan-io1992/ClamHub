# Claude Code Configuration for ClamHub

## 🎯 Project Overview

**Project:** ClamHub - Modern ClamAV Management System
**Type:** Full-stack Rust + React application with gRPC communication
**Location:** `/home/owan/data/git/ClamHub`

---

## ⚙️ Execution Permissions

### Automatic Execution (No Questions)

I will automatically execute the following commands **without asking for permission**:

#### Code Operations
- ✅ **File Reading & Writing**: Reading source files, writing code changes, creating new files
- ✅ **Code Editing**: Using Edit, Write, NotebookEdit tools for any code modifications
- ✅ **Git Operations**:
  - `git status`, `git log`, `git diff` (read-only)
  - `git add`, `git commit` (with clear commit messages)
  - `git checkout`, `git branch` (for branch management)
  - `git stash` (for temporary changes)
  - ❌ `git push` (requires explicit permission per action)
  - ❌ `git reset --hard`, `git rebase -i` (destructive - requires explicit permission)

#### Build & Development
- ✅ **Build Commands**: `cargo build`, `cargo check`, `npm run build`, `moon run :build`
- ✅ **Testing**: `cargo test`, `npm test`, `moon run :test`
- ✅ **Linting & Formatting**: `cargo fmt`, `cargo clippy`, `eslint`, `prettier`
- ✅ **Development Servers**: `cargo run`, `npm run dev` (local only)

#### Project Tools
- ✅ **Moonrepo**: `moon run`, `moon check`, `moon tasks`
- ✅ **Package Management**: `cargo`, `npm`, `bun` commands
- ✅ **Tool Installation**: `mise install`, `mise upgrade`

#### Task Management
- ✅ **Task Operations**: TaskCreate, TaskUpdate, TaskList, TaskGet
- ✅ **Team Operations**: TeamCreate, TeamDelete, SendMessage

#### Search & Analysis
- ✅ **Code Search**: Glob, Grep, Read tools for exploring codebase
- ✅ **Web Research**: WebSearch, WebFetch for gathering information

---

## 🔐 Explicit Permission Required

The following actions **always require explicit user permission**:

- **Push to remote**: `git push` (any branch, including main)
- **Destructive git operations**: `reset --hard`, `clean -f`, `rebase -i` with force
- **Delete directories/files**: Permanent deletion of project files
- **Deploy to production**: Any deployment-related commands
- **Database operations**: ALTER, DROP commands (if applicable)
- **Modify CI/CD pipelines**: Changes to GitHub Actions or deployment configs
- **External API calls**: Posting data to external services

---

## 📋 Development Workflow Preferences

### Git Commit Strategy
- **Create NEW commits** rather than amending (unless explicitly requested)
- **Specific file staging**: Add files by name, not `git add .`
- **Clear commit messages**: Include context about WHY changes were made
- **Format**:
  ```
  feat: <description>

  - Bullet point details
  - More context
  ```

### Code Style
- **Rust**: Follow cargo fmt + clippy standards
- **JavaScript/TypeScript**: ESLint + Prettier standards
- **No over-engineering**: Write minimum code needed for the task
- **Comments**: Only add where logic isn't self-evident
- **Tests**: Add tests for new functionality

### Task Management
- **Use task system**: All substantial work should be tracked in task list
- **Update status**: Mark tasks as `in_progress` when starting, `completed` when done
- **Document decisions**: Update relevant files when architectural changes are made

---

## 🏗️ Project Structure Reference

```
ClamHub/
├── .claude/                    # Team & task configuration
│   ├── teams/clamhub-dev/     # Team setup
│   └── tasks/clamhub-dev/     # Development tasks
├── hub/                        # Rust backend server
├── agent/                      # Rust agent client
├── proto/                      # gRPC protobuf definitions
├── web/                        # React frontend
├── CLAUDE.md                   # This file
├── TEAM.md                     # Team workflow guide
├── PLAN.md                     # Project plan
└── README.md                   # Project documentation
```

---

## 📚 Key Commands Reference

### Development
```bash
# Build all projects
moon run :build

# Run linting & formatting checks
moon run :lint
moon run :format
moon run :format:fix

# Start development servers
moon run hub:dev      # Rust backend
moon run web:dev      # React frontend

# Run tests
moon run :test
```

### Git Workflow
```bash
# Status & review
git status
git diff
git log --oneline -10

# Committing changes
git add <file>
git commit -m "message"

# Branch management
git checkout -b feature/xyz
git branch -d feature/xyz
```

### Team & Tasks
```bash
# View tasks
TaskList                    # All tasks
TaskGet { taskId: "1" }     # Specific task details

# Update progress
TaskUpdate { taskId: "1", status: "in_progress" }
TaskUpdate { taskId: "1", status: "completed" }

# Team communication
SendMessage { type: "message", recipient: "backend-dev", content: "...", summary: "..." }
```

---

## 🎯 Primary Goals (Current Phase)

1. ✅ **Setup Phase Complete**
   - Project analysis
   - Team structure established
   - Task planning finalized
   - Lint/format issues resolved

2. ⏳ **Next: Execute Development Tasks**
   - Task #1: Architecture planning
   - Tasks #2-8: Core features (parallel)
   - Task #9: Documentation & finalization

---

## 💡 Important Notes

### When Making Changes
- **Read first**: Always read the file before editing to understand context
- **Preserve existing code**: Don't refactor unrelated code
- **Test after changes**: Run relevant tests/lint after modifications
- **Update documentation**: Keep PLAN.md, TEAM.md, README.md in sync

### When Something Fails
- **Don't brute force**: If a command fails, diagnose the root cause
- **Alternative approaches**: Try different solutions rather than retry
- **Ask when stuck**: Use AskUserQuestion to clarify requirements
- **Document findings**: Update memory files with lessons learned

### Collaboration
- **Regular updates**: Check TaskList frequently
- **Clear communication**: Use SendMessage with detailed context
- **Peer coordination**: Teams can coordinate via messages
- **Status transparency**: Keep task status current

---

## 🔗 Related Documentation

- **Team Workflow**: See `TEAM.md` for team structure and collaboration guide
- **Project Plan**: See `PLAN.md` for original development roadmap
- **README**: See `README.md` for project overview and setup instructions

---

## ✍️ Configuration Last Updated

**Date**: 2026-02-12
**Version**: 1.0
**Scope**: ClamHub project-wide settings
**Status**: Active

---

**Summary**: This project is authorized for autonomous development operations. I will proceed with code changes, commits, and task management without asking for confirmation on these activities. Only actions marked as "Explicit Permission Required" will prompt for user approval.
