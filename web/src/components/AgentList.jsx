import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Shield,
  ShieldAlert,
  Wifi,
  WifiOff,
  Play,
  Loader2,
  X,
  FolderSearch,
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

import { fetchAgents, scanAgent } from '../api'

export function AgentList() {
  const queryClient = useQueryClient()
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [scanPath, setScanPath] = useState('/tmp')

  const {
    data: agents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 2000, // Poll every 2 seconds for snappier updates during demo
  })

  const mutation = useMutation({
    mutationFn: scanAgent,
    onSuccess: (data) => {
      // Invalidate to refresh list immediately
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      console.log('Scan triggered:', data)
      setSelectedAgentId(null) // Close modal on success
    },
  })

  const handleScanClick = (agentId) => {
    setSelectedAgentId(agentId)
    setScanPath('/tmp') // Reset to default capable path
  }

  const handleConfirmScan = () => {
    if (selectedAgentId && scanPath) {
      mutation.mutate({ agentId: selectedAgentId, path: scanPath })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5" />
        <span>Error fetching agents: {error.message}</span>
      </div>
    )
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 rounded-xl bg-gray-800/30 border border-gray-700/50">
        <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-300">
          No Agents Connected
        </h3>
        <p className="text-sm">Waiting for agents to register...</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800/80">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Hostname
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Version
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {agents.map((agent) => {
              const isScanning = agent.status.toLowerCase().includes('scanning')
              const isPending =
                mutation.isPending && mutation.variables?.agentId === agent.id

              return (
                <tr
                  key={agent.id}
                  className="hover:bg-gray-700/30 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm',
                        isScanning
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse'
                          : agent.status === 'Online' || agent.status === 'OK'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20',
                      )}
                    >
                      {isScanning ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {agent.hostname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {agent.id.substring(0, 20)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                      {agent.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleScanClick(agent.id)}
                      disabled={isScanning || isPending}
                      className={cn(
                        'inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                        isScanning
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30',
                      )}
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-1.5 fill-current" />
                      )}
                      {isScanning ? 'Scanning...' : 'Scan Now'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Scan Path Modal */}
      {selectedAgentId && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-80 transition-opacity"
              aria-hidden="true"
              onClick={() => setSelectedAgentId(null)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-700">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-900/50 sm:mx-0 sm:h-10 sm:w-10">
                    <FolderSearch
                      className="h-6 w-6 text-indigo-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-white"
                      id="modal-title"
                    >
                      Start New Scan
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400 mb-4">
                        Enter the directory path you want to scan on the agent.
                      </p>
                      <div>
                        <label
                          htmlFor="scan-path"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Scan Path
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="scan-path"
                            id="scan-path"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 px-3 py-2"
                            placeholder="/tmp"
                            value={scanPath}
                            onChange={(e) => setScanPath(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && handleConfirmScan()
                            }
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-700">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleConfirmScan}
                >
                  Start Scan
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedAgentId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
