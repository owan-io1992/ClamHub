use clamhub_proto::agent_service_client::AgentServiceClient;
use clamhub_proto::{agent_command, HeartbeatRequest, RegisterRequest, ReportScanResultRequest};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::process::Command;
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

    // Try to connect with retry
    let mut client = loop {
        match AgentServiceClient::connect("http://[::1]:50051").await {
            Ok(client) => break client,
            Err(e) => {
                warn!("Failed to connect to hub: {}. Retrying in 2s...", e);
                time::sleep(Duration::from_secs(2)).await;
            }
        }
    };

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
                        // Clone for async block
                        let state_clone = state.clone();
                        let cmd_id = cmd.id.clone();
                        let mut client_clone = client.clone();
                        let agent_id_clone = agent_id.clone();

                        tokio::spawn(async move {
                            match payload {
                                agent_command::Payload::Scan(scan_cmd) => {
                                    info!("[Cmd {}] Starting scan of {}...", cmd_id, scan_cmd.path);

                                    // Update state to Scanning
                                    {
                                        let mut s = state_clone.lock().unwrap();
                                        s.status = "Scanning...".to_string();
                                    }

                                    // Execute clamdscan
                                    // Use --fdpass to pass file descriptor permissions to clamd
                                    // Use --multiscan for multithreaded scanning if recursive
                                    let mut cmd = Command::new("clamdscan");
                                    cmd.arg("--fdpass"); // Pass file descriptor permissions

                                    if scan_cmd.recursive {
                                        cmd.arg("--multiscan");
                                    }
                                    cmd.arg(&scan_cmd.path);

                                    let output = cmd.output().await;

                                    let (success, details, infected) = match output {
                                        Ok(o) => {
                                            let stdout =
                                                String::from_utf8_lossy(&o.stdout).to_string();
                                            let stderr =
                                                String::from_utf8_lossy(&o.stderr).to_string();
                                            let code = o.status.code().unwrap_or(-1);

                                            // clamdscan exit codes: 0: No virus, 1: Virus found, 2: Error
                                            let success = code == 0 || code == 1;

                                            // Crude infected count parsing if successful
                                            let infected = if code == 1 {
                                                // Count lines containing "FOUND"
                                                stdout
                                                    .lines()
                                                    .filter(|l| l.contains(" FOUND"))
                                                    .count()
                                                    as i32
                                            } else {
                                                0
                                            };

                                            let details =
                                                if !stdout.is_empty() { stdout } else { stderr };
                                            (success, details, infected)
                                        }
                                        Err(e) => {
                                            error!("Failed to execute clamdscan: {}", e);
                                            (
                                                false,
                                                format!("Failed to execute clamdscan: {}", e),
                                                0,
                                            )
                                        }
                                    };

                                    // Report result
                                    let report_req = Request::new(ReportScanResultRequest {
                                        agent_id: agent_id_clone,
                                        command_id: cmd_id.clone(),
                                        success,
                                        details: details.clone(),
                                        infected_files: infected,
                                    });

                                    if let Err(e) =
                                        client_clone.report_scan_result(report_req).await
                                    {
                                        error!("Failed to report scan result: {}", e);
                                    }

                                    {
                                        let mut s = state_clone.lock().unwrap();
                                        s.status = "Online".to_string();
                                    }
                                    info!("[Cmd {}] Scan complete. Infected: {}", cmd_id, infected);
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
