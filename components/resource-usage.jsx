import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Cpu, HardDrive, MemoryStickIcon as Memory } from "lucide-react"

export function ResourceUsage({ resources }) {
  // Convert percentage strings to numbers
  const cpuPercentage = Number.parseInt(resources.cpu.replace("%", ""), 10)
  const memoryPercentage = Number.parseInt(resources.memory.replace("%", ""), 10)
  const storagePercentage = Number.parseInt(resources.storage.replace("%", ""), 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Usage</CardTitle>
        <CardDescription>Current cluster resource utilization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cpu className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">CPU</span>
            </div>
            <span className="text-sm font-medium">{resources.cpu}</span>
          </div>
          <Progress
            value={cpuPercentage}
            className="h-2"
            style={{
              "--progress-background": cpuPercentage > 80 ? "hsl(var(--destructive))" : "hsl(var(--primary))",
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Memory className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Memory</span>
            </div>
            <span className="text-sm font-medium">{resources.memory}</span>
          </div>
          <Progress
            value={memoryPercentage}
            className="h-2"
            style={{
              "--progress-background": memoryPercentage > 80 ? "hsl(var(--destructive))" : "hsl(var(--primary))",
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HardDrive className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            <span className="text-sm font-medium">{resources.storage}</span>
          </div>
          <Progress
            value={storagePercentage}
            className="h-2"
            style={{
              "--progress-background": storagePercentage > 80 ? "hsl(var(--destructive))" : "hsl(var(--primary))",
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

