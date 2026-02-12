export const fetchAgents = async () => {
  // In dev, vite proxies or we use direct URL if CORS enabled
  const response = await fetch('http://localhost:3000/api/agents')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const fetchScans = async () => {
  const response = await fetch('http://localhost:3000/api/scans')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const fetchLogs = async () => {
  const response = await fetch('http://localhost:3000/api/logs')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const scanAgent = async ({ agentId, path }) => {
  const response = await fetch(
    `http://localhost:3000/api/agents/${agentId}/scan`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    },
  )
  if (!response.ok) {
    throw new Error('Failed to trigger scan')
  }
  return response.json()
}
