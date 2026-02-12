import React from 'react'
import { AgentList } from '../components/AgentList'
import { Server } from 'lucide-react'

export function Agents() {
  return (
    <>
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
            <Server className="inline-block h-8 w-8 text-gray-400" />
            Agents Management
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-6">
            <p className="text-gray-300">
              Manage and monitor all connected agents. From here you can check
              their detailed status, version, and trigger manual actions.
            </p>
          </div>
          <AgentList />
        </div>
      </div>
    </>
  )
}
