import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, AlertCircle, Box, Database, Layers, Network, Server, Shield, Workflow } from "lucide-react"

export function Navbar() {

  return (
    <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-8 pr-6 pl-4 lg:py-8">
            <nav className="grid gap-2 text-sm">
              <Link href="/" className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-accent-foreground">
                <Activity className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/ratelimiting"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Box className="h-4 w-4" />
                <span>Rate Limiting</span>
              </Link>
              <Link
                href="/tetragon"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Server className="h-4 w-4" />
                <span>Tetragon</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Network className="h-4 w-4" />
                <span>Networking</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Database className="h-4 w-4" />
                <span>Storage</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </Link>
              <Link
                href="/alerts"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Alerts</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Workflow className="h-4 w-4" />
                <span>Namespaces</span>
              </Link>
            </nav>
          </div>
        </aside>
  )
}

