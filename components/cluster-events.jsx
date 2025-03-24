"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Info } from "lucide-react"

export function ClusterEvents({ events }) {
  // Format the timestamp
  const formatTime = (timestamp) => {
    if (timestamp === "Unknown") return "Unknown"
    try {
      return new Date(timestamp).toLocaleString()
    } catch (e) {
      return timestamp
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
        <CardDescription>Last 5 events from the cluster</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">No recent events</div>
        ) : (
          <div className="rounded-md border">
            <div className="grid grid-cols-[100px_1fr_200px] font-medium bg-muted/50">
              <div className="p-3 border-r">Type</div>
              <div className="p-3 border-r">Message</div>
              <div className="p-3">Time</div>
            </div>
            {events.map((event, index) => (
              <div key={index} className="grid grid-cols-[100px_1fr_200px] border-t">
                <div className="p-3 border-r flex items-center">
                  {event.type === "Warning" ? (
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-500 mr-2" />
                  )}
                  <span>{event.type}</span>
                </div>
                <div className="p-3 border-r">
                  <div className="font-medium">{event.resource}</div>
                  <div className="text-sm text-muted-foreground">{event.message}</div>
                </div>
                <div className="p-3 text-muted-foreground text-sm">{formatTime(event.time)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

