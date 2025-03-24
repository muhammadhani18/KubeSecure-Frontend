"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkloadsList } from "@/components/workloads-list"
import { ClusterEvents } from "@/components/cluster-events"

export function DashboardTabs({ namespaces, events }) {
  const [activeTab, setActiveTab] = useState("workloads")

  return (
    <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="w-full">

      <TabsList>
        <TabsTrigger value="workloads">Workloads</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
      </TabsList>
      <TabsContent value="workloads" className="mt-6">
        <WorkloadsList namespaces={namespaces} />
      </TabsContent>
      <TabsContent value="events" className="mt-6">
        <ClusterEvents events={events} />
      </TabsContent>
    </Tabs>
  )
}

