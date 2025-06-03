"use client"

import { useState } from "react"
import Link from "next/link" // Added Link import
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Clock, Filter, Layers, Search, Server, X, Shield } from "lucide-react" // Added Shield import

export function WorkloadsList({ namespaces }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedNamespaces, setExpandedNamespaces] = useState([])

  // Toggle all namespaces expansion
  const toggleAllNamespaces = () => {
    if (expandedNamespaces.length === namespaces.length) {
      setExpandedNamespaces([])
    } else {
      setExpandedNamespaces(namespaces.map((ns) => ns.name))
    }
  }

  // Filter namespaces and pods based on search term and status filter
  const filteredNamespaces = namespaces
    .map((namespace) => {
      const filteredPods = namespace.pods.filter((pod) => {
        const matchesSearch =
          searchTerm === "" ||
          pod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pod.node && pod.node.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatus = statusFilter === "all" || pod.status.toLowerCase() === statusFilter.toLowerCase()

        return matchesSearch && matchesStatus
      })

      return {
        ...namespace,
        filteredPods,
        hasMatchingPods: filteredPods.length > 0,
      }
    })
    .filter((namespace) => namespace.hasMatchingPods)

  // Get pod status badge
  const getPodStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "running":
        return <Badge className="bg-green-500">{status}</Badge>
      case "pending":
        return <Badge className="bg-amber-500">{status}</Badge>
      case "failed":
        return <Badge className="bg-destructive">{status}</Badge>
      case "succeeded":
        return <Badge className="bg-blue-500">{status}</Badge>
      default:
        return <Badge className="bg-muted">{status}</Badge>
    }
  }

  // Count total pods by status
  const podStatusCounts = namespaces.reduce((counts, namespace) => {
    namespace.pods.forEach((pod) => {
      const status = pod.status.toLowerCase()
      counts[status] = (counts[status] || 0) + 1
    })
    return counts
  }, {})

  const totalPods = namespaces.reduce((total, ns) => total + ns.pods.length, 0)

  return (
    <div className="space-y-6">
      {/* Filters and search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search pods or nodes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 rounded-l-none"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="succeeded">Succeeded</option>
            </select>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={toggleAllNamespaces}>
          {expandedNamespaces.length === namespaces.length ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
        <Card className="flex items-center gap-2 p-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Pods</div>
            <div className="text-xl font-bold">{totalPods}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-2 p-3">
          <div className="rounded-full bg-green-500/10 p-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Running</div>
            <div className="text-xl font-bold">{podStatusCounts.running || 0}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-2 p-3">
          <div className="rounded-full bg-amber-500/10 p-2">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pending</div>
            <div className="text-xl font-bold">{podStatusCounts.pending || 0}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-2 p-3">
          <div className="rounded-full bg-destructive/10 p-2">
            <X className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Failed</div>
            <div className="text-xl font-bold">{podStatusCounts.failed || 0}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-2 p-3 sm:col-span-4 lg:col-span-1">
          <div className="rounded-full bg-muted p-2">
            <Server className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Namespaces</div>
            <div className="text-xl font-bold">{namespaces.length}</div>
          </div>
        </Card>
      </div>

      {/* Namespaces and pods */}
      {filteredNamespaces.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <Layers className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No pods found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No pods match your current filters. Try adjusting your search or filter criteria.
            </p>
          </div>
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={expandedNamespaces}
          onValueChange={setExpandedNamespaces}
          className="space-y-4"
        >
          {filteredNamespaces.map((namespace) => (
            <AccordionItem key={namespace.name} value={namespace.name} className="rounded-md border">
              <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-t-md [&[data-state=open]]:rounded-b-none">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="font-medium">{namespace.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {namespace.filteredPods.length} {namespace.filteredPods.length === 1 ? "pod" : "pods"}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="overflow-hidden px-0 pb-0">
                <div className="rounded-b-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Node</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Containers</TableHead>
                        <TableHead>Actions</TableHead {/* New Header */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {namespace.filteredPods.map((pod, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{pod.name}</TableCell>
                          <TableCell>{getPodStatusBadge(pod.status)}</TableCell>
                          <TableCell>{pod.node || "N/A"}</TableCell>
                          <TableCell>{pod.ip || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {pod.containers && Array.isArray(pod.containers) && pod.containers.map((container, i) => (
                                <Badge key={i} variant="secondary" className="max-w-[150px] truncate">
                                  {container}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell> {/* New Cell for Actions */}
                            {pod.containers && Array.isArray(pod.containers) && pod.containers.map((containerName, k) => (
                              <Link key={k} href={`/vulnerability-scanner?image_name=${encodeURIComponent(containerName)}`} passHref>
                                <Button variant="outline" size="sm" className="mr-2 mb-2">
                                  <Shield className="h-4 w-4 mr-1" />
                                  Scan
                                </Button>
                              </Link>
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}

