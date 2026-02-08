# AGENTS.md - AI Context & Developer Guide

This document provides context, architectural details, and development guidelines for AI agents and developers working on **ClamHub**.

## 🧠 Project Overview

**ClamHub** is a centralized management system for ClamAV (open source antivirus engine). It aims to solve the problem of managing ClamAV across multiple servers by providing a unified "Single Pane of Glass" web interface. 

The system operates in two modes:
1.  **Standalone**: For single personal servers (embedded hub + agent + UI).
2.  **Centralized**: For enterprise fleets (central hub server manages many remote agents).

## 🛠 Tech Stack

### 🦀 Backend (Rust)
The backend is a Rust workspace containing:
-   **`hub/` (Server)**:
    -   Framework: `axum` (REST API), `tonic` (gRPC Server).
    -   Async Runtime: `tokio`.
    -   Serialization: `serde`, `prost`.
    -   Logging: `tracing`.
-   **`agent/` (Client)**:
    -   Framework: `tonic` (gRPC Client).
    -   Async Runtime: `tokio`.
    -   Communication: connects to `clamd` (local ClamAV daemon).
-   **`proto/` (Shared)**:
    -   Calculated `protobuf` definitions for gRPC communication.
    -   Tools: `prost-build`, `tonic-build`.

### ⚛️ Frontend (React)
-   **`web/`**:
    -   Build Tool: `Vite`.
    -   Framework: `React 19`.
    -   Language: JavaScript/ESModules (currently, migration to TS recommended if complex).
    -   Styling: Standard CSS / planned TailwindCSS.

### 📦 Tooling & Infrastructure
-   **Package Manager/Task Runner**: `moonrepo` (`.moon/`).
-   **Runtime Manager**: `mise` (`mise.toml`) - manages Rust, Node.js, and other tool versions.
-   **Containers**: Use `podman` or `docker` for OCI image building (future).

## 📂 Directory Structure

```plaintext
ClamHub/
├── .moon/               # Moonrepo configuration & tasks
├── agent/               # Rust Agent (gRPC Client, runs on nodes)
│   ├── src/             # Source code
│   └── Cargo.toml       # Dependencies
├── hub/                 # Rust Hub Server (gRPC Server + REST API)
│   ├── src/             
│   └── Cargo.toml       
├── proto/               # Protocol Buffers & Shared Rust Code
│   ├── src/             # Generated Rust code from .proto
│   ├── proto/           # .proto definition files
│   └── build.rs         # Tonic build script
├── web/                 # React Frontend
│   ├── src/             
│   ├── vite.config.js   
│   └── package.json     
├── Cargo.toml           # Rust Workspace Root
├── mise.toml            # Tool versions (Rust, Node, etc.)
├── AGENTS.md            # This context file
└── README.md            # Public documentation
```

## 🚀 Development Workflow

### Prerequisites
Ensure `mise` is installed. It will handle the rest.
```bash
mise install
```

### Build & Run
Project tasks are managed by `moonrepo`.

-   **Build Entire Project**:
    ```bash
    moon run :build
    ```

-   **Run Backend (Hub)**:
    ```bash
    moon run hub:dev
    # Starts gRPC server on configured port (default 50051)
    # Starts REST API on configured port (default 3000)
    ```

-   **Run Frontend (Web)**:
    ```bash
    moon run web:dev
    # Opens local dev server (usually http://localhost:5173)
    ```

## 📏 Coding Conventions

### Rust
-   Follow standard Rust idioms and `clippy` suggestions.
-   Use `tracing` for logging instead of `println!`.
-   Error handling: Use `Result` propagation (avoid `unwrap` unless prototyping).
-   Modules: Keep `main.rs` clean; move logic to `lib.rs` or submodules.

### React / Web
-   Use Functional Components with Hooks.
-   Keep components small and focused.
-   Use `fetch` or a lightweight query library for API calls.

## 📝 Current Implementation Status
-   **Hub**: Basic Axum + Tonic setup.
-   **Agent**: Basic Tonic client setup.
-   **Web**: Vite + React boilerplate.
-   **Proto**: Need to define services in `proto/proto/`.

## 🤖 AI Agent Guidelines
When generating code or answering questions:
1.  **Context Aware**: Always check `Cargo.toml` or `package.json` before adding new dependencies to ensure they don't conflict or duplicate functionality.
2.  **Tool Usage**: Use `moon` commands for build/test cycles.
3.  **Pathing**: Always use absolute paths or paths relative to the project root.
4.  **Security**: Do not hardcode secrets. Suggest environment variables or configuration files.
