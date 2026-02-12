import React, { useState } from 'react'
import { Scan, X, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchScans } from '../api'

export function Scans() {
  const { data: scans, isLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: fetchScans,
    refetchInterval: 5000,
  })

  const [selectedReport, setSelectedReport] = useState(null)

  return (
    <>
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
            <Scan className="inline-block h-8 w-8 text-gray-400" />
            Scan History
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Threats Found
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      Loading scans...
                    </td>
                  </tr>
                ) : !scans || scans.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      No scan history available
                    </td>
                  </tr>
                ) : (
                  scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${
                                  scan.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : scan.status === 'Failed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {scan.agent_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {scan.threats_found}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(scan.timestamp * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedReport(scan)}
                          className="text-indigo-400 hover:text-indigo-300 pointer-events-auto cursor-pointer"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Use simple conditional rendering for modal to avoid potential portal issues for now */}
      {selectedReport && (
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
              onClick={() => setSelectedReport(null)}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="relative z-50 inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-600">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-900/50 sm:mx-0 sm:h-10 sm:w-10">
                    <FileText
                      className="h-6 w-6 text-indigo-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-xl leading-6 font-semibold text-white"
                      id="modal-title"
                    >
                      Scan Report
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                        <span className="uppercase text-xs font-bold tracking-wider text-gray-500">
                          ID:
                        </span>
                        <span className="font-mono text-gray-300 bg-gray-900 px-2 py-0.5 rounded">
                          {selectedReport.id}
                        </span>
                      </p>
                      <div className="bg-white rounded-lg border border-gray-300 p-4 mt-3 overflow-auto max-h-[60vh] shadow-inner">
                        {selectedReport.details ? (
                          <pre className="text-sm text-gray-900 font-mono whitespace-pre leading-relaxed">
                            {selectedReport.details}
                          </pre>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mb-2 opacity-20" />
                            <p>No details available for this scan.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-700">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
