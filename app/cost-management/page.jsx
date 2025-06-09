// EXPECTED DATA STRUCTURE FOR ENHANCED CLUSTER INFO API (/api/cluster-workload-metrics or similar)
// This page will expect an array of workload objects, where each object provides detailed metrics.
// Example structure for a single workload (e.g., a Pod):

// [
//   {
//     "name": "my-app-pod-xyz123",
//     "namespace": "production",
//     "nodeName": "worker-node-1",
//     "status": "Running", // e.g., Running, Pending, Succeeded, Failed
//     "containers": [
//       {
//         "name": "my-app-container",
//         "image": "myregistry/my-app:latest",
//         "resources": {
//           "requests": {
//             "cpu": "500m", // Millicores (0.5 core) or full cores ("1")
//             "memory": "256Mi" // Mebibytes or Gibibytes
//           },
//           "limits": {
//             "cpu": "1", 
//             "memory": "512Mi"
//           },
//           "usage": { // Current actual usage from metrics server
//             "cpu": "100m", 
//             "memory": "150Mi"
//           }
//         }
//       }
//       // ... potentially more containers in the pod
//     ],
//     "creationTimestamp": "2023-10-26T10:00:00Z",
//     // Future additions could include labels, annotations, controller info (Deployment, StatefulSet)
//   }
//   // ... more workload objects
// ]

// This data would ideally be fetched from an API endpoint like `/api/cluster-workload-metrics`
// which would gather this information from the Kubernetes API server and metrics server.

"use client"

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Header from "@/components/header";

const COST_PER_CPU_CORE_HOUR = 0.02; // $0.02 per core-hour
const COST_PER_GB_RAM_HOUR = 0.01;   // $0.01 per GB-hour
const OPTIMIZATION_THRESHOLD_PERCENTAGE = 30; // If usage is < 30% of request, suggest optimization.

// Helper function to parse CPU strings (e.g., "500m", "1") into cores
function parseCpuToCores(cpuString) {
  if (!cpuString) return 0;
  if (cpuString.endsWith('m')) {
    return parseFloat(cpuString.slice(0, -1)) / 1000;
  }
  return parseFloat(cpuString);
}

// Helper function to parse memory strings (e.g., "128Mi", "2Gi") into GB
function parseMemoryToGB(memoryString) {
  if (!memoryString) return 0;
  const value = parseFloat(memoryString);
  if (memoryString.endsWith('Mi')) {
    return value / 1024; // Mebibytes to Gibibytes
  }
  if (memoryString.endsWith('Gi')) {
    return value; // Already in Gibibytes
  }
  if (memoryString.endsWith('Ki')) {
    return value / (1024 * 1024); // Kibibytes to Gibibytes
  }
  // Assuming bytes if no unit, or handle other units if necessary
  return value / (1024 * 1024 * 1024); 
}

