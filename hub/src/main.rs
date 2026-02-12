use std::collections::{HashMap, VecDeque};
use std::net::SocketAddr;
use std::sync::{Arc, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};

use clamhub_proto::agent_service_server::{AgentService, AgentServiceServer};
use clamhub_proto::{
    agent_command, AgentCommand, HeartbeatRequest, HeartbeatResponse, RegisterRequest,
    RegisterResponse, ReportScanResultRequest, ReportScanResultResponse, ScanCommand,
};
use tonic::{transport::Server, Request, Response, Status};
use tracing::{info, warn};

use axum::{
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

// --- Data Models ---

#[derive(Debug, Clone, Serialize, Deserialize)]
struct AgentInfo {
    id: String,
    hostname: String,
    version: String,
    status: String,
    last_seen: u64,
    #[serde(default)]
    infected_files: u32,
    #[serde(skip)] // Don't expose pending commands in REST list
    pending_commands: VecDeque<AgentCommand>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ScanRecord {
    id: String,
    agent_id: String,
    status: String,
    threats_found: u32,
    timestamp: u64,
    details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct LogRecord {
    id: String,
    level: String,
    message: String,
    timestamp: u64,
}

#[derive(Debug)]
struct AppState {
    agents: HashMap<String, AgentInfo>,
    scans: Vec<ScanRecord>,
    logs: Vec<LogRecord>,
}

type AgentState = Arc<RwLock<AppState>>;

// --- gRPC Service ---

#[derive(Debug)]
pub struct MyAgentService {
    state: AgentState,
}

impl MyAgentService {
    fn new(state: AgentState) -> Self {
        Self { state }
    }
}

#[tonic::async_trait]
impl AgentService for MyAgentService {
    async fn register(
        &self,
        request: Request<RegisterRequest>,
    ) -> Result<Response<RegisterResponse>, Status> {
        let req = request.into_inner();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let agent_id = format!("agent-{}-{}", req.hostname, now);

        info!(
            "Registering agent: {} (v{}) with ID: {}",
            req.hostname, req.version, agent_id
        );

        let info = AgentInfo {
            id: agent_id.clone(),
            hostname: req.hostname.clone(),
            version: req.version,
            status: "Online".to_string(),
            last_seen: now,
            infected_files: 0,
            pending_commands: VecDeque::new(),
        };

        {
            let mut state = self.state.write().unwrap();
            state.agents.insert(agent_id.clone(), info);

            // Add Log
            state.logs.push(LogRecord {
                id: uuid::Uuid::new_v4().to_string(),
                level: "INFO".to_string(),
                message: format!("Agent registered: {}", req.hostname),
                timestamp: now,
            });
        }

        Ok(Response::new(RegisterResponse { agent_id }))
    }

    async fn heartbeat(
        &self,
        request: Request<HeartbeatRequest>,
    ) -> Result<Response<HeartbeatResponse>, Status> {
        let req = request.into_inner();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(); // Use seconds for simplicity

        // info!("Heartbeat from {}: {}", req.agent_id, req.status);

        let mut commands_to_send = Vec::new();

        {
            let mut state = self.state.write().unwrap();
            if let Some(agent) = state.agents.get_mut(&req.agent_id) {
                agent.last_seen = now;
                agent.status = req.status;

                // Pop all pending commands
                while let Some(cmd) = agent.pending_commands.pop_front() {
                    commands_to_send.push(cmd);
                }
            } else {
                warn!("Received heartbeat from unknown agent: {}", req.agent_id);
            }
        } // End lock scope before return

        Ok(Response::new(HeartbeatResponse {
            acknowledged: true,
            pending_commands: commands_to_send,
        }))
    }

    async fn report_scan_result(
        &self,
        request: Request<ReportScanResultRequest>,
    ) -> Result<Response<ReportScanResultResponse>, Status> {
        let req = request.into_inner();
        info!(
            "Received scan result from {}: cmd={}, success={}, infected={}",
            req.agent_id, req.command_id, req.success, req.infected_files
        );
        if !req.details.is_empty() {
            info!("Details: {}", req.details);
        }

        {
            let mut state = self.state.write().unwrap();
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();

            // Record Scan Result
            state.scans.push(ScanRecord {
                id: req.command_id.clone(),
                agent_id: req.agent_id.clone(),
                status: if req.success {
                    "Completed".to_string()
                } else {
                    "Failed".to_string()
                },
                threats_found: req.infected_files as u32,
                timestamp: now,
                details: req.details.clone(),
            });

            // Record Log
            state.logs.push(LogRecord {
                id: uuid::Uuid::new_v4().to_string(),
                level: if req.success {
                    "INFO".to_string()
                } else {
                    "ERROR".to_string()
                },
                message: format!(
                    "Scan finished for {}. Threats: {}",
                    req.agent_id, req.infected_files
                ),
                timestamp: now,
            });

            if let Some(agent) = state.agents.get_mut(&req.agent_id) {
                let infected_files_u32 = req.infected_files as u32;
                agent.infected_files = infected_files_u32;
                // Optionally update status to indicate scan complete or threat found
                if infected_files_u32 > 0 {
                    agent.status = "Infected".to_string();
                } else {
                    agent.status = "Secure".to_string();
                }
            }
        }

        Ok(Response::new(ReportScanResultResponse {
            acknowledged: true,
        }))
    }
}

// --- REST API Handlers ---

async fn list_agents(State(state): State<AgentState>) -> Json<Vec<AgentInfo>> {
    let state = state.read().unwrap();
    let list: Vec<AgentInfo> = state.agents.values().cloned().collect();
    Json(list)
}

async fn list_scans(State(state): State<AgentState>) -> Json<Vec<ScanRecord>> {
    let state = state.read().unwrap();
    // Return scans sorted by timestamp desc
    let mut list = state.scans.clone();
    list.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    Json(list)
}

async fn list_logs(State(state): State<AgentState>) -> Json<Vec<LogRecord>> {
    let state = state.read().unwrap();
    // Return logs sorted by timestamp desc
    let mut list = state.logs.clone();
    list.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    Json(list)
}

#[derive(Debug, Deserialize)]
struct TriggerScanRequest {
    path: Option<String>,
}

async fn trigger_scan(
    State(state): State<AgentState>,
    Path(agent_id): Path<String>,
    Json(request): Json<TriggerScanRequest>,
) -> Json<serde_json::Value> {
    info!("Triggering scan for agent: {}", agent_id);

    let mut state = state.write().unwrap();

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    if let Some(agent) = state.agents.get_mut(&agent_id) {
        let cmd = AgentCommand {
            id: format!(
                "cmd-{}",
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ),
            payload: Some(agent_command::Payload::Scan(ScanCommand {
                path: request.path.unwrap_or_else(|| "/tmp".to_string()),
                recursive: true,
            })),
        };

        agent.pending_commands.push_back(cmd);
        // Immediate status update for UI responsiveness
        agent.status = "Scanning...".to_string();

        // Add Log
        state.logs.push(LogRecord {
            id: uuid::Uuid::new_v4().to_string(),
            level: "INFO".to_string(),
            message: format!("Scan triggered for agent: {}", agent_id),
            timestamp: now,
        });

        Json(serde_json::json!({ "status": "queued", "agent_id": agent_id }))
    } else {
        Json(serde_json::json!({ "error": "Agent not found" }))
    }
}

// --- Main ---

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    // Shared state
    let state: AgentState = Arc::new(RwLock::new(AppState {
        agents: HashMap::new(),
        scans: Vec::new(),
        logs: Vec::new(),
    }));

    // 1. Start gRPC Server
    let grpc_addr = "[::1]:50051".parse()?;
    let hub_service = MyAgentService::new(state.clone());

    info!("ClamHub gRPC Server listening on {}", grpc_addr);

    let grpc = Server::builder()
        .add_service(AgentServiceServer::new(hub_service))
        .serve(grpc_addr);

    // 2. Start REST API Server
    let app = Router::new()
        .route("/api/agents", get(list_agents))
        .route("/api/scans", get(list_scans))
        .route("/api/logs", get(list_logs))
        .route("/api/agents/:id/scan", post(trigger_scan)) // New endpoint
        .layer(CorsLayer::permissive())
        .with_state(state.clone());

    let http_addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    info!("ClamHub REST API listening on http://{}", http_addr);

    let listener = tokio::net::TcpListener::bind(http_addr).await?;
    let http = axum::serve(listener, app);

    // Run both
    let _ = tokio::join!(grpc, http);

    Ok(())
}
