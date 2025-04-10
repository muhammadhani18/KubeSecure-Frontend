import { NextRequest, NextResponse } from "next/server"
import * as yaml from "js-yaml"

// Function to detect code smells in Kubernetes YAML
function detectCodeSmells(manifests) {
  const smells = []

  for (const manifest of manifests) {
    if (!manifest || typeof manifest !== "object") {
      continue
    }

    const kind = manifest.kind || "Unknown"
    const metadata = manifest.metadata || {}
    const name = metadata.name || "Unknown"
    const namespace = metadata.namespace || "default"
    const spec = manifest.spec || {}

    // Detect hardcoded values (e.g., using 'latest' tag in images)
    if (spec.containers) {
      for (const container of spec.containers) {
        const image = container.image || ""
        if (image.includes(":latest") || image === "latest") {
          smells.push(
            `[Hardcoded Value] ${kind}/${name} in namespace ${namespace} uses 'latest' tag for image ${image}.`,
          )
        }
      }
    }

    // Detect missing resource requests and limits
    if (spec.containers) {
      for (const container of spec.containers) {
        const resources = container.resources || {}
        if (!resources.requests || !resources.limits) {
          smells.push(
            `[Resource Smell] ${kind}/${name} in namespace ${namespace} is missing resource requests or limits.`,
          )
        }
      }
    }

    // Detect overprivileged pods
    if (kind === "Pod" && spec.securityContext?.privileged) {
      smells.push(`[Overprivileged Pod] ${kind}/${name} in namespace ${namespace} is running as privileged.`)
    }

    // Detect missing probes
    if (spec.containers) {
      for (const container of spec.containers) {
        if (!container.livenessProbe) {
          smells.push(`[Health Check] ${kind}/${name} in namespace ${namespace} is missing a livenessProbe.`)
        }
        if (!container.readinessProbe) {
          smells.push(`[Health Check] ${kind}/${name} in namespace ${namespace} is missing a readinessProbe.`)
        }
      }
    }

    // Detect large ConfigMaps
    if (kind === "ConfigMap") {
      const data = manifest.data || {}
      if (Object.keys(data).length > 100) {
        smells.push(
          `[Large ConfigMap] ${kind}/${name} in namespace ${namespace} has a large number of entries (${Object.keys(data).length}).`,
        )
      }
    }

    // Detect secrets in plain text
    if (kind === "Secret") {
      const data = manifest.data || {}
      if (Object.values(data).some((value) => typeof value === "string" && value.length > 100)) {
        smells.push(
          `[Secret Smell] ${kind}/${name} in namespace ${namespace} has potentially large plain-text entries.`,
        )
      }
    }

    // Detect using default namespace
    if (namespace === "default") {
      smells.push(`[Namespace Smell] ${kind}/${name} is in the default namespace.`)
    }

    // Detect running as root
    if (spec.containers) {
      for (const container of spec.containers) {
        const securityContext = container.securityContext || {}
        if (securityContext.runAsUser === 0) {
          smells.push(`[Security Risk] ${kind}/${name} in namespace ${namespace} runs as root (runAsUser=0).`)
        }
      }
    }

    // Detect privilege escalation
    if (spec.containers) {
      for (const container of spec.containers) {
        const securityContext = container.securityContext || {}
        if (securityContext.allowPrivilegeEscalation === true) {
          smells.push(`[Security Risk] ${kind}/${name} in namespace ${namespace} allows privilege escalation.`)
        }
      }
    }

    // Detect wildcard roles in RoleBindings/ClusterRoleBindings
    if (kind === "RoleBinding" || kind === "ClusterRoleBinding") {
      const subjects = manifest.subjects || []
      for (const subject of subjects) {
        if (subject.kind === "Group" && ["system:authenticated", "system:unauthenticated"].includes(subject.name)) {
          smells.push(
            `[RBAC Smell] ${kind}/${name} in namespace ${namespace} binds a role to a wildcard group (${subject.name}).`,
          )
        }
      }
    }

    // Detect use of hostPath (which can break container isolation)
    if (spec.volumes) {
      for (const volume of spec.volumes) {
        if (volume.hostPath) {
          smells.push(
            `[Security Risk] ${kind}/${name} in namespace ${namespace} uses a hostPath volume, which can compromise security.`,
          )
        }
      }
    }

    // Detect high replica count for Deployments
    if (kind === "Deployment") {
      const replicas = spec.replicas || 1
      if (replicas > 100) {
        smells.push(
          `[Scaling Issue] ${kind}/${name} in namespace ${namespace} has a high replica count (${replicas}), which might be excessive.`,
        )
      }
    }

    // Detect containers without security policies
    if (spec.containers) {
      for (const container of spec.containers) {
        const securityContext = container.securityContext
        if (!securityContext) {
          smells.push(`[Security Risk] ${kind}/${name} in namespace ${namespace} lacks a security context.`)
        }
      }
    }
  }

  return smells
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.endsWith(".yaml") && !file.name.endsWith(".yml")) {
      return NextResponse.json({ error: "File must be a YAML file" }, { status: 400 })
    }

    const fileContent = await file.text()

    // Parse YAML content (handling multi-document YAML files)
    const manifests= []
    try {
      // Use loadAll to handle multi-document YAML files
      yaml.loadAll(fileContent, (doc) => {
        if (doc) manifests.push(doc)
      })
    } catch (error) {
      return NextResponse.json({ error: "Invalid YAML format" }, { status: 400 })
    }

    // Detect code smells
    const smells = detectCodeSmells(manifests)

    return NextResponse.json({ smells })
  } catch (error) {
    console.error("Error processing YAML file:", error)
    return NextResponse.json({ error: "An error occurred while processing the file" }, { status: 500 })
  }
}
