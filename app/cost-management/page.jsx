import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CostManagementPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Cost Management</CardTitle>
              <CardDescription>
                Overview of your Kubernetes cluster costs and optimization opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This page will provide insights into your resource utilization, helping you identify areas for cost savings.
                Future enhancements will include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Detailed breakdown of costs by namespace, deployment, and pod.</li>
                <li>Identification of over-provisioned resources.</li>
                <li>Recommendations for resource rightsizing.</li>
                <li>Tracking of actual resource usage versus requests and limits.</li>
              </ul>
              <p className="mt-4">
                Stay tuned for more updates!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
