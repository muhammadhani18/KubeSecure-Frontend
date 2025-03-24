"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ClusterOverview } from "@/components/cluster-overview";
import { ResourceUsage } from "@/components/resource-usage";
import { NamespaceList } from "@/components/namespace-list";
import { DashboardTabs } from "@/components/dashboard-tabs";
import Header from "@/components/header";
// Fetch Cluster Info (Client Side)
async function fetchClusterInfo() {
  try {
    const response = await fetch("https://foolish-pig-72.telebit.io/cluster-info");
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch cluster info:", error);
    return {
      error: "Failed to fetch cluster information. Please ensure the API server is running.",
      nodes: { total: 0, ready: 0 },
      pods: { total: 0, running: 0, pending: 0 },
      resources: { cpu: "0%", memory: "0%", storage: "0%" },
      deployments: 0,
      events: [],
      namespaces: [],
    };
  }
}

export default function Home() {
  const [clusterInfo, setClusterInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data initially and every 1 hour
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const data = await fetchClusterInfo();
      setClusterInfo(data);
      setLoading(false);
    };

    getData(); // Initial fetch

    const interval = setInterval(getData, 3600000); // Re-fetch every 1 hour

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (loading) return <p>Loading cluster information...</p>;

  const hasError = !!clusterInfo.error;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header/>
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar />
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Cluster Dashboard</h1>
            <div className="flex items-center gap-2">
              <RefreshButton onRefresh={() => window.location.reload()} />
            </div>
          </div>

          {hasError && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardHeader>
                <CardTitle>Connection Error</CardTitle>
                <CardDescription>There was a problem connecting to the Kubernetes API server</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{clusterInfo.error}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardFooter>
            </Card>
          )}

          <ClusterOverview nodes={clusterInfo.nodes} pods={clusterInfo.pods} deployments={clusterInfo.deployments} />

          <div className="grid gap-6 md:grid-cols-2">
            <ResourceUsage resources={clusterInfo.resources} />
            <NamespaceList namespaces={clusterInfo.namespaces} />
          </div>

          <DashboardTabs namespaces={clusterInfo.namespaces} events={clusterInfo.events} />
        </main>
      </div>
    </div>
  );
}

// Refresh Button
function RefreshButton({ onRefresh }) {
  return (
    <Button variant="outline" size="sm" onClick={onRefresh}>
      Refresh
    </Button>
  );
}
