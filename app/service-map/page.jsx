"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Network, Search, ZoomIn, ZoomOut, RefreshCw, Download, Layers } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

// Generate dummy data for our service map
const generateDummyServiceMap = () => {
  const nodes = []
  const edges = []

  // Create an ingress
  nodes.push({
    id: "ingress-main",
    type: "ingress",
    name: "main-ingress",
    namespace: "default",
  })

  // Create frontend services and pods
  nodes.push({
    id: "svc-frontend",
    type: "service",
    name: "frontend",
    namespace: "default",
  })

  for (let i = 1; i <= 3; i++) {
    nodes.push({
      id: `pod-frontend-${i}`,
      type: "pod",
      name: `frontend-pod-${i}`,
      namespace: "default",
      status: "Running",
    })
    edges.push({
      source: "svc-frontend",
      target: `pod-frontend-${i}`,
      type: "service-to-pod",
    })
  }

  // Connect ingress to frontend
  edges.push({
    source: "ingress-main",
    target: "svc-frontend",
    type: "ingress-to-service",
  })

  // Create API services and pods
  nodes.push({
    id: "svc-api",
    type: "service",
    name: "api-gateway",
    namespace: "default",
  })

  for (let i = 1; i <= 2; i++) {
    nodes.push({
      id: `pod-api-${i}`,
      type: "pod",
      name: `api-gateway-pod-${i}`,
      namespace: "default",
      status: "Running",
    })
    edges.push({
      source: "svc-api",
      target: `pod-api-${i}`,
      type: "service-to-pod",
    })
  }

  // Connect frontend to API
  edges.push({
    source: "svc-frontend",
    target: "svc-api",
    type: "service-to-service",
  })

  // Create auth service and pods
  nodes.push({
    id: "svc-auth",
    type: "service",
    name: "auth-service",
    namespace: "auth",
  })

  for (let i = 1; i <= 2; i++) {
    nodes.push({
      id: `pod-auth-${i}`,
      type: "pod",
      name: `auth-service-pod-${i}`,
      namespace: "auth",
      status: "Running",
    })
    edges.push({
      source: "svc-auth",
      target: `pod-auth-${i}`,
      type: "service-to-pod",
    })
  }

  // Connect API to auth
  edges.push({
    source: "svc-api",
    target: "svc-auth",
    type: "service-to-service",
  })

  // Create database service and pods
  nodes.push({
    id: "svc-db",
    type: "service",
    name: "database",
    namespace: "data",
  })

  for (let i = 1; i <= 2; i++) {
    nodes.push({
      id: `pod-db-${i}`,
      type: "pod",
      name: `database-pod-${i}`,
      namespace: "data",
      status: i === 1 ? "Running" : "Pending",
    })
    edges.push({
      source: "svc-db",
      target: `pod-db-${i}`,
      type: "service-to-pod",
    })
  }

  // Connect API to database
  edges.push({
    source: "svc-api",
    target: "svc-db",
    type: "service-to-service",
  })

  // Create cache service and pods
  nodes.push({
    id: "svc-cache",
    type: "service",
    name: "redis-cache",
    namespace: "data",
  })

  for (let i = 1; i <= 3; i++) {
    nodes.push({
      id: `pod-cache-${i}`,
      type: "pod",
      name: `redis-cache-pod-${i}`,
      namespace: "data",
      status: "Running",
    })
    edges.push({
      source: "svc-cache",
      target: `pod-cache-${i}`,
      type: "service-to-pod",
    })
  }

  // Connect API to cache
  edges.push({
    source: "svc-api",
    target: "svc-cache",
    type: "service-to-service",
  })

  // Create monitoring service and pods
  nodes.push({
    id: "svc-monitoring",
    type: "service",
    name: "prometheus",
    namespace: "monitoring",
  })

  for (let i = 1; i <= 1; i++) {
    nodes.push({
      id: `pod-monitoring-${i}`,
      type: "pod",
      name: `prometheus-pod-${i}`,
      namespace: "monitoring",
      status: "Running",
    })
    edges.push({
      source: "svc-monitoring",
      target: `pod-monitoring-${i}`,
      type: "service-to-pod",
    })
  }

  // Create logging service and pods
  nodes.push({
    id: "svc-logging",
    type: "service",
    name: "elasticsearch",
    namespace: "logging",
  })

  for (let i = 1; i <= 2; i++) {
    nodes.push({
      id: `pod-logging-${i}`,
      type: "pod",
      name: `elasticsearch-pod-${i}`,
      namespace: "logging",
      status: "Running",
    })
    edges.push({
      source: "svc-logging",
      target: `pod-logging-${i}`,
      type: "service-to-pod",
    })
  }

  // Add some config maps and secrets
  nodes.push({
    id: "cm-api-config",
    type: "configmap",
    name: "api-config",
    namespace: "default",
  })

  nodes.push({
    id: "secret-db-creds",
    type: "secret",
    name: "db-credentials",
    namespace: "data",
  })

  return { nodes, edges }
}

