# Project Plan: ClamHub

This document outlines the development plan and division of labor for the ClamHub project.

## 🗺️ Division of Labor (Tasks)

### Phase 1: Infrastructure & Setup (Current Priority)
- [x] **Repo Setup**: Initialize Moonrepo configuration (`.moon`).
- [x] **Backend Setup**: Initialize Rust workspace (`Cargo.toml`) with members: `hub`, `agent`, `proto`.
- [x] **Frontend Setup**: Initialize React project (`web`) using Vite.
- [ ] **CI/CD**: specific GitHub Actions (Future).

### Phase 2: Core Communication (Shared)
- [x] **Proto Definition**: Define `.proto` files for gRPC services (Agent Registration, Status Updates, Command Execution).
- [x] **Shared Lib**: Generate Rust code from proto files in `proto` crate.

### Phase 3: Hub (Server) Implementation
- [x] **gRPC Server**: Implement the server-side logic to handle agent connections.
- [x] **State Management**: In-memory or simple file-based state for registered agents.
- [x] **REST API**: specific endpoints for the Web UI (e.g., `GET /agents`, `POST /scan`).

### Phase 4: Agent (Client) Implementation
- [x] **gRPC Client**: Implement the client-side logic to connect to Hub.
- [ ] **ClamAV Integration**: Interaction with local `clamd` (via socket or CLI).
- [x] **Heartbeat**: Periodic status updates to Hub.

### Phase 5: Web UI (Frontend) Implementation
- [x] **Dashboard**: Main view showing connected agents and their status.
- [x] **Agent Detail**: Detailed view of a specific agent (scan history, config).
- [x] **Settings**: Scan triggering and Status management.

## 📂 Directory Structure

```
ClamHub/
├── .moon/               # Moonrepo configuration
├── hub/                 # Rust Backend (Server)
├── agent/               # Rust Agent (Client)
├── proto/               # Shared gRPC definitions
├── web/                 # React Frontend
├── Cargo.toml           # Rust Workspace
├── mise.toml            # Toolchain versioning
└── README.md            # Documentation
```
