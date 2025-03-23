import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CloudCog,
  Code,
  Database,
  GitBranch,
  Globe,
  Layers,
  LayoutDashboard,
  Shield,
  Zap,
} from "lucide-react"
import Header from "@/components/header"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header/>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 md:py-24 lg:py-32">
        <div className="container px-6 md:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <Badge className="px-3 py-1 text-sm" variant="secondary">
                  Kubernetes Management Simplified
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Manage and Secure your Kubernetes clusters
                </h1>
                <p className="text-xl text-muted-foreground">
                  KubeSecure provides real-time visibility, security monitoring, and operational control for your
                  Kubernetes infrastructure.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="gap-2">
                    Explore Features <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-full rounded-lg bg-muted/30 shadow-xl overflow-hidden border border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background/10"></div>
                <Image
                  src="/placeholder.svg?height=700&width=700"
                  alt="KubeSecure Dashboard"
                  width={700}
                  height={700}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container px-6 md:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-muted-foreground">Trusted by leading organizations</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
            {["Acme Inc", "TechCorp", "CloudSys", "DataFlow", "KubeStack"].map((company) => (
              <div key={company} className="flex items-center text-muted-foreground/70 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-24 lg:py-32">
        <div className="container px-6 md:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge className="mb-4 px-3 py-1 text-sm" variant="secondary">
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Everything you need to manage Kubernetes
            </h2>
            <p className="text-xl text-muted-foreground">
              KubeSecure provides a comprehensive set of tools to monitor, secure, and optimize your Kubernetes
              clusters.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Real-time Monitoring",
                description: "Monitor your cluster's health, performance, and resource usage in real-time.",
                icon: LayoutDashboard,
              },
              {
                title: "Security Enforcement",
                description: "Enforce security policies and detect threats with Tetragon integration.",
                icon: Shield,
              },
              {
                title: "Rate Limiting",
                description: "Protect your API server from overload with configurable rate limiting.",
                icon: Zap,
              },
              {
                title: "Code Quality",
                description: "Detect and fix Kubernetes YAML code smells before deployment.",
                icon: Code,
              },
              {
                title: "Alert Management",
                description: "Get notified of critical issues with customizable alerts.",
                icon: Globe,
              },
              {
                title: "Resource Optimization",
                description: "Identify resource waste and optimize your cluster's efficiency.",
                icon: Database,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-border/40 bg-background/50 transition-all hover:border-primary/20 hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="border-t py-20 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-6 md:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <Badge className="mb-4 px-3 py-1 text-sm" variant="secondary">
                Services
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Enterprise-grade Kubernetes management
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We offer a range of services to help you get the most out of your Kubernetes infrastructure.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Managed Kubernetes",
                    description: "Let us handle the complexity of Kubernetes while you focus on your applications.",
                  },
                  {
                    title: "Security Auditing",
                    description: "Regular security audits to identify and mitigate vulnerabilities in your cluster.",
                  },
                  {
                    title: "Performance Optimization",
                    description: "Optimize your cluster's performance and resource usage for cost efficiency.",
                  },
                  {
                    title: "24/7 Support",
                    description: "Round-the-clock support from our team of Kubernetes experts.",
                  },
                ].map((service, index) => (
                  <div key={index} className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{service.title}</h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative rounded-lg overflow-hidden border border-border shadow-xl">
                <div className="aspect-video w-full max-w-lg bg-muted/50">
                  <div className="flex h-full items-center justify-center">
                    <CloudCog className="h-24 w-24 text-primary/20" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="rounded-lg bg-background/95 backdrop-blur p-4 shadow-lg border border-border">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <GitBranch className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Enterprise Plan</div>
                        <div className="text-xs text-muted-foreground">Starting at $499/month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-24 lg:py-32">
        <div className="container px-6 md:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 text-sm" variant="secondary">
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Trusted by DevOps teams worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See what our customers have to say about KubeSecure.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote:
                  "KubeSecure has transformed how we manage our Kubernetes clusters. The real-time monitoring and security features have been game-changers for our team.",
                author: "Sarah Chen",
                role: "DevOps Lead, TechCorp",
              },
              {
                quote:
                  "The code smell detection has saved us countless hours of debugging and prevented several production incidents. It's like having a Kubernetes expert on the team.",
                author: "Michael Rodriguez",
                role: "SRE Manager, DataFlow",
              },
              {
                quote:
                  "We've reduced our operational overhead by 40% since implementing KubeSecure. The intuitive interface makes it easy for our entire team to understand our Kubernetes infrastructure.",
                author: "Jamie Wilson",
                role: "CTO, Acme Inc",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-border/40 bg-background/50">
                <CardContent className="pt-6">
                  <div className="mb-4 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="inline-block">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-20 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-6 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to transform your Kubernetes experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of companies using KubeSecure to manage their Kubernetes infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12 md:py-16">
        <div className="container px-6 md:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-semibold mb-6">
                <Layers className="h-6 w-6 text-primary" />
                <span className="text-xl">KubeSecure</span>
              </div>
              <p className="text-muted-foreground mb-6">Modern Kubernetes management for modern teams.</p>
              <div className="flex gap-4">
                {["Twitter", "GitHub", "LinkedIn", "YouTube"].map((social) => (
                  <Link key={social} href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    {social}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                {["Features", "Pricing", "Integrations", "Changelog", "Documentation"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                {["About", "Blog", "Careers", "Customers", "Partners"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6">Legal</h3>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} KubeSecure. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

