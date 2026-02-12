import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ShieldCheck, HardDrive, Activity } from 'lucide-react'
import { clsx } from 'clsx'

export function Layout() {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Agents', href: '/agents' },
    { name: 'Scans', href: '/scans' },
    { name: 'Logs', href: '/logs' },
  ]

  return (
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
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={clsx(
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="sr-only">View notifications</span>
                  <Activity className="h-6 w-6" aria-hidden="true" />
                </button>
                {/* Profile dropdown stub */}
                <div className="ml-3 relative">
                  <div>
                    <button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                        A
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
