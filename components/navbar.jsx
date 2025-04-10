"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertCircle,
  BarChart3,
  Boxes,
  FileCode,
  Gauge,
  LayoutDashboard,
  Layers,
  Lock,
  Menu,
  Shield,
} from "lucide-react"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ratelimiting", label: "Rate Limiting", icon: Gauge },
    { href: "/tetragon", label: "Tetragon", icon: Shield },
    { href: "/code-smells", label: "k8s Code Smells", icon: FileCode },
    { href: "http://localhost:8080", label: "Grafana", icon: BarChart3 },
    { href: "/security", label: "Security", icon: Lock },
    { href: "/alerts", label: "Alerts", icon: AlertCircle },
    
  ]

  return (
    <>
      {/* Mobile Navigation Button - Only visible on small screens */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] sm:w-[300px] pt-10">
            <div className="flex items-center gap-2 font-semibold mb-6">
              <Layers className="h-6 w-6 text-primary" />
              <span>KubeVision</span>
            </div>
            <nav className="grid gap-2 text-sm">
              {navItems.map((item) => {
                const Icon = item.icon
                // Check if this is the current page
                const isActive =
                  pathname === item.href ||
                  // Handle special case for home page
                  (pathname === "/" && item.href === "/") ||
                  // Handle nested routes
                  (pathname.startsWith(item.href) && item.href !== "/")

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation - Hidden on mobile */}
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
        <div className="py-8 pr-6 pl-4 lg:py-8">
          <nav className="grid gap-2 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon
              // Check if this is the current page
              const isActive =
                pathname === item.href ||
                // Handle special case for home page
                (pathname === "/" && item.href === "/") ||
                // Handle nested routes
                (pathname.startsWith(item.href) && item.href !== "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

