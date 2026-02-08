# ClamHub 🦪

> **Centralized ClamAV Management with a Modern Web GUI.**

![Status](https://img.shields.io/badge/Status-Prototype-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Rust](https://img.shields.io/badge/Built_with-Rust-orange)

## 📖 Introduction

**ClamHub** is a modern management system for [ClamAV](https://www.clamav.net/). It offers a unified "Single Pane of Glass" to monitor, configure, and control ClamAV instances, whether on a single personal server or across a distributed enterprise fleet.

## ✨ Key Features

- **🕸️ Modern Web Interface**: A responsive, user-friendly dashboard built with **React**. No more parsing logs in the terminal.
- **🔭 Dual Operation Modes**: flexible deployment for single nodes or standard client-server fleets.
- **⚡ Real-time Monitoring**: Watch scan progress, virus detections, and agent health status in real-time via **gRPC** streaming.
- **⚙️ Remote Configuration**: Push configuration changes (exclude paths, scan limits) instantly.
- **📊 Reporting**:Visualize infection trends and system coverage.

## 🏗️ Architecture

ClamHub is designed to be flexible, supporting two distinct modes of operation:

### Mode A: Standalone (Single Node)
*Ideal for personal servers, developers, or single-machine protection.*
- **Embedded Hub**: Runs a simplified local API server.
- **Local Agent**: Connects directly to the local `clamd` socket.
- **Web UI**: Served locally (e.g., `http://localhost:8080`) for private management.

### Mode B: Centralized (Fleet Management)
*Ideal for enterprise environments managing multiple servers.*
- **Hub (Server)**: The central brain managing authentication, logs, and config for the entire fleet.
- **Agents**: Lightweight binaries running on remote nodes, connecting via **gRPC** to the Hub.
- **Web Client**: Connects to the Hub to view the entire fleet's status.

```mermaid
graph TD
    subgraph "Mode: Standalone"
        LocalUser[User] --> LocalUI[Web UI]
        LocalUI --> LocalHub[Local Engine]
        LocalHub --> LocalClam[ClamAV (Local)]
    end

    subgraph "Mode: Centralized"
        Admin[Admin User] --> CentralUI[Web Dashboard]
        CentralUI --> CentralHub[Central Hub Server]
        CentralHub <==>|gRPC / mTLS| RemoteAgent1
        CentralHub <==>|gRPC / mTLS| RemoteAgent2
        RemoteAgent1 --> Clam1[ClamAV]
        RemoteAgent2 --> Clam2[ClamAV]
    end
```

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Core** | **Rust** 🦀 | Used for both Server and Agent for safety and performance. |
| **Frontend** | **React** ⚛️ | Vite, TailwindCSS, React Query. |
| **API** | **gRPC** (Tonic) | High-performance, type-safe communication between Hub & Agents. |
| **API** | **REST** (Axum) | JSON API for the Web Client. |
| **Storage** | **Local Files** | Simple file-based storage for logs and configurations (no heavy DB required). |
| **Tooling** | **Moonrepo** 🌑 | monorepo management, caching, and task running. |
| **Runtime** | **Mise** 🔧 | Polyglot runtime manager (installs Rust, Node, etc.). |


## 🚀 Getting Started

*Note: ClamHub is currently in active development. Examples below are for planned usage.*

### Prerequisites
- [Mise](https://mise.jdx.dev/) (The only tool you need to install manually).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/owan-io1992/ClamHub.git
    cd ClamHub
    ```

2.  **Setup Environment**
    ```bash
    # Installs Rust, Node.js, and Moonrepo automatically
    mise install
    ```

3.  **Build Project**
    ```bash
    # Builds both Backend (Rust) and Frontend (React)
    moon run :build
    ```

4.  **Run (Development)**
    ```bash
    # Start the Hub in dev mode
    moon run hub:dev
    
    # Start the Web UI
    moon run web:dev
    ```

## 🗺️ Roadmap

- [ ] **Phase 1: Prototype**
    - Basic Hub & Agent communication via gRPC.
    - Standalone mode implementation.
- [ ] **Phase 2: Core Functionality**
    - Remote scan triggering.
    - Log aggregation.
    - React Dashboard.
- [ ] **Phase 3: Security & Polish**
    - mTLS authentication for Agents.
    - User authentication for Web GUI.
    - Advanced reporting.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