export default function CostManagementPage() {
  const mockWorkloadMetrics = [
    {
      "name": "frontend-app-7b5b9d7c9c-xl2v5",
      "namespace": "production",
      "nodeName": "node-1",
      "containers": [
        {
          "name": "nginx-container",
          "status": "Running",
          "image": "nginx:latest",
          "resources": {
            "requests": { "cpu": "100m", "memory": "128Mi" },
            "limits": { "cpu": "200m", "memory": "256Mi" },
            "usage": { "cpu": "50m", "memory": "80Mi" }
          }
        }
      ],
      "creationTimestamp": "2023-10-25T10:00:00Z"
    },
    {
      "name": "backend-api-5dcf774f78-abcde",
      "namespace": "production",
      "nodeName": "node-2",
      "status": "Running",
      "containers": [
        {
          "name": "api-server-container",
          "image": "myapi:v1.2.0",
          "resources": {
            "requests": { "cpu": "500m", "memory": "512Mi" },
            "limits": { "cpu": "1", "memory": "1Gi" },
            "usage": { "cpu": "450m", "memory": "400Mi" }
          }
        }
      ],
      "creationTimestamp": "2023-10-24T12:30:00Z"
    },
    {
      "name": "database-0",
      "namespace": "data-services",
      "nodeName": "node-1",
      "status": "Running",
      "containers": [
        {
          "name": "postgres-container",
          "image": "postgres:15",
          "resources": {
            "requests": { "cpu": "1", "memory": "2Gi" },
            "limits": { "cpu": "2", "memory": "4Gi" },
            "usage": { "cpu": "200m", "memory": "1.5Gi" } // Example of underutilized CPU
          }
        }
      ],
      "creationTimestamp": "2023-10-23T08:00:00Z"
    },
    {
      "name": "batch-job-processor-xzyw-12345",
      "namespace": "batch-jobs",
      "nodeName": "node-3",
      "status": "Succeeded", // Example of a completed job
      "containers": [
        {
          "name": "processor",
          "image": "mybatch/processor:latest",
          "resources": {
            "requests": { "cpu": "200m", "memory": "256Mi" },
            "limits": { "cpu": "500m", "memory": "512Mi" },
            "usage": { "cpu": "180m", "memory": "200Mi" } // Usage close to request
          }
        }
      ],
      "creationTimestamp": "2023-10-26T14:00:00Z"
    },
    {
      "name": "cache-service-6c8f5d9f4b-ghijk",
      "namespace": "default",
      "nodeName": "node-2",
      "status": "Running",
      "containers": [
        {
          "name": "redis-container",
          "image": "redis:alpine",
          "resources": {
            "requests": { "cpu": "50m", "memory": "100Mi" },
            "limits": { "cpu": "100m", "memory": "200Mi" },
            "usage": { "cpu": "10m", "memory": "50Mi" } // Significantly underutilized
          }
        }
      ],
      "creationTimestamp": "2023-10-22T16:00:00Z"
    }
  ];

  const [estimatedCosts, setEstimatedCosts] = useState({ workloads: [], total: 0 });
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);

  useEffect(() => {
    let totalCost = 0;
    const workloadCosts = mockWorkloadMetrics.map(workload => {
      let workloadHourlyCost = 0;
      workload.containers.forEach(container => {
        const cpuUsageCores = parseCpuToCores(container.resources.usage?.cpu);
        const memoryUsageGB = parseMemoryToGB(container.resources.usage?.memory);
        
        // Fallback to requests if usage is 0 or undefined
        const cpuCores = cpuUsageCores > 0 ? cpuUsageCores : parseCpuToCores(container.resources.requests?.cpu);
        const memoryGB = memoryUsageGB > 0 ? memoryUsageGB : parseMemoryToGB(container.resources.requests?.memory);

        const cpuCost = cpuCores * COST_PER_CPU_CORE_HOUR;
        const memoryCost = memoryGB * COST_PER_GB_RAM_HOUR;
        workloadHourlyCost += cpuCost + memoryCost;
      });
      totalCost += workloadHourlyCost;
      return { 
        name: workload.name, 
        namespace: workload.namespace,
        hourlyCost: workloadHourlyCost 
      };
    });

    setEstimatedCosts({ workloads: workloadCosts, total: totalCost });
    // console.log("Calculated Costs:", { workloads: workloadCosts, total: totalCost }); // For verification

    // --- New Optimization Logic Start ---
    const suggestions = [];
    mockWorkloadMetrics.forEach(workload => {
      workload.containers.forEach(container => {
        const cpuUsageCores = parseCpuToCores(container.resources.usage?.cpu);
        const cpuRequestsCores = parseCpuToCores(container.resources.requests?.cpu);
        const memoryUsageGB = parseMemoryToGB(container.resources.usage?.memory);
        const memoryRequestsGB = parseMemoryToGB(container.resources.requests?.memory);

        if (cpuRequestsCores > 0) { // Avoid division by zero if request is 0
          const cpuUtilizationPercentage = (cpuUsageCores / cpuRequestsCores) * 100;
          if (cpuUtilizationPercentage < OPTIMIZATION_THRESHOLD_PERCENTAGE) {
            suggestions.push({
              type: "CPU",
              workloadName: workload.name,
              namespace: workload.namespace,
              containerName: container.name,
              usage: `${(cpuUsageCores * 1000).toFixed(0)}m`,
              request: `${(cpuRequestsCores * 1000).toFixed(0)}m`,
              utilization: cpuUtilizationPercentage.toFixed(1),
              suggestion: `CPU usage (${cpuUtilizationPercentage.toFixed(1)}%) is significantly lower than requested. Consider reducing CPU requests.`
            });
          }
        }

        if (memoryRequestsGB > 0) { // Avoid division by zero
          const memoryUtilizationPercentage = (memoryUsageGB / memoryRequestsGB) * 100;
          if (memoryUtilizationPercentage < OPTIMIZATION_THRESHOLD_PERCENTAGE) {
            suggestions.push({
              type: "Memory",
              workloadName: workload.name,
              namespace: workload.namespace,
              containerName: container.name,
              usage: `${(memoryUsageGB * 1024).toFixed(0)}Mi`, // Display in Mi for consistency
              request: `${(memoryRequestsGB * 1024).toFixed(0)}Mi`,
              utilization: memoryUtilizationPercentage.toFixed(1),
              suggestion: `Memory usage (${memoryUtilizationPercentage.toFixed(1)}%) is significantly lower than requested. Consider reducing memory requests.`
            });
          }
        }
      });
    });
    setOptimizationSuggestions(suggestions);
    console.log("Optimization Suggestions:", suggestions); // For verification
    // --- New Optimization Logic End ---

  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar />
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center">
              <DollarSign className="h-6 w-6 mr-2" /> Cost Management
            </h1>
          </div>

          {/* MOCK DATA ALERT START */}
          <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-700">
            <AlertTriangle className="h-4 w-4 !text-amber-600" />
            <AlertTitle className="font-semibold !text-amber-800">Mock Data Demonstration</AlertTitle>
            <AlertDescription className="!text-amber-700">
              The data displayed on this page is based on <strong>mock metrics</strong> for demonstration purposes. 
              Actual cost and optimization insights require integration with a backend service that provides real-time Kubernetes cluster metrics. 
              The cost figures are estimates based on hypothetical unit prices.
            </AlertDescription>
          </Alert>
          {/* MOCK DATA ALERT END */}

          {/* TOTAL ESTIMATED COST CARD START */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl flex items-center">
                <DollarSign className="h-6 w-6 mr-2 text-green-500" />
                Estimated Hourly Cluster Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${estimatedCosts.total > 0 ? estimatedCosts.total.toFixed(2) : '0.00'}
                <span className="text-sm text-muted-foreground ml-1">/ hour</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on current mock usage data and hypothetical costs.
              </p>
            </CardContent>
          </Card>
          {/* TOTAL ESTIMATED COST CARD END */}

          {/* WORKLOAD COST BREAKDOWN CARD START */}
          <Card>
            <CardHeader>
              <CardTitle>Workload Cost Breakdown (Hourly)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workload Name</TableHead>
                      <TableHead>Namespace</TableHead>
                      <TableHead className="text-right">Est. Hourly Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimatedCosts.workloads && estimatedCosts.workloads.length > 0 ? (
                      estimatedCosts.workloads.map((workload, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{workload.name}</TableCell>
                          <TableCell>{workload.namespace}</TableCell>
                          <TableCell className="text-right">
                            ${workload.hourlyCost.toFixed(4)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="3" className="text-center">
                          No workload cost data available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
          {/* WORKLOAD COST BREAKDOWN CARD END */}

          {/* OPTIMIZATION SUGGESTIONS CARD START */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-blue-500" />
                Optimization Opportunities
              </CardTitle>
              <CardDescription>
                Suggestions to potentially reduce costs by rightsizing resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationSuggestions && optimizationSuggestions.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {optimizationSuggestions.map((opt, index) => (
                      <div key={index} className="p-3 border rounded-md bg-muted/20">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={opt.type === 'CPU' ? 'destructive' : 'secondary'}>
                            {opt.type} Underutilization
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {opt.namespace} / {opt.workloadName} / {opt.containerName}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{opt.suggestion}</p>
                        <div className="text-xs text-muted-foreground">
                          Current Usage: <span className="font-semibold">{opt.usage}</span> | 
                          Requested: <span className="font-semibold">{opt.request}</span> | 
                          Utilization: <span className="font-semibold">{opt.utilization}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No specific optimization suggestions found based on current mock data and thresholds.
                </p>
              )}
            </CardContent>
          </Card>
          {/* OPTIMIZATION SUGGESTIONS CARD END */}
        </main>
      </div>
    </div>
  );
}