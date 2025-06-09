"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navbar } from "@/components/navbar"
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Key,
  Layers,
  Lock,
  Network,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react"
import Header from "@/components/header"
import { useRouter } from "next/navigation";


// Mock data for the security page
const securityScore = 78
const vulnerabilities = [
  { id: 1, severity: "Critical", count: 3, fixed: 0 },
  { id: 2, severity: "High", count: 12, fixed: 5 },
  { id: 3, severity: "Medium", count: 24, fixed: 10 },
  { id: 4, severity: "Low", count: 31, fixed: 15 },
]

const complianceFrameworks = [
  { id: 1, name: "CIS Kubernetes Benchmark", score: 87, status: "Passed" },
  { id: 2, name: "NIST SP 800-190", score: 72, status: "Action Required" },
  { id: 3, name: "PCI DSS", score: 81, status: "Passed" },
  { id: 4, name: "SOC 2", score: 76, status: "Action Required" },
]

const recentFindings = [
  {
    id: 1,
    title: "Privileged container detected",
    description: "Container 'db-backup' in namespace 'data' is running with privileged security context",
    severity: "High",
    resource: "data/db-backup-5d8f9",
    timestamp: "2023-06-15T10:30:45Z",
  },
  {
    id: 2,
    title: "Exposed dashboard without authentication",
    description: "Service 'monitoring-dashboard' in namespace 'monitoring' is exposed without proper authentication",
    severity: "Critical",
    resource: "monitoring/monitoring-dashboard",
    timestamp: "2023-06-15T09:15:22Z",
  },
  {
    id: 3,
    title: "Container using latest tag",
    description: "Deployment 'api-gateway' using 'latest' tag which is not recommended for production",
    severity: "Medium",
    resource: "default/api-gateway",
    timestamp: "2023-06-15T08:45:10Z",
  },
  {
    id: 4,
    title: "Excessive permissions in RBAC role",
    description: "Role 'admin-role' in namespace 'default' has excessive permissions",
    severity: "High",
    resource: "default/admin-role",
    timestamp: "2023-06-15T07:20:33Z",
  },
  {
    id: 5,
    title: "Secrets not encrypted",
    description: "Kubernetes secrets are not encrypted at rest",
    severity: "High",
    resource: "cluster-wide",
    timestamp: "2023-06-15T06:10:05Z",
  },
]

const rbacRoles = [
  { id: 1, name: "cluster-admin", type: "ClusterRole", subjects: 3, permissions: "Full cluster access" },
  { id: 2, name: "view", type: "ClusterRole", subjects: 12, permissions: "Read-only access to most resources" },
  { id: 3, name: "edit", type: "ClusterRole", subjects: 8, permissions: "Edit access to most resources" },
  { id: 4, name: "dev-team", type: "Role", namespace: "development", subjects: 5, permissions: "Edit in namespace" },
  { id: 5, name: "monitoring", type: "Role", namespace: "monitoring", subjects: 2, permissions: "Read metrics" },
]

const networkPolicies = [
  { id: 1, name: "default-deny", namespace: "default", podSelector: "All pods", ingress: "Denied", egress: "Denied" },
  {
    id: 2,
    name: "allow-dns",
    namespace: "kube-system",
    podSelector: "k8s-app=kube-dns",
    ingress: "Allowed from all",
    egress: "Allowed to all",
  },
  {
    id: 3,
    name: "web-to-api",
    namespace: "production",
    podSelector: "app=web",
    ingress: "Allowed from ingress",
    egress: "Allowed to app=api",
  },
  {
    id: 4,
    name: "api-to-db",
    namespace: "production",
    podSelector: "app=api",
    ingress: "Allowed from app=web",
    egress: "Allowed to app=db",
  },
]

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

// Helper function to get severity badge
function getSeverityBadge(severity) {
  switch (severity.toLowerCase()) {
    case "critical":
      return <Badge className="bg-red-600">{severity}</Badge>
    case "high":
      return <Badge className="bg-red-500">{severity}</Badge>
    case "medium":
      return <Badge className="bg-amber-500">{severity}</Badge>
    case "low":
      return <Badge className="bg-blue-500">{severity}</Badge>
    default:
      return <Badge>{severity}</Badge>
  }
}

