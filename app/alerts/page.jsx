"use client"; // Ensures this runs as a client component

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Header from "@/components/header";

// Fetch alerts from API
async function getAlerts() {
  try {
    const response = await fetch("https://foolish-pig-72.telebit.io/get-alerts"); // Ensure this matches your API route
    if (!response.ok) throw new Error("Failed to fetch alerts");
    
    const data = await response.json();
    // return data.alerts || []; // Ensure we extract the 'alerts' array
    return (data.alerts || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp) // Sort newest first
    );
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getAlerts();
      setAlerts(data);
    }
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header/>
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar />
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Cluster Alerts</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Alerts</CardTitle>
              <CardDescription>Showing all alerts from your Kubernetes cluster</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-[200px_1fr] font-medium bg-muted/50">
                  <div className="p-3 border-r">Time</div>
                  <div className="p-3">Message</div>
                </div>
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className="grid grid-cols-[200px_1fr] border-t">
                      <div className="p-3 border-r text-muted-foreground">
                        {formatDate(alert.timestamp)}
                      </div>
                      <div className="p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{alert.message}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-muted-foreground">No alerts available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
