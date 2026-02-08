use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, RwLock};
use std::net::SocketAddr;
use std::time::{SystemTime, UNIX_EPOCH};

use tonic::{transport::Server, Request, Response, Status};
use clamhub_proto::agent_service_server::{AgentService, AgentServiceServer};
use clamhub_proto::{
    RegisterRequest, RegisterResponse, HeartbeatRequest, HeartbeatResponse, 
    AgentCommand, ScanCommand, agent_command
};
use tracing::{info, warn};
use tracing_subscriber;

use axum::{
    extract::{State, Path},
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
    #[serde(skip)] // Don't expose pending commands in REST list
    pending_commands: VecDeque<AgentCommand>,
}

type AgentState = Arc<RwLock<HashMap<String, AgentInfo>>>;

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
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        let agent_id = format!("agent-{}-{}", req.hostname, now);

        info!("Registering agent: {} (v{}) with ID: {}", req.hostname, req.version, agent_id);
        
        let info = AgentInfo {
            id: agent_id.clone(),
            hostname: req.hostname,
            version: req.version,
            status: "Online".to_string(),
            last_seen: now,
            pending_commands: VecDeque::new(),
        };

        {
            let mut state = self.state.write().unwrap();
            state.insert(agent_id.clone(), info);
        }
        
        Ok(Response::new(RegisterResponse {
            agent_id,
        }))
    }

    async fn heartbeat(
        &self,
        request: Request<HeartbeatRequest>,
    ) -> Result<Response<HeartbeatResponse>, Status> {
        let req = request.into_inner();
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(); // Use seconds for simplicity
        
        // info!("Heartbeat from {}: {}", req.agent_id, req.status);
        
        let mut commands_to_send = Vec::new();

        {
            let mut state = self.state.write().unwrap();
            if let Some(agent) = state.get_mut(&req.agent_id) {
                agent.last_seen = now;
                agent.status = req.status;
                
                // Pop all pending commands
                while let Some(cmd) = agent.pending_commands.pop_front() {
                    commands_to_send.push(cmd);
                }
            } else {
                warn!("Received heartbeat from unknown agent: {}", req.agent_id);
            }
        }
        
        Ok(Response::new(HeartbeatResponse {
            acknowledged: true,
            pending_commands: commands_to_send,
        }))
    }
}

// --- REST API Handlers ---

async fn list_agents(State(state): State<AgentState>) -> Json<Vec<AgentInfo>> {
    let agents = state.read().unwrap();
    let list: Vec<AgentInfo> = agents.values().cloned().collect();
    Json(list)
}

async fn trigger_scan(
    State(state): State<AgentState>,
    Path(agent_id): Path<String>,
) -> Json<serde_json::Value> {
    info!("Triggering scan for agent: {}", agent_id);
    
    let mut state = state.write().unwrap();
    
    if let Some(agent) = state.get_mut(&agent_id) {
        let cmd = AgentCommand {
            id: format!("cmd-{}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()),
            payload: Some(agent_command::Payload::Scan(ScanCommand {
                path: "/tmp".to_string(), // Default scan path for demo
                recursive: true,
            })),
        };
        
        agent.pending_commands.push_back(cmd);
        
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
    let state: AgentState = Arc::new(RwLock::new(HashMap::new()));

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
