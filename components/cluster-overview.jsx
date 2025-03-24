import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Box, CheckCircle, AlertCircle } from 'lucide-react'

export function ClusterOverview({ nodes, pods, deployments }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nodes</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{nodes.total}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
            <span>{nodes.ready} Ready</span>
            {nodes.total > nodes.ready && (
              <>
                <AlertCircle className="ml-2 mr-1 h-3 w-3 text-amber-500" />
                <span>{nodes.total - nodes.ready} Not Ready</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pods</CardTitle>
          <Box className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pods.total}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
            <span>{pods.running} Running</span>
            {pods.pending > 0 && (
              <>
                <AlertCircle className="ml-2 mr-1 h-3 w-3 text-amber-500" />
                <span>{pods.pending} Pending</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deployments</CardTitle>
          <Box className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deployments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all namespaces
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cluster Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Healthy</div>
          <p className="text-xs text-muted-foreground mt-1">
            All systems operational
          </p>
        </CardContent>
      </Card>
    </div>
  )
}



