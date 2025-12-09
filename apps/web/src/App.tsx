import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL;

export default function HostDashboard() {
    const [status, setStatus] = useState(null);
    const [routing, setRouting] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    async function safeFetch(url, setter) {
        try {
            const res = await fetch(`${API_BASE}${url}`);
            if (!res.ok) throw new Error(`${url} -> ${res.status}`);
            const data = await res.json();
            setter(data);
        } catch (err) {
            setErrors((prev) => [...prev, err.message]);
            console.error(err);
        }
    }

    async function refreshAll() {
        setLoading(true);
        setErrors([]);
        await Promise.all([
            safeFetch("/status", setStatus),
            safeFetch("/routing", setRouting),
            safeFetch("/clients", setNodes),
        ]);
        setLoading(false);
    }

    useEffect(() => {
        refreshAll();
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Host Management UI</h1>
                <Button onClick={refreshAll} disabled={loading} className="flex gap-2">
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {errors.length > 0 && (
                <Card className="border-red-500">
                    <CardContent className="p-4">
                        <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                            <AlertCircle /> Errors
                        </h2>
                        <ul className="mt-2 text-red-400 list-disc ml-6">
                            {errors.map((e, i) => (
                                <li key={i}>{e}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* STATUS */}
            <Card>
                <CardContent className="p-4">
                    <h2 className="text-2xl font-semibold mb-2">System Status</h2>
                    {status ? (
                        <table className="w-full">
                            <tbody>
                            {Object.entries(status).map(([key, value]) => (
                                <tr key={key}>
                                    <td className="font-semibold p-2">{key}</td>
                                    <td className="p-2">{String(value)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No status data available.</p>
                    )}
                </CardContent>
            </Card>

            {/* ROUTING */}
            <Card>
                <CardContent className="p-4">
                    <h2 className="text-2xl font-semibold mb-2">Routing</h2>
                    {routing ? (
                        <pre className="bg-black/20 p-3 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap">{JSON.stringify(routing, null, 2)}</pre>
                    ) : (
                        <p>No routing info available.</p>
                    )}
                </CardContent>
            </Card>

            {/* NODES */}
            <Card>
                <CardContent className="p-4">
                    <h2 className="text-2xl font-semibold mb-2">Connected Nodes</h2>
                    {nodes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {nodes.map((n) => (
                                <Card key={n.id} className="p-4 bg-neutral-900 rounded-2xl shadow">
                                    <h3 className="text-xl font-bold mb-2">{n.name}</h3>
                                    <p className="text-sm opacity-80">ID: {n.id}</p>
                                    <p className="text-sm opacity-80">Status: {n.status}</p>
                                    <p className="text-sm opacity-80">CPU: {n.cpu_usage}%</p>
                                    <p className="text-sm opacity-80">RAM: {n.ram_usage}%</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p>No nodes connected.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}