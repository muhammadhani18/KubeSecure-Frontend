import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers } from "lucide-react"

export function NamespaceList({ namespaces }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Namespaces</CardTitle>
        <CardDescription>Available Kubernetes namespaces</CardDescription>
      </CardHeader>
      <CardContent>
        {namespaces.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">No namespaces found</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {namespaces.map((namespace, index) => (
              <div key={index} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <Layers className="h-4 w-4 text-primary" />
                <span className="truncate">{namespace.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

