"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Activity,
  AlertCircle,
  Box,
  Code,
  Database,
  FileCode,
  Layers,
  Network,
  Server,
  Shield,
  Workflow,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/header"
import { Navbar } from "@/components/navbar"

// Sample YAML for demonstration
const sampleYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
        resources: {}
        securityContext:
          privileged: true
      hostNetwork: true`

// Sample code smells to detect
const detectCodeSmells = (yaml) => {
  const smells = []

  // Check for 'latest' tag
  if (yaml.includes("image:") && yaml.includes(":latest")) {
    smells.push({
      smell: "Using 'latest' tag",
      description:
        "Using the 'latest' tag can lead to unexpected changes when new versions are released. Specify a specific version instead.",
    })
  }

  // Check for missing resource limits
  if (yaml.includes("resources: {}") || (yaml.includes("resources:") && !yaml.includes("limits:"))) {
    smells.push({
      smell: "Missing resource limits",
      description:
        "Containers without resource limits can consume excessive resources and affect other workloads on the cluster.",
    })
  }

  // Check for privileged containers
  if (yaml.includes("privileged: true")) {
    smells.push({
      smell: "Privileged container",
      description:
        "Privileged containers have access to host resources and can pose security risks. Use more restrictive security contexts.",
    })
  }

  // Check for hostNetwork usage
  if (yaml.includes("hostNetwork: true")) {
    smells.push({
      smell: "Using host network",
      description:
        "Using host network can bypass network policies and expose the container directly to the host network.",
    })
  }

  // Check for single replica
  if (yaml.includes("replicas: 1")) {
    smells.push({
      smell: "Single replica",
      description:
        "Using a single replica doesn't provide high availability. Consider using multiple replicas for production workloads.",
    })
  }

  // Check for missing liveness/readiness probes
  if (!yaml.includes("livenessProbe:") && !yaml.includes("readinessProbe:")) {
    smells.push({
      smell: "Missing health probes",
      description: "Kubernetes can't properly determine container health without liveness and readiness probes.",
    })
  }

  return smells
}

export default function CodeSmellsPage() {
  const [yaml, setYaml] = useState(sampleYaml)
  const [smells, setSmells] = useState([])
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState(null)
  const [hasChecked, setHasChecked] = useState(false)

  const handleCheck = () => {
    setError(null)
    setIsChecking(true)
    setHasChecked(false)

    // Simple validation
    if (!yaml.trim()) {
      setError("Please enter YAML content to check")
      setIsChecking(false)
      return
    }

    // Simulate processing delay
    setTimeout(() => {
      try {
        // In a real app, you would validate the YAML syntax here
        const detectedSmells = detectCodeSmells(yaml)
        setSmells(detectedSmells)
        setHasChecked(true)
        setIsChecking(false)
      } catch (err) {
        setError("Invalid YAML format. Please check your input.")
        setIsChecking(false)
      }
    }, 1000)
  }

  const handleClear = () => {
    setYaml("")
    setSmells([])
    setError(null)
    setHasChecked(false)
  }

  const handleUseSample = () => {
    setYaml(sampleYaml)
    setSmells([])
    setError(null)
    setHasChecked(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header/>
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar/>
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Kubernetes YAML Code Smells</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleUseSample}>
                Use Sample
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Check Your Kubernetes YAML</CardTitle>
              <CardDescription>Paste your Kubernetes YAML to check for common issues and anti-patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Textarea
                placeholder="Paste your Kubernetes YAML here..."
                className="font-mono min-h-[300px]"
                value={yaml}
                onChange={(e) => setYaml(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCheck} disabled={isChecking} className="flex-1">
                  {isChecking ? "Checking..." : "Check Smells"}
                </Button>
                <Button variant="outline" onClick={handleClear} className="flex-1">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {hasChecked && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {smells.length > 0
                    ? `Found ${smells.length} potential issue${smells.length === 1 ? "" : "s"} in your YAML`
                    : "No issues found in your YAML"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {smells.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Smell</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {smells.map((smell, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{smell.smell}</TableCell>
                          <TableCell>{smell.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex items-center justify-center p-6 text-center">
                    <div>
                      <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                          <svg
                            className="h-6 w-6 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">All Good!</h3>
                      <p className="mt-2 text-sm text-muted-foreground">No code smells were detected in your YAML.</p>
                    </div>
                  </div>
                )}
              </CardContent>
              {smells.length > 0 && (
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Export Results
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Common Kubernetes YAML Code Smells</CardTitle>
              <CardDescription>Best practices to follow when writing Kubernetes manifests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-2">
                      <FileCode className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Avoid 'latest' Tags</h3>
                        <p className="text-sm text-muted-foreground">
                          Always specify exact versions for container images
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-2">
                      <FileCode className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Set Resource Limits</h3>
                        <p className="text-sm text-muted-foreground">Define CPU and memory limits for all containers</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-2">
                      <FileCode className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Use Health Probes</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure liveness and readiness probes for better reliability
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-2">
                      <FileCode className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Avoid Privileged Mode</h3>
                        <p className="text-sm text-muted-foreground">
                          Don't use privileged containers unless absolutely necessary
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

