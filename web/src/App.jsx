import React from 'react';
import { AgentList } from './components/AgentList';
import { useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShieldCheck, HardDrive, Settings, Activity } from 'lucide-react';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-900 text-white font-sans antialiased">

        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheck className="h-8 w-8 text-indigo-500" />
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <a href="#" className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                    <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Agents</a>
                    <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Scans</a>
                    <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Logs</a>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <button type="button" className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">View notifications</span>
                    <Activity className="h-6 w-6" aria-hidden="true" />
                  </button>
                  {/* Profile dropdown stub */}
                  <div className="ml-3 relative">
                    <div>
                      <button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">A</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <header className="bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
              <HardDrive className="inline-block h-8 w-8 text-gray-400" />
              Agent Overview
            </h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Stats Overview Stub */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {/* Just placeholders for now */}
              <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-400 truncate">Total Agents</dt>
                  <dd className="mt-1 text-3xl font-semibold text-white">Loading...</dd>
                </div>
              </div>
              <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-400 truncate">Active Threats</dt>
                  <dd className="mt-1 text-3xl font-semibold text-white">0</dd>
                </div>
              </div>
              <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-400 truncate">System Health</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-400">Stable</dd>
                </div>
              </div>
            </div>

            {/* Agent List Component */}
            <div className="px-4 py-6 sm:px-0">
              <AgentList />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App
