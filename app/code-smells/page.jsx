"use client"

import { useState, useRef,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileCode, Upload, AlertCircle, CheckCircle, Loader2, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Navbar } from "@/components/navbar"
import Header from "@/components/header"
import { useRouter } from "next/navigation";

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
  const [file, setFile] = useState(null)
  const [smells, setSmells] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const router = useRouter();
  
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".yaml") && !selectedFile.name.endsWith(".yml")) {
        setError("Please select a YAML file (.yaml or .yml)")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (!droppedFile.name.endsWith(".yaml") && !droppedFile.name.endsWith(".yml")) {
        setError("Please select a YAML file (.yaml or .yml)")
        setFile(null)
        return
      }
      setFile(droppedFile)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a YAML file first")
      return
    }

    setIsLoading(true)
    setError(null)
    setSmells([])

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/detect-smells", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to analyze YAML file")
      }

      const data = await response.json()
      setSmells(data.smells || [])

      toast({
        title: "Analysis Complete",
        description: `Found ${data.smells.length} code smells in your YAML file.`,
      })
    } catch (err) {
      console.error("Error analyzing YAML:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearFile = () => {
    setFile(null)
    setSmells([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Group smells by category
  const groupedSmells = smells.reduce((acc, smell) => {
    const match = smell.match(/\[(.*?)\]/)
    const category = match ? match[1] : "Other"

    if (!acc[category]) {
      acc[category] = []
    }

    acc[category].push(smell)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header/>
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar/>
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Kubernetes YAML Code Smells</h1>
            <div className="flex items-center gap-2">
              {/* <Button variant="outline" size="sm" onClick={handleUseSample}>
                Use Sample
              </Button> */}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Kubernetes YAML</CardTitle>
              <CardDescription>
                Upload your Kubernetes YAML file to detect potential code smells and best practice violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  file ? "border-primary" : "border-border"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".yaml,.yml"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />

                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileText className="h-8 w-8" />
                      <span className="text-lg font-medium">{file.name}</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={handleClearFile}>
                        Clear
                      </Button>
                      <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <FileCode className="mr-2 h-4 w-4" />
                            Analyze YAML
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Drag and drop your YAML file here</h3>
                    <p className="text-sm text-muted-foreground">
                      or{" "}
                      <Button variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()}>
                        browse
                      </Button>{" "}
                      to upload
                    </p>
                    <p className="text-xs text-muted-foreground">Supports .yaml and .yml files</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {smells.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>Found {smells.length} potential code smells in your Kubernetes YAML</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedSmells).map(([category, categorySmells]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-medium text-primary">{categorySmells.length}</span>
                        </span>
                        {category} Issues
                      </h3>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-[100px]">Severity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categorySmells.map((smell, index) => {
                              // Extract the description part (after the category)
                              const description = smell.replace(/\[.*?\]\s*/, "")

                              // Determine severity based on category
                              let severity = "Medium"
                              if (category.includes("Security") || category.includes("Overprivileged")) {
                                severity = "High"
                              } else if (category.includes("Health") || category.includes("Resource")) {
                                severity = "Medium"
                              } else {
                                severity = "Low"
                              }

                              return (
                                <TableRow key={index}>
                                  <TableCell>{description}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        severity === "High"
                                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                          : severity === "Medium"
                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      }`}
                                    >
                                      {severity}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  <p>
                    These are potential issues that might need attention. Not all code smells are necessarily problems
                    in every context.
                  </p>
                </div>
              </CardFooter>
            </Card>
          )}

          {smells.length === 0 && file && !isLoading && !error && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  No Code Smells Detected
                </CardTitle>
                <CardDescription>Your YAML file follows Kubernetes best practices</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No issues were found in your Kubernetes YAML file. This is a good sign that your configuration follows
                  best practices.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Common Kubernetes Code Smells</CardTitle>
              <CardDescription>Learn about common anti-patterns in Kubernetes YAML files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Using 'latest' Tag</h3>
                  <p className="text-sm text-muted-foreground">
                    Using the 'latest' tag for container images makes deployments unpredictable and can lead to
                    unexpected behavior.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Missing Resource Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    Containers without resource limits can consume excessive resources and affect other workloads.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Running as Root</h3>
                  <p className="text-sm text-muted-foreground">
                    Containers running as root pose security risks if they are compromised.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Missing Health Probes</h3>
                  <p className="text-sm text-muted-foreground">
                    Without liveness and readiness probes, Kubernetes cannot properly manage container lifecycle.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Privileged Containers</h3>
                  <p className="text-sm text-muted-foreground">
                    Privileged containers have full access to the host, which is a significant security risk.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Using Default Namespace</h3>
                  <p className="text-sm text-muted-foreground">
                    Using the default namespace makes it harder to manage resources and apply proper access controls.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
