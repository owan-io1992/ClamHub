import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Shield, ShieldAlert, Wifi, WifiOff, Play, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const fetchAgents = async () => {
    // In dev, vite proxies or we use direct URL if CORS enabled
    const response = await fetch('http://localhost:3000/api/agents');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const scanAgent = async (agentId) => {
    const response = await fetch(`http://localhost:3000/api/agents/${agentId}/scan`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to trigger scan');
    }
    return response.json();
};

export function AgentList() {
    const { data: agents, isLoading, error } = useQuery({
        queryKey: ['agents'],
        queryFn: fetchAgents,
        refetchInterval: 2000, // Poll every 2 seconds for snappier updates during demo
    });

    const mutation = useMutation({
        mutationFn: scanAgent,
        onSuccess: (data, variables) => {
            // Invalidate to refresh list potentially? No, status update comes from agent heartbeat
            // But we can show a toast or feedback
            console.log("Scan triggered:", data);
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                <span>Error fetching agents: {error.message}</span>
            </div>
        );
    }

    if (!agents || agents.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 rounded-xl bg-gray-800/30 border border-gray-700/50">
                <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-300">No Agents Connected</h3>
                <p className="text-sm">Waiting for agents to register...</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/80">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Hostname</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Version</th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {agents.map((agent) => {
                        const isScanning = agent.status.toLowerCase().includes('scanning');
                        const isPending = mutation.isPending && mutation.variables === agent.id;

                        return (
                            <tr key={agent.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm",
                                        isScanning
                                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse"
                                            : agent.status === 'Online' || agent.status === 'OK'
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>
                                        {isScanning ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 mr-1.5" />}
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
                                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">{agent.version}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => mutation.mutate(agent.id)}
                                        disabled={isScanning || isPending}
                                        className={cn(
                                            "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                                            isScanning
                                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
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
    );
}
