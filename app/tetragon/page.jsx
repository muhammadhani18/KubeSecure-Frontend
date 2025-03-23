"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Activity, AlertCircle, Box, Database, FileText, Layers, Network, Server, Shield, Workflow } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navbar } from "@/components/navbar"
import Header from "@/components/header"


// Sample data for the table
const initialPolicies = [
  {
    id: 1,
    name: "Block Shell Execution",
    call: "exec",
    syscall: "execve",
    match_commands: "/bin/sh, /bin/bash",
    actions: "Audit, Alert",
  },
  {
    id: 2,
    name: "Prevent File Deletion",
    call: "unlink",
    syscall: "unlinkat",
    match_commands: "/etc/passwd, /etc/shadow",
    actions: "Block, Alert",
  },
  {
    id: 3,
    name: "Monitor Network Connections",
    call: "connect",
    syscall: "connect",
    match_commands: "*",
    actions: "Audit",
  },
  {
    id: 4,
    name: "Prevent Privilege Escalation",
    call: "setuid",
    syscall: "setuid",
    match_commands: "*",
    actions: "Block, Alert",
  },
  {
    id: 5,
    name: "Block Unauthorized Mount",
    call: "mount",
    syscall: "mount",
    match_commands: "/dev/*, /proc/*",
    actions: "Block, Alert",
  },
]

export default function TetragonPage() {
  const [policies, setPolicies] = useState(initialPolicies)
  const [policyName, setPolicyName] = useState("")
  const [policyCommand, setPolicyCommand] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newPolicy = {
        id: policies.length + 1,
        name: policyName,
        call: "custom",
        syscall: "custom",
        match_commands: policyCommand,
        actions: "Audit, Alert",
      }

      setPolicies([...policies, newPolicy])
      setPolicyName("")
      setPolicyCommand("")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar />
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Tetragon Policy Enforcement</h1>
            
          </div>

          <Tabs defaultValue="policies" className="w-full">
            <TabsList>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="add">Add Policy</TabsTrigger>
              <TabsTrigger value="logs">Enforcement Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="policies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enforced Policies</CardTitle>
                  <CardDescription>List of all Tetragon policies currently enforced in your cluster</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Call</TableHead>
                        <TableHead>Syscall</TableHead>
                        <TableHead>Match Commands</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead className="text-right">Options</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policies.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-medium">{policy.name}</TableCell>
                          <TableCell>{policy.call}</TableCell>
                          <TableCell>{policy.syscall}</TableCell>
                          <TableCell>{policy.match_commands}</TableCell>
                          <TableCell>{policy.actions}</TableCell>
                          <TableCell className="text-right">
                            
                            <Button variant="ghost" size="sm" className="text-destructive">
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Policy Statistics</CardTitle>
                  <CardDescription>Overview of policy enforcement statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">Total Policies</div>
                      <div className="text-2xl font-bold">{policies.length}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">Blocking Policies</div>
                      <div className="text-2xl font-bold text-amber-500">3</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">Audit Policies</div>
                      <div className="text-2xl font-bold text-blue-500">5</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">Alert Policies</div>
                      <div className="text-2xl font-bold text-green-500">4</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Policy</CardTitle>
                  <CardDescription>Create a new Tetragon policy to enforce in your cluster</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="policy-name">Policy Name</Label>
                      <Input
                        id="policy-name"
                        placeholder="Enter policy name"
                        value={policyName}
                        onChange={(e) => setPolicyName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="policy-command">Policy Command</Label>
                      <Textarea
                        id="policy-command"
                        placeholder="Enter command pattern to match (e.g., /bin/bash, /usr/bin/curl)"
                        value={policyCommand}
                        onChange={(e) => setPolicyCommand(e.target.value)}
                        required
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Add Policy"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Policy Templates</CardTitle>
                  <CardDescription>Common policy templates you can use as a starting point</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors">
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Block Shell Execution</h3>
                          <p className="text-sm text-muted-foreground">Prevents execution of shell commands</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors">
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Network Monitoring</h3>
                          <p className="text-sm text-muted-foreground">Monitors all network connections</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors">
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">File System Protection</h3>
                          <p className="text-sm text-muted-foreground">Prevents modification of critical files</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors">
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Privilege Escalation</h3>
                          <p className="text-sm text-muted-foreground">Blocks attempts to gain higher privileges</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enforcement Logs</CardTitle>
                  <CardDescription>Recent policy enforcement events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-[150px_150px_1fr_150px] font-medium bg-muted/50">
                      <div className="p-3 border-r">Timestamp</div>
                      <div className="p-3 border-r">Policy</div>
                      <div className="p-3 border-r">Event</div>
                      <div className="p-3">Action</div>
                    </div>
                    <div className="grid grid-cols-[150px_150px_1fr_150px] border-t">
                      <div className="p-3 border-r text-muted-foreground">Jun 15, 10:30 AM</div>
                      <div className="p-3 border-r">Block Shell Execution</div>
                      <div className="p-3 border-r">Attempted to execute /bin/bash in pod frontend-5d8f9</div>
                      <div className="p-3 text-red-500">Blocked</div>
                    </div>
                    <div className="grid grid-cols-[150px_150px_1fr_150px] border-t">
                      <div className="p-3 border-r text-muted-foreground">Jun 15, 09:45 AM</div>
                      <div className="p-3 border-r">Monitor Network</div>
                      <div className="p-3 border-r">
                        Connection to external IP 203.0.113.1:443 from pod backend-api-3f7d2
                      </div>
                      <div className="p-3 text-blue-500">Audited</div>
                    </div>
                    <div className="grid grid-cols-[150px_150px_1fr_150px] border-t">
                      <div className="p-3 border-r text-muted-foreground">Jun 15, 09:15 AM</div>
                      <div className="p-3 border-r">Prevent File Deletion</div>
                      <div className="p-3 border-r">Attempted to delete /etc/passwd in pod database-7c9f3</div>
                      <div className="p-3 text-red-500">Blocked</div>
                    </div>
                    <div className="grid grid-cols-[150px_150px_1fr_150px] border-t">
                      <div className="p-3 border-r text-muted-foreground">Jun 15, 08:30 AM</div>
                      <div className="p-3 border-r">Privilege Escalation</div>
                      <div className="p-3 border-r">Attempted setuid operation in pod analytics-worker-7d8f9</div>
                      <div className="p-3 text-red-500">Blocked</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Logs
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