export default function ServiceMapPage() {
  const canvasRef = useRef(null)
  const [serviceMap, setServiceMap] = useState(generateDummyServiceMap())
  const [selectedNode, setSelectedNode] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [activeNamespace, setActiveNamespace] = useState("all")
  const [activeTab, setActiveTab] = useState("map")

  // Initialize the canvas and start the simulation
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Assign initial positions to nodes
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Assign colors based on node type
    const nodeColors = {
      service: "#47b4ff", // Primary blue
      pod: "#10b981", // Green
      deployment: "#8b5cf6", // Purple
      ingress: "#f59e0b", // Amber
      configmap: "#6b7280", // Gray
      secret: "#ef4444", // Red
    }

    // Assign radius based on node type
    const nodeRadius = {
      service: 20,
      pod: 12,
      deployment: 18,
      ingress: 22,
      configmap: 15,
      secret: 15,
    }

    // Initialize node positions in a circle
    const nodes = serviceMap.nodes.map((node, i) => {
      const angle = (i / serviceMap.nodes.length) * 2 * Math.PI
      const radius = 200
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
        radius: nodeRadius[node.type],
        color: nodeColors[node.type],
      }
    })

    // Create a map of node IDs to nodes for quick lookup
    const nodeMap = new Map()
    nodes.forEach((node) => {
      nodeMap.set(node.id, node)
    })

    // Force simulation parameters
    const repulsionForce = 0.08
    const attractionForce = 0.01
    const maxSpeed = 1
    const damping = 0.95
    let simulationActive = true
    let simulationCooldown = 3 // Cooling counter

    // Animation loop
    let animationFrameId
    let isDragging = false
    let draggedNode = null
    let lastMouseX = 0
    let lastMouseY = 0

    const simulate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Apply forces and update positions only if simulation is active
      if (simulationActive) {
        let totalMovement = 0

        nodes.forEach((node) => {
          // Apply repulsion forces between nodes
          nodes.forEach((otherNode) => {
            if (node.id !== otherNode.id) {
              const dx = node.x - otherNode.x
              const dy = node.y - otherNode.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              const minDistance = (node.radius + otherNode.radius) * 3

              if (distance < minDistance) {
                const force = (repulsionForce * (minDistance - distance)) / distance
                node.vx += dx * force
                node.vy += dy * force
              }
            }
          })

          // Apply attraction forces along edges
          serviceMap.edges.forEach((edge) => {
            if (edge.source === node.id) {
              const targetNode = nodeMap.get(edge.target)
              if (targetNode) {
                const dx = targetNode.x - node.x
                const dy = targetNode.y - node.y
                node.vx += dx * attractionForce
                node.vy += dy * attractionForce
              }
            } else if (edge.target === node.id) {
              const sourceNode = nodeMap.get(edge.source)
              if (sourceNode) {
                const dx = sourceNode.x - node.x
                const dy = sourceNode.y - node.y
                node.vx += dx * attractionForce
                node.vy += dy * attractionForce
              }
            }
          })

          // Apply center gravity (reduced strength)
          const dx = centerX - node.x
          const dy = centerY - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          node.vx += dx * 0.0001 * distance // Reduced from 0.0005
          node.vy += dy * 0.0001 * distance // Reduced from 0.0005

          // Apply damping and limit speed
          node.vx *= damping
          node.vy *= damping
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
          if (speed > maxSpeed) {
            node.vx = (node.vx / speed) * maxSpeed
            node.vy = (node.vy / speed) * maxSpeed
          }

          // Update position
          if (!isDragging || node !== draggedNode) {
            node.x += node.vx
            node.y += node.vy
          }

          // Keep nodes within bounds
          const margin = 50
          if (node.x < margin) node.x = margin
          if (node.x > width - margin) node.x = width - margin
          if (node.y < margin) node.y = margin
          if (node.y > height - margin) node.y = margin
          if (node.y > height - margin) node.y = height - margin

          // Track total movement for stabilization
          totalMovement += Math.abs(node.vx) + Math.abs(node.vy)
        })

        // Check if simulation should stabilize
        if (totalMovement < 0.5) {
          simulationCooldown -= 1
          if (simulationCooldown <= 0) {
            simulationActive = false
            console.log("Simulation stabilized")
          }
        } else {
          // Reset cooldown if there's significant movement
          simulationCooldown = 100
        }
      }

      // Draw edges
      ctx.lineWidth = 1.5
      serviceMap.edges.forEach((edge) => {
        const sourceNode = nodeMap.get(edge.source)
        const targetNode = nodeMap.get(edge.target)
        if (sourceNode && targetNode) {
          ctx.beginPath()
          ctx.moveTo(sourceNode.x, sourceNode.y)

          // Draw different line styles based on edge type
          if (edge.type === "service-to-pod") {
            ctx.setLineDash([])
            ctx.strokeStyle = "rgba(71, 180, 255, 0.5)" // Blue with transparency
          } else if (edge.type === "service-to-service") {
            ctx.setLineDash([5, 5])
            ctx.strokeStyle = "rgba(139, 92, 246, 0.5)" // Purple with transparency
          } else if (edge.type === "ingress-to-service") {
            ctx.setLineDash([])
            ctx.strokeStyle = "rgba(245, 158, 11, 0.5)" // Amber with transparency
          } else {
            ctx.setLineDash([])
            ctx.strokeStyle = "rgba(107, 114, 128, 0.3)" // Gray with transparency
          }

          ctx.lineTo(targetNode.x, targetNode.y)
          ctx.stroke()
          ctx.setLineDash([])

          // Draw arrow for direction
          const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x)
          const arrowLength = 10
          const arrowWidth = 5
          const arrowX = targetNode.x - (targetNode.radius + arrowLength) * Math.cos(angle)
          const arrowY = targetNode.y - (targetNode.radius + arrowLength) * Math.sin(angle)

          ctx.beginPath()
          ctx.moveTo(arrowX, arrowY)
          ctx.lineTo(
            arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
            arrowY - arrowLength * Math.sin(angle - Math.PI / 6),
          )
          ctx.lineTo(
            arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
            arrowY - arrowLength * Math.sin(angle + Math.PI / 6),
          )
          ctx.closePath()
          ctx.fillStyle = ctx.strokeStyle
          ctx.fill()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        // Skip nodes that don't match the namespace filter
        if (activeNamespace !== "all" && node.namespace !== activeNamespace) {
          return
        }

        // Skip nodes that don't match the search term
        if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * zoomLevel, 0, 2 * Math.PI)

        // Highlight selected node
        if (selectedNode && selectedNode.id === node.id) {
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 3
          ctx.stroke()
        }

        // Fill based on node type
        ctx.fillStyle = node.color
        ctx.fill()

        // Draw node label
        ctx.font = `${12 * zoomLevel}px sans-serif`
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Draw different icons based on node type
        if (node.type === "service") {
          // Draw a network icon
          ctx.fillText("S", node.x, node.y)
        } else if (node.type === "pod") {
          // Draw a container icon
          ctx.fillText("P", node.x, node.y)
        } else if (node.type === "ingress") {
          // Draw an ingress icon
          ctx.fillText("I", node.x, node.y)
        } else if (node.type === "configmap") {
          // Draw a config icon
          ctx.fillText("C", node.x, node.y)
        } else if (node.type === "secret") {
          // Draw a lock icon
          ctx.fillText("S", node.x, node.y)
        }

        // Draw node name below the node
        ctx.font = `${10 * zoomLevel}px sans-serif`
        ctx.fillStyle = "#e2e8f0"
        ctx.fillText(node.name, node.x, node.y + node.radius * 2)
      })

      animationFrameId = requestAnimationFrame(simulate)
    }

    // Start simulation
    simulate()

    // Handle mouse interactions
    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Check if a node was clicked
      for (const node of nodes) {
        const dx = mouseX - node.x
        const dy = mouseY - node.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < node.radius * zoomLevel) {
          isDragging = true
          draggedNode = node
          lastMouseX = mouseX
          lastMouseY = mouseY
          setSelectedNode(node)
          restartSimulation() // Restart simulation when dragging
          break
        }
      }
    }

    const handleMouseMove = (e) => {
      if (isDragging && draggedNode) {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        draggedNode.x += mouseX - lastMouseX
        draggedNode.y += mouseY - lastMouseY
    }

        lastMouseX = mouseX
        lastMouseY = mouseY
      }

    const handleMouseUp = () => {
      isDragging = false
      draggedNode = null
    }

    const restartSimulation = () => {
      simulationActive = true
      simulationCooldown = 100
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseUp)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseUp)
    }
  }, [serviceMap, zoomLevel, searchTerm, activeNamespace, selectedNode])

  // Get unique namespaces for filtering
  const namespaces = ["all", ...new Set(serviceMap.nodes.map((node) => node.namespace))]

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setServiceMap(generateDummyServiceMap())
      setIsLoading(false)
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (ctx) {
          simulationActive = true
          simulationCooldown = 100
        }
      }
    }, 1000)
  }

  // Handle zoom
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-6 md:px-8">
          <div className="flex items-center gap-2 font-semibold">
            <Layers className="h-6 w-6 text-primary" />
            <span>KubeVision</span>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-4">
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
            <Button variant="ghost" size="sm">
              Settings
            </Button>
            <Button variant="ghost" size="sm">
              Support
            </Button>
          </nav>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-[240px] shrink-0 overflow-y-auto border-r md:block transition-all duration-300 ease-in-out">
          <div className="py-4 sm:py-6 md:py-8 pr-4 sm:pr-6 pl-4">
            <nav className="grid gap-2 text-sm">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <Link
                href="/ratelimiting"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 2v20" />
                  <path d="M2 12h20" />
                  <path d="M12 2v20" />
                  <path d="M12 2v20" />
                </svg>
                <span>Rate Limiting</span>
              </Link>
              <Link
                href="/tetragon"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <span>Tetragon</span>
              </Link>
              <Link
                href="/code-smells"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M9 15v-1" />
                  <path d="M12 15v-6" />
                  <path d="M15 15v-3" />
                </svg>
                <span>k8s Code Smells</span>
              </Link>
              <Link
                href="/service-map"
                className="flex items-center gap-3 rounded-lg px-3 py-2 bg-accent text-accent-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M3 3v18h18" />
                  <path d="M7 17 17 7" />
                  <path d="M10 16v-4h4" />
                </svg>
                <span>Service Map</span>
              </Link>
              <Link
                href="/security"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Security</span>
              </Link>
              <Link
                href="/alerts"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span>Alerts</span>
              </Link>
            </nav>
          </div>
        </aside>
        <main className="flex-1 md:ml-[240px]">
          <div className="container py-6 px-6 md:px-8">
            <div className="flex flex-col space-y-1.5 mb-6">
              <h1 className="text-2xl font-semibold">Service Map</h1>
              <p className="text-sm text-muted-foreground">
                Visualize the connections between services, pods, and other resources in your cluster
              </p>
            </div>

            <div className="flex justify-end mb-4 gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                <span className="ml-2">Export</span>
              </Button>
            </div>

            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="map" className="rounded-sm px-4 py-1.5">
                    Service Map
                  </TabsTrigger>
                  <TabsTrigger value="list" className="rounded-sm px-4 py-1.5">
                    Resource List
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="map" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>Cluster Topology</CardTitle>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-xs">{Math.round(zoomLevel * 100)}%</span>
                            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>Interactive visualization of your Kubernetes resources</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="relative h-[600px] w-full overflow-hidden rounded-b-lg bg-muted/20">
                          <canvas ref={canvasRef} className="absolute inset-0" />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Filters</CardTitle>
                          <CardDescription>Filter the service map view</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="search"
                                placeholder="Search resources..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Namespace</label>
                            <Select value={activeNamespace} onValueChange={setActiveNamespace}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select namespace" />
                              </SelectTrigger>
                              <SelectContent>
                                {namespaces.map((namespace) => (
                                  <SelectItem key={namespace} value={namespace}>
                                    {namespace === "all" ? "All Namespaces" : namespace}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Resource Types</label>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="cursor-pointer bg-[#47b4ff]/10">
                                Services
                              </Badge>
                              <Badge variant="outline" className="cursor-pointer bg-[#10b981]/10">
                                Pods
                              </Badge>
                              <Badge variant="outline" className="cursor-pointer bg-[#f59e0b]/10">
                                Ingress
                              </Badge>
                              <Badge variant="outline" className="cursor-pointer bg-[#6b7280]/10">
                                ConfigMaps
                              </Badge>
                              <Badge variant="outline" className="cursor-pointer bg-[#ef4444]/10">
                                Secrets
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {selectedNode && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle>Resource Details</CardTitle>
                            <CardDescription>Information about the selected resource</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: selectedNode.color }}
                              ></div>
                              <span className="font-medium">{selectedNode.name}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Type</div>
                              <div className="font-medium capitalize">{selectedNode.type}</div>

                              <div className="text-muted-foreground">Namespace</div>
                              <div className="font-medium">{selectedNode.namespace}</div>

                              {selectedNode.status && (
                                <>
                                  <div className="text-muted-foreground">Status</div>
                                  <div className="font-medium">
                                    <Badge
                                      variant="outline"
                                      className={
                                        selectedNode.status === "Running"
                                          ? "bg-green-500/10 text-green-500"
                                          : selectedNode.status === "Pending"
                                            ? "bg-amber-500/10 text-amber-500"
                                            : "bg-red-500/10 text-red-500"
                                      }
                                    >
                                      {selectedNode.status}
                                    </Badge>
                                  </div>
                                </>
                              )}

                              <div className="text-muted-foreground">Connections</div>
                              <div className="font-medium">
                                {
                                  serviceMap.edges.filter(
                                    (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id,
                                  ).length
                                }
                              </div>
                            </div>

                            <Button variant="outline" size="sm" className="w-full">
                              View Full Details
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Legend</CardTitle>
                          <CardDescription>Map symbols and colors</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#47b4ff]"></div>
                            <span className="text-sm">Service</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#10b981]"></div>
                            <span className="text-sm">Pod</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#f59e0b]"></div>
                            <span className="text-sm">Ingress</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#6b7280]"></div>
                            <span className="text-sm">ConfigMap</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#ef4444]"></div>
                            <span className="text-sm">Secret</span>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <div className="h-0.5 w-8 bg-[rgba(71,180,255,0.5)]"></div>
                              <span className="text-sm">Service to Pod</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="h-0.5 w-8 bg-[rgba(139,92,246,0.5)] border-t border-dashed"></div>
                              <span className="text-sm">Service to Service</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="h-0.5 w-8 bg-[rgba(245,158,11,0.5)]"></div>
                              <span className="text-sm">Ingress to Service</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="list" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resource List</CardTitle>
                      <CardDescription>All resources in your cluster</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                Name
                              </th>
                              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                Type
                              </th>
                              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                Namespace
                              </th>
                              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                Status
                              </th>
                              <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                                Connections
                              </th>
                              <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviceMap.nodes.map((node) => (
                              <tr key={node.id} className="border-t hover:bg-muted/50">
                                <td className="p-4 align-middle">{node.name}</td>
                                <td className="p-4 align-middle capitalize">{node.type}</td>
                                <td className="p-4 align-middle">{node.namespace}</td>
                                <td className="p-4 align-middle">
                                  {node.status ? (
                                    <Badge
                                      variant="outline"
                                      className={
                                        node.status === "Running"
                                          ? "bg-green-500/10 text-green-500"
                                          : node.status === "Pending"
                                            ? "bg-amber-500/10 text-amber-500"
                                            : "bg-red-500/10 text-red-500"
                                      }
                                    >
                                      {node.status}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  {
                                    serviceMap.edges.filter(
                                      (edge) => edge.source === node.id || edge.target === node.id,
                                    ).length
                                  }
                                </td>
                                <td className="p-4 align-middle text-right">
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
