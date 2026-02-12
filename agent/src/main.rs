use clamhub_proto::agent_service_client::AgentServiceClient;
use clamhub_proto::{agent_command, HeartbeatRequest, RegisterRequest};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::time;
use tonic::Request;
use tracing::{error, info, warn};

// Simulate local agent state
struct AgentState {
    status: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    info!("ClamHub Agent starting...");

    // Try to connect, retry loop could be better but sticking to simple start
    let mut client = AgentServiceClient::connect("http://[::1]:50051").await?;

    // Basic registration
    let request = Request::new(RegisterRequest {
        hostname: "localhost".into(),
        version: "0.1.0".into(),
    });

    let response = client.register(request).await?;
    let agent_id = response.into_inner().agent_id;
    info!("Registered with ID: {}", agent_id);

    // Initial state
    let state = Arc::new(Mutex::new(AgentState {
        status: "Online".to_string(),
    }));

    let mut interval = time::interval(Duration::from_secs(2));

    loop {
        interval.tick().await;

        let current_status = {
            let s = state.lock().unwrap();
            s.status.clone()
        };

        // Send Heartbeat
        let req = Request::new(HeartbeatRequest {
            agent_id: agent_id.clone(),
            status: current_status,
        });

        match client.heartbeat(req).await {
            Ok(resp) => {
                let inner = resp.into_inner();

                // Process any pending commands
                for cmd in inner.pending_commands {
                    info!("Received command: {:?}", cmd.id);
                    if let Some(payload) = cmd.payload {
                        // Clone for async block
                        let state_clone = state.clone();
                        let cmd_id = cmd.id.clone();

                        tokio::spawn(async move {
                            match payload {
                                agent_command::Payload::Scan(_scan_cmd) => {
                                    info!("[Cmd {}] Starting simulated virus scan...", cmd_id);

                                    // Update state to Scanning
                                    {
                                        let mut s = state_clone.lock().unwrap();
                                        s.status = "Scanning...".to_string();
                                    }

                                    // Simulate work (10 seconds)
                                    time::sleep(Duration::from_secs(10)).await;

                                    {
                                        let mut s = state_clone.lock().unwrap();
                                        s.status = "Online".to_string();
                                    }
                                    info!("[Cmd {}] Scan complete.", cmd_id);
                                }
                                _ => {
                                    warn!("Unknown command payload");
                                }
                            }
                        });
                    }
                }
            }
            Err(e) => {
                error!("Heartbeat failed: {}", e);
                // Simple reconnect logic would go here
            }
        }
    }
}
