import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAgents } from '../api'
import { AgentList } from '../components/AgentList'
import { HardDrive } from 'lucide-react'

export function Dashboard() {
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 2000,
  })

  // Calculate stats
  const totalAgents = agents?.length || 0

  // Calculate active threats correctly from backend data
  const activeThreats =
    agents?.reduce((sum, agent) => sum + (agent.infected_files || 0), 0) || 0

  const systemHealth = activeThreats > 0 ? 'Warning' : 'Stable'
  const healthColor = activeThreats > 0 ? 'text-yellow-500' : 'text-green-400'

  return (
    <>
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
            <HardDrive className="inline-block h-8 w-8 text-gray-400" />
            Agent Overview
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">
                Total Agents
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-white">
                {totalAgents}
              </dd>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">
                Active Threats
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-white">
                {activeThreats}
              </dd>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">
                System Health
              </dt>
              <dd className={`mt-1 text-3xl font-semibold ${healthColor}`}>
                {systemHealth}
              </dd>
            </div>
          </div>
        </div>

        {/* Agent List Component */}
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">
            Connected Agents
          </h2>
          <AgentList />
        </div>
      </div>
    </>
  )
}
