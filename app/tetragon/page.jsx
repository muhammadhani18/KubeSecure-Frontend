"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, FileText, Layers, Shield, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function TetragonPage() {
  const [policies, setPolicies] = useState([])
  const [policyName, setPolicyName] = useState("")
  const [policyCommand, setPolicyCommand] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?minutes=10`);
      const jsonData = await response.json();
      setEvents(jsonData);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);
  // Fetch policies on component mount
  useEffect(() => {
    fetchPolicies()
  }, [])

  // Function to fetch policies from the API
  const fetchPolicies = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-policies`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch policies")
      }

      const data = await response.json()

      // Transform the API response to match our UI format
      const formattedPolicies = data.policies.map((policy, index) => {
        // Get the first kprobe for simplicity (we can enhance this later)
        const kprobe = policy.kprobes[0] || {}

        return {
          id: index + 1,
          name: policy.name,
          call: kprobe.call || "Unknown",
          syscall: kprobe.syscall ? "Yes" : "No",
          match_commands: kprobe.match_commands?.join(", ") || "None",
          actions: kprobe.actions?.join(", ") || "None",
        }
      })

      setPolicies(formattedPolicies)
    } catch (err) {
      console.error("Error fetching policies:", err)
      setError(err.message)
      toast({
        title: "Error fetching policies",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to submit a new policy
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create form data for the API
      const formData = new FormData()
      formData.append("policy_name", policyName)
      formData.append("command_name", policyCommand)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enforce-policy`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to enforce policy")
      }

      // Show success message
      toast({
        title: "Policy enforced",
        description: "The policy has been successfully enforced.",
      })

      // Reset form
      setPolicyName("")
      setPolicyCommand("")

      // Refresh policies list
      fetchPolicies()
    } catch (err) {
      console.error("Error enforcing policy:", err)
      setError(err.message)
      toast({
        title: "Error enforcing policy",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleDelete = async (name) => {
    if (!confirm(`Delete policy "${name}"? This cannot be undone.`)) return;
  
    setIsLoading(true);
    setError(null);
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/delete-policy`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ policy_name: name }),
        }
      );
  
      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(detail || "Failed to delete policy");
      }
  
      toast({
        title: "Policy deleted",
        description: `Tracing policy "${name}" removed from the cluster.`,
      });
  
      fetchPolicies();          // refresh table
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
      toast({
        title: "Error deleting policy",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-6 md:px-8">
          <div className="flex items-center gap-2 font-semibold">
            <Link href="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <span>KubeVision</span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-1">
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
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar />
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Tetragon Policy Enforcement</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchPolicies} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh"
                )}
              </Button>
              <Button size="sm">Export Policies</Button>
            </div>
          </div>

          <Tabs defaultValue="policies" className="w-full">
            <TabsList>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="add">Add Policy</TabsTrigger>
              <TabsTrigger value="logs">Enforcement Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="policies" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Enforced Policies</CardTitle>
                  <CardDescription>List of all Tetragon policies currently enforced in your cluster</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : policies.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">No policies found</h3>
                      <p className="mt-2">Create your first policy using the "Add Policy" tab.</p>
                    </div>
                  ) : (
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
                              {/* <Button variant="ghost" size="sm">
                                Edit
                              </Button> */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(policy.name)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
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
                      <div className="text-2xl font-bold text-amber-500">
                        {policies.filter((p) => p.actions.toLowerCase().includes("sigkill")).length}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">Audit Policies</div>
                      <div className="text-2xl font-bold text-blue-500">
                        {policies.filter((p) => p.actions.toLowerCase().includes("audit")).length}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-muted-foreground">Alert Policies</div>
                      <div className="text-2xl font-bold text-green-500">
                        {policies.filter((p) => p.actions.toLowerCase().includes("alert")).length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                      <p className="text-xs text-muted-foreground">
                        Use a descriptive name like "block-bash" or "prevent-curl"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="policy-command">Command to Block</Label>
                      <Input
                        id="policy-command"
                        placeholder="Enter command to block (e.g., /bin/bash)"
                        value={policyCommand}
                        onChange={(e) => setPolicyCommand(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Specify the full path to the command (e.g., /bin/bash, /usr/bin/curl)
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Add Policy"
                        )}
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
                    <div
                      className="rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setPolicyName("block-shell-execution")
                        setPolicyCommand("/bin/bash")
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Block Shell Execution</h3>
                          <p className="text-sm text-muted-foreground">Prevents execution of shell commands</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setPolicyName("block-curl")
                        setPolicyCommand("/usr/bin/curl")
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Block Network Tools</h3>
                          <p className="text-sm text-muted-foreground">Prevents use of curl for network access</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setPolicyName("block-package-manager")
                        setPolicyCommand("/usr/bin/apt")
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Block Package Manager</h3>
                          <p className="text-sm text-muted-foreground">Prevents package installation</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setPolicyName("block-sudo")
                        setPolicyCommand("/usr/bin/sudo")
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">Block Privilege Escalation</h3>
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
                  {eventsLoading ? (
  <div className="p-4 text-sm text-muted-foreground">Loading logs...</div>
) : events.length === 0 ? (
  <div className="p-4 text-sm text-muted-foreground">No recent events found.</div>
) : (
  events.map((event, index) => (
    <div key={index} className="grid grid-cols-[150px_150px_1fr_150px] border-t">
      <div className="p-3 border-r text-muted-foreground">
        {new Date(event.timestamp).toLocaleString()}
      </div>
      <div className="p-3 border-r">Policy Event</div>
      <div className="p-3 border-r">{event.command}</div>
      <div className="p-3 text-red-500">Detected</div>
    </div>
  ))
)}

                    
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

