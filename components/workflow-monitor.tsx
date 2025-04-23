"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle } from "lucide-react"

// Mock workflow execution data
const workflowExecutions = [
  {
    id: "exec-1",
    workflowId: "workflow-1",
    workflowName: "Netlify Form Handler",
    status: "success",
    startTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    endTime: new Date(Date.now() - 1000 * 60 * 4.5).toISOString(), // 4.5 minutes ago
    duration: "30s",
    nodes: [
      { id: "node-1", name: "HTTP Trigger", status: "success", duration: "10ms" },
      { id: "node-2", name: "Process Form Data", status: "success", duration: "150ms" },
      { id: "node-3", name: "Send Email", status: "success", duration: "350ms" },
    ],
  },
  {
    id: "exec-2",
    workflowId: "workflow-2",
    workflowName: "Content Deployment",
    status: "running",
    startTime: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 minute ago
    endTime: null,
    duration: "1m+",
    nodes: [
      { id: "node-1", name: "Schedule Trigger", status: "success", duration: "5ms" },
      { id: "node-2", name: "Fetch Content", status: "success", duration: "250ms" },
      { id: "node-3", name: "Deploy to Netlify", status: "running", duration: "45s+" },
    ],
  },
  {
    id: "exec-3",
    workflowId: "workflow-3",
    workflowName: "Data Sync",
    status: "failed",
    startTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    endTime: new Date(Date.now() - 1000 * 60 * 14.8).toISOString(), // 14.8 minutes ago
    duration: "12s",
    nodes: [
      { id: "node-1", name: "HTTP Trigger", status: "success", duration: "8ms" },
      { id: "node-2", name: "Fetch API Data", status: "success", duration: "320ms" },
      { id: "node-3", name: "Process Data", status: "failed", duration: "2s", error: "Invalid data format" },
    ],
  },
]

// Status badge component
function StatusBadge({ status }) {
  const variants = {
    success: {
      variant: "outline",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    running: {
      variant: "outline",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Clock,
    },
    failed: {
      variant: "outline",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
    warning: {
      variant: "outline",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: AlertCircle,
    },
  }

  const config = variants[status] || variants.warning
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function WorkflowMonitor() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedExecution, setSelectedExecution] = useState(null)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Recent Executions</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 mt-2">
          {workflowExecutions.map((execution) => (
            <div
              key={execution.id}
              className={`p-3 border rounded-md cursor-pointer ${selectedExecution === execution.id ? "border-primary" : ""}`}
              onClick={() => setSelectedExecution(execution.id === selectedExecution ? null : execution.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{execution.workflowName}</div>
                <StatusBadge status={execution.status} />
              </div>

              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <Clock className="h-3 w-3 mr-1" />
                Started {new Date(execution.startTime).toLocaleTimeString()}
                <span className="mx-2">•</span>
                Duration: {execution.duration}
              </div>

              {selectedExecution === execution.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <h4 className="text-sm font-medium mb-2">Node Executions</h4>
                  {execution.nodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        {node.status === "running" ? (
                          <PlayCircle className="h-4 w-4 mr-2 text-blue-500" />
                        ) : node.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        {node.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {node.duration}
                        {node.error && <span className="ml-2 text-red-500">{node.error}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="running" className="space-y-2 mt-2">
          {workflowExecutions
            .filter((execution) => execution.status === "running")
            .map((execution) => (
              <div key={execution.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{execution.workflowName}</div>
                  <StatusBadge status={execution.status} />
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Started {new Date(execution.startTime).toLocaleTimeString()}
                  <span className="mx-2">•</span>
                  Duration: {execution.duration}
                </div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="success" className="space-y-2 mt-2">
          {workflowExecutions
            .filter((execution) => execution.status === "success")
            .map((execution) => (
              <div key={execution.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{execution.workflowName}</div>
                  <StatusBadge status={execution.status} />
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Completed {new Date(execution.endTime).toLocaleTimeString()}
                  <span className="mx-2">•</span>
                  Duration: {execution.duration}
                </div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="failed" className="space-y-2 mt-2">
          {workflowExecutions
            .filter((execution) => execution.status === "failed")
            .map((execution) => (
              <div key={execution.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{execution.workflowName}</div>
                  <StatusBadge status={execution.status} />
                </div>
                <div className="flex items-center text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Failed {new Date(execution.endTime).toLocaleTimeString()}
                  <span className="mx-2">•</span>
                  Duration: {execution.duration}
                </div>
                {execution.nodes.find((node) => node.status === "failed")?.error && (
                  <div className="text-xs text-red-500 mt-1">
                    Error: {execution.nodes.find((node) => node.status === "failed")?.error}
                  </div>
                )}
              </div>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

