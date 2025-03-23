import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Box,
  Cpu,
  MemoryStickIcon as Memory,
  Server,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import Header from "@/components/header"



export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar activePage="/" />
        <main className="flex w-full flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Cluster Dashboard</h1>
            
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pods</CardTitle>
                  <Box className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">138 Running, 4 Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nodes</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">8 Ready, 0 Not Ready</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="text-2xl font-bold">42%</div>
                  <p className="text-xs text-muted-foreground">+2% from last hour</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <Memory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <div className="text-2xl font-bold">68%</div>
                  <p className="text-xs text-muted-foreground">+5% from last hour</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full mt-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="workloads">Workloads</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cluster Health</CardTitle>
                      <CardDescription>Overall status of your Kubernetes cluster</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-green-500">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="font-medium">Healthy</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Control Plane</span>
                          <span className="font-medium text-green-500">Healthy</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">etcd</span>
                          <span className="font-medium text-green-500">Healthy</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Scheduler</span>
                          <span className="font-medium text-green-500">Healthy</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Controller Manager</span>
                          <span className="font-medium text-green-500">Healthy</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Resource Usage</CardTitle>
                      <CardDescription>Current resource utilization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>CPU</span>
                          <span>42%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div className="h-2 w-[42%] rounded-full bg-primary"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Memory</span>
                          <span>68%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div className="h-2 w-[68%] rounded-full bg-primary"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Storage</span>
                          <span>35%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div className="h-2 w-[35%] rounded-full bg-primary"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Namespaces</CardTitle>
                    <CardDescription>Resource distribution across namespaces</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 font-medium">
                        <div>Namespace</div>
                        <div className="text-right">Pods</div>
                        <div className="text-right">Services</div>
                        <div className="text-right">Deployments</div>
                      </div>
                      <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 items-center">
                        <div className="font-medium">default</div>
                        <div className="text-right">24</div>
                        <div className="text-right">8</div>
                        <div className="text-right">6</div>
                      </div>
                      <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 items-center">
                        <div className="font-medium">kube-system</div>
                        <div className="text-right">32</div>
                        <div className="text-right">10</div>
                        <div className="text-right">8</div>
                      </div>
                      <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 items-center">
                        <div className="font-medium">monitoring</div>
                        <div className="text-right">18</div>
                        <div className="text-right">5</div>
                        <div className="text-right">4</div>
                      </div>
                      <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 items-center">
                        <div className="font-medium">application</div>
                        <div className="text-right">68</div>
                        <div className="text-right">15</div>
                        <div className="text-right">12</div>
                      </div>
                    </div>
                  </CardContent>
                  
                </Card>
              </TabsContent>

              <TabsContent value="workloads" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Deployments</CardTitle>
                    <CardDescription>Status of all deployments across namespaces</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-4 font-medium">
                        <div>Name</div>
                        <div>Namespace</div>
                        <div className="text-right">Replicas</div>
                        <div className="text-right">Status</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-4 items-center">
                        <div className="font-medium">frontend</div>
                        <div>application</div>
                        <div className="text-right">3/3</div>
                        <div className="text-right text-green-500">Healthy</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-4 items-center">
                        <div className="font-medium">backend-api</div>
                        <div>application</div>
                        <div className="text-right">5/5</div>
                        <div className="text-right text-green-500">Healthy</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-4 items-center">
                        <div className="font-medium">database</div>
                        <div>application</div>
                        <div className="text-right">2/2</div>
                        <div className="text-right text-green-500">Healthy</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-4 items-center">
                        <div className="font-medium">prometheus</div>
                        <div>monitoring</div>
                        <div className="text-right">1/1</div>
                        <div className="text-right text-green-500">Healthy</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-4 items-center">
                        <div className="font-medium">grafana</div>
                        <div>monitoring</div>
                        <div className="text-right">1/1</div>
                        <div className="text-right text-green-500">Healthy</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Deployments
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Events</CardTitle>
                    <CardDescription>Latest events from your Kubernetes cluster</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-[100px_1fr_1fr_150px] gap-4 font-medium">
                        <div>Type</div>
                        <div>Resource</div>
                        <div>Message</div>
                        <div>Time</div>
                      </div>
                      <div className="grid grid-cols-[100px_1fr_1fr_150px] gap-4 items-center">
                        <div className="text-green-500">Normal</div>
                        <div>Pod/frontend-5d8f9</div>
                        <div>Successfully pulled image</div>
                        <div className="text-sm text-muted-foreground">2 minutes ago</div>
                      </div>
                      <div className="grid grid-cols-[100px_1fr_1fr_150px] gap-4 items-center">
                        <div className="text-green-500">Normal</div>
                        <div>Pod/frontend-5d8f9</div>
                        <div>Created container</div>
                        <div className="text-sm text-muted-foreground">2 minutes ago</div>
                      </div>
                      <div className="grid grid-cols-[100px_1fr_1fr_150px] gap-4 items-center">
                        <div className="text-green-500">Normal</div>
                        <div>Pod/frontend-5d8f9</div>
                        <div>Started container</div>
                        <div className="text-sm text-muted-foreground">2 minutes ago</div>
                      </div>
                      <div className="grid grid-cols-[100px_1fr_1fr_150px] gap-4 items-center">
                        <div className="text-amber-500">Warning</div>
                        <div>Node/worker-node-3</div>
                        <div>Disk pressure detected</div>
                        <div className="text-sm text-muted-foreground">25 minutes ago</div>
                      </div>
                      <div className="grid grid-cols-[100px_1fr_1fr_150px] gap-4 items-center">
                        <div className="text-green-500">Normal</div>
                        <div>Deployment/backend-api</div>
                        <div>Scaled up replica set to 5</div>
                        <div className="text-sm text-muted-foreground">45 minutes ago</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Events
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

