import React from 'react'
import { FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchLogs } from '../api'

export function Logs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: fetchLogs,
    refetchInterval: 3000,
  })

  return (
    <>
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
            <FileText className="inline-block h-8 w-8 text-gray-400" />
            System Logs
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 font-mono text-sm overflow-x-auto h-[600px] overflow-y-scroll">
            {isLoading ? (
              <div className="text-gray-500">Loading logs...</div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-gray-500">No logs available</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="mb-1 border-b border-gray-800 pb-1"
                >
                  <span className="text-gray-500">
                    [{new Date(log.timestamp * 1000).toLocaleString()}]
                  </span>{' '}
                  <span
                    className={
                      log.level === 'INFO'
                        ? 'text-blue-400'
                        : log.level === 'WARN'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }
                  >
                    {log.level}
                  </span>{' '}
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