// Helper function to get status badge
function getStatusBadge(status) {
  switch (status.toLowerCase()) {
    case "passed":
      return <Badge className="bg-green-500">{status}</Badge>
    case "action required":
      return <Badge className="bg-amber-500">{status}</Badge>
    case "failed":
      return <Badge className="bg-red-500">{status}</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function SecurityPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter();
  
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);
  const handleScan = () => {
    setIsScanning(true)
    // Simulate scan completion after 3 seconds
    setTimeout(() => {
      setIsScanning(false)
    }, 3000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header/>
      <div className="container flex-1 items-start py-8 px-6 md:px-8 md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Navbar />
        <main className="flex w-full flex-col overflow-hidden space-y-6 md:space-y-8 md:pl-[240px] transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleScan} disabled={isScanning}>
                {isScanning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Run Security Scan
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="rbac">RBAC</TabsTrigger>
              <TabsTrigger value="network">Network Policies</TabsTrigger>
              <TabsTrigger value="secrets">Secrets</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-4xl font-bold">{securityScore}/100</div>
                      <Progress value={securityScore} className="h-2 w-full" />
                      <p className="text-xs text-muted-foreground">Last scan: Today at 10:30 AM</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ShieldAlert className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm">Critical & High</span>
                        </div>
                        <span className="font-bold">{vulnerabilities[0].count + vulnerabilities[1].count}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ShieldAlert className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm">Medium</span>
                        </div>
                        <span className="font-bold">{vulnerabilities[2].count}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ShieldCheck className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">Low</span>
                        </div>
                        <span className="font-bold">{vulnerabilities[3].count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {complianceFrameworks.slice(0, 3).map((framework) => (
                        <div key={framework.id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            {framework.status === "Passed" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                            )}
                            <span className="text-sm">{framework.name}</span>
                          </div>
                          <span className="font-bold">{framework.score}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Findings</CardTitle>
                  <CardDescription>Latest security issues detected in your cluster</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Finding</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Resource</TableHead>
                          <TableHead>Detected</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentFindings.map((finding) => (
                          <TableRow key={finding.id}>
                            <TableCell>
                              <div className="font-medium">{finding.title}</div>
                              <div className="text-sm text-muted-foreground">{finding.description}</div>
                            </TableCell>
                            <TableCell>{getSeverityBadge(finding.severity)}</TableCell>
                            <TableCell>{finding.resource}</TableCell>
                            <TableCell>{formatDate(finding.timestamp)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Remediate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Recommendations</CardTitle>
                    <CardDescription>Actionable steps to improve your security posture</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 p-3 rounded-md border">
                        <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Enable Pod Security Standards</h3>
                          <p className="text-sm text-muted-foreground">
                            Enforce Pod Security Standards to restrict pod capabilities and reduce attack surface.
                          </p>
                          <Button variant="link" size="sm" className="px-0 h-auto">
                            Learn more <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-md border">
                        <Lock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Implement Network Policies</h3>
                          <p className="text-sm text-muted-foreground">
                            Define network policies to control pod-to-pod communication and secure your cluster network.
                          </p>
                          <Button variant="link" size="sm" className="px-0 h-auto">
                            Learn more <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-md border">
                        <Key className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Enable Secret Encryption</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure encryption for Kubernetes secrets to protect sensitive data at rest.
                          </p>
                          <Button variant="link" size="sm" className="px-0 h-auto">
                            Learn more <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Events</CardTitle>
                    <CardDescription>Recent security-related events in your cluster</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 p-3 rounded-md border">
                        <UserCheck className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Admin Login</h3>
                          <p className="text-sm text-muted-foreground">
                            User admin@example.com logged in from 192.168.1.100
                          </p>
                          <p className="text-xs text-muted-foreground">Today at 10:15 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-md border">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Failed Authentication</h3>
                          <p className="text-sm text-muted-foreground">
                            Multiple failed login attempts for user dev@example.com from 203.0.113.42
                          </p>
                          <p className="text-xs text-muted-foreground">Today at 09:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-md border">
                        <FileText className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">RBAC Policy Updated</h3>
                          <p className="text-sm text-muted-foreground">
                            Role "developer" permissions updated by admin@example.com
                          </p>
                          <p className="text-xs text-muted-foreground">Yesterday at 4:45 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Vulnerabilities Tab */}
            <TabsContent value="vulnerabilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vulnerability Summary</CardTitle>
                  <CardDescription>Overview of vulnerabilities detected in your cluster</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-4">
                    {vulnerabilities.map((vuln) => (
                      <div key={vuln.id} className="rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground">{vuln.severity}</div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <div className="text-2xl font-bold">{vuln.count}</div>
                          <div className="text-sm text-muted-foreground">({vuln.fixed} fixed)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Vulnerability Details</CardTitle>
                    <CardDescription>Detailed list of vulnerabilities in your cluster</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="search"
                        placeholder="Search vulnerabilities..."
                        className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vulnerability</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Affected Resource</TableHead>
                          <TableHead>CVSS Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">CVE-2023-1234</div>
                            <div className="text-sm text-muted-foreground">
                              Container escape vulnerability in Docker
                            </div>
                          </TableCell>
                          <TableCell>{getSeverityBadge("Critical")}</TableCell>
                          <TableCell>default/api-gateway</TableCell>
                          <TableCell>9.8</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-red-500 text-red-500">
                              Open
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Remediate
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">CVE-2023-5678</div>
                            <div className="text-sm text-muted-foreground">Privilege escalation in Kubernetes</div>
                          </TableCell>
                          <TableCell>{getSeverityBadge("Critical")}</TableCell>
                          <TableCell>kube-system/kube-apiserver</TableCell>
                          <TableCell>8.9</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-red-500 text-red-500">
                              Open
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Remediate
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">CVE-2023-9012</div>
                            <div className="text-sm text-muted-foreground">SQL injection in application</div>
                          </TableCell>
                          <TableCell>{getSeverityBadge("High")}</TableCell>
                          <TableCell>production/web-app</TableCell>
                          <TableCell>7.5</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-red-500 text-red-500">
                              Open
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Remediate
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">CVE-2023-3456</div>
                            <div className="text-sm text-muted-foreground">Denial of service in Nginx</div>
                          </TableCell>
                          <TableCell>{getSeverityBadge("Medium")}</TableCell>
                          <TableCell>ingress-nginx/controller</TableCell>
                          <TableCell>6.2</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-amber-500 text-amber-500">
                              In Progress
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">CVE-2023-7890</div>
                            <div className="text-sm text-muted-foreground">Information disclosure in Redis</div>
                          </TableCell>
                          <TableCell>{getSeverityBadge("Low")}</TableCell>
                          <TableCell>data/redis</TableCell>
                          <TableCell>3.8</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              Fixed
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Vulnerabilities
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Frameworks</CardTitle>
                  <CardDescription>Compliance status for various security frameworks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Framework</TableHead>
                          <TableHead>Compliance Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Scan</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {complianceFrameworks.map((framework) => (
                          <TableRow key={framework.id}>
                            <TableCell className="font-medium">{framework.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={framework.score} className="h-2 w-24" />
                                <span>{framework.score}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(framework.status)}</TableCell>
                            <TableCell>Today at 10:30 AM</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CIS Kubernetes Benchmark</CardTitle>
                  <CardDescription>Detailed compliance status for CIS Kubernetes Benchmark</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-4">
                      <div className="rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground">Control Families</div>
                        <div className="text-2xl font-bold">5</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground">Controls</div>
                        <div className="text-2xl font-bold">73</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground">Passed</div>
                        <div className="text-2xl font-bold text-green-500">64</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-xs font-medium text-muted-foreground">Failed</div>
                        <div className="text-2xl font-bold text-red-500">9</div>
                      </div>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Control ID</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">1.1.1</TableCell>
                            <TableCell>
                              Ensure that the API server pod specification file permissions are set to 644 or more
                              restrictive
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-500">Passed</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">1.1.12</TableCell>
                            <TableCell>Ensure that the etcd data directory ownership is set to etcd:etcd</TableCell>
                            <TableCell>
                              <Badge className="bg-red-500">Failed</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Remediate
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">1.2.7</TableCell>
                            <TableCell>Ensure that the --authorization-mode argument includes RBAC</TableCell>
                            <TableCell>
                              <Badge className="bg-green-500">Passed</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">1.2.16</TableCell>
                            <TableCell>Ensure that the admission control plugin PodSecurityPolicy is set</TableCell>
                            <TableCell>
                              <Badge className="bg-red-500">Failed</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Remediate
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Controls
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* RBAC Tab */}
            <TabsContent value="rbac" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Role-Based Access Control</CardTitle>
                  <CardDescription>Manage roles, role bindings, and service accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Namespace</TableHead>
                          <TableHead>Subjects</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rbacRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell>{role.type}</TableCell>
                            <TableCell>{role.namespace || "All namespaces"}</TableCell>
                            <TableCell>{role.subjects}</TableCell>
                            <TableCell>{role.permissions}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Audit Permissions
                  </Button>
                  <Button size="sm">Create Role</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Accounts</CardTitle>
                  <CardDescription>Manage service accounts in your cluster</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Namespace</TableHead>
                          <TableHead>Secrets</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">default</TableCell>
                          <TableCell>default</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>30 days ago</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">prometheus</TableCell>
                          <TableCell>monitoring</TableCell>
                          <TableCell>2</TableCell>
                          <TableCell>14 days ago</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">app-backend</TableCell>
                          <TableCell>production</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>7 days ago</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Policies Tab */}
            <TabsContent value="network" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Policies</CardTitle>
                  <CardDescription>Manage network policies to control pod-to-pod communication</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Namespace</TableHead>
                          <TableHead>Pod Selector</TableHead>
                          <TableHead>Ingress</TableHead>
                          <TableHead>Egress</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {networkPolicies.map((policy) => (
                          <TableRow key={policy.id}>
                            <TableCell className="font-medium">{policy.name}</TableCell>
                            <TableCell>{policy.namespace}</TableCell>
                            <TableCell>{policy.podSelector}</TableCell>
                            <TableCell>{policy.ingress}</TableCell>
                            <TableCell>{policy.egress}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="ml-auto">
                    Create Network Policy
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Security Visualization</CardTitle>
                  <CardDescription>Visual representation of network policies and traffic flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20">
                    <div className="text-center">
                      <Network className="mx-auto h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">Network Graph</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Interactive network graph visualization would appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Secrets Tab */}
            <TabsContent value="secrets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Secrets Management</CardTitle>
                  <CardDescription>Manage and monitor Kubernetes secrets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Namespace</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Data Items</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">db-credentials</TableCell>
                          <TableCell>default</TableCell>
                          <TableCell>Opaque</TableCell>
                          <TableCell>2</TableCell>
                          <TableCell>30 days ago</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">api-keys</TableCell>
                          <TableCell>production</TableCell>
                          <TableCell>Opaque</TableCell>
                          <TableCell>3</TableCell>
                          <TableCell>14 days ago</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">tls-cert</TableCell>
                          <TableCell>ingress-nginx</TableCell>
                          <TableCell>kubernetes.io/tls</TableCell>
                          <TableCell>2</TableCell>
                          <TableCell>7 days ago</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="ml-auto">
                    Create Secret
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Secret Encryption Status</CardTitle>
                  <CardDescription>Status of encryption for Kubernetes secrets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-amber-500" />
                        <div>
                          <h3 className="font-medium">Secret Encryption at Rest</h3>
                          <p className="text-sm text-muted-foreground">Encryption for etcd stored secrets</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        Not Configured
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-green-500" />
                        <div>
                          <h3 className="font-medium">Key Rotation</h3>
                          <p className="text-sm text-muted-foreground">Regular rotation of encryption keys</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-red-500 text-red-500">
                        Not Configured
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <div>
                          <h3 className="font-medium">External Key Management</h3>
                          <p className="text-sm text-muted-foreground">
                            Integration with external key management system
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-red-500 text-red-500">
                        Not Configured
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    Configure Encryption
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Audit Logs</CardTitle>
                    <CardDescription>Security-related audit events from your cluster</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="search"
                        placeholder="Search audit logs..."
                        className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Resource</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Jun 15, 10:30 AM</TableCell>
                          <TableCell>admin@example.com</TableCell>
                          <TableCell>secrets</TableCell>
                          <TableCell>get</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Success</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Jun 15, 10:15 AM</TableCell>
                          <TableCell>system:serviceaccount:monitoring:prometheus</TableCell>
                          <TableCell>pods</TableCell>
                          <TableCell>list</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Success</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Jun 15, 09:45 AM</TableCell>
                          <TableCell>dev@example.com</TableCell>
                          <TableCell>deployments</TableCell>
                          <TableCell>update</TableCell>
                          <TableCell>
                            <Badge className="bg-red-500">Forbidden</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Jun 15, 09:30 AM</TableCell>
                          <TableCell>anonymous</TableCell>
                          <TableCell>api-server</TableCell>
                          <TableCell>authenticate</TableCell>
                          <TableCell>
                            <Badge className="bg-red-500">Failed</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Jun 15, 09:15 AM</TableCell>
                          <TableCell>admin@example.com</TableCell>
                          <TableCell>roles</TableCell>
                          <TableCell>create</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Success</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">Showing 5 of 1,234 audit events</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audit Configuration</CardTitle>
                  <CardDescription>Configure Kubernetes audit policy and log storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-md border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-500" />
                        <div>
                          <h3 className="font-medium">Audit Policy</h3>
                          <p className="text-sm text-muted-foreground">Configuration for what events are recorded</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">Configured</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-md border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-500" />
                        <div>
                          <h3 className="font-medium">Log Backend</h3>
                          <p className="text-sm text-muted-foreground">Where audit logs are stored</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">File</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-md border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-amber-500" />
                        <div>
                          <h3 className="font-medium">Log Retention</h3>
                          <p className="text-sm text-muted-foreground">How long audit logs are kept</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500">30 Days</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    Configure Audit Settings
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

