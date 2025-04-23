"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Trash2, GripVertical, Plus, Settings, ChevronDown, Save } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { convertToN8nWorkflow } from "@/lib/n8n-schema/workflow-schema"
import { NetlifyDeploymentService } from "@/lib/netlify/deployment-service"
import { V0Integration } from "@/lib/v0/v0-integration"
import { FormProvider, useForm } from "react-hook-form"

// Mock node types
const nodeTypes = [
  {
    id: "httpRequest",
    name: "HTTP Request",
    category: "Core",
    description: "Make HTTP requests to any API",
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      { name: "url", displayName: "URL", type: "string", required: true },
      { name: "method", displayName: "Method", type: "options", options: ["GET", "POST", "PUT", "DELETE"] },
      { name: "authentication", displayName: "Authentication", type: "options", options: ["None", "Basic", "OAuth2"] },
    ],
  },
  {
    id: "function",
    name: "Function",
    category: "Core",
    description: "Run custom JavaScript code",
    inputs: ["main"],
    outputs: ["main"],
    properties: [{ name: "functionCode", displayName: "Function Code", type: "string", required: true }],
  },
  {
    id: "if",
    name: "IF",
    category: "Core",
    description: "Conditional logic",
    inputs: ["main"],
    outputs: ["true", "false"],
    properties: [{ name: "condition", displayName: "Condition", type: "string", required: true }],
  },
  {
    id: "netlifyDeploy",
    name: "Netlify Deploy",
    category: "Netlify",
    description: "Deploy to Netlify",
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      { name: "siteId", displayName: "Site ID", type: "string", required: true },
      { name: "directory", displayName: "Directory", type: "string", required: true },
    ],
  },
  {
    id: "netlifyFunction",
    name: "Netlify Function",
    category: "Netlify",
    description: "Create or update a Netlify Function",
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      { name: "functionName", displayName: "Function Name", type: "string", required: true },
      { name: "functionCode", displayName: "Function Code", type: "string", required: true },
    ],
  },
]

// Node component
function WorkflowNode({ id, type, name, isEditing, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const nodeType = nodeTypes.find((n) => n.id === type) || { name: type }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 mb-2 bg-card rounded-md border border-border group"
    >
      <div {...attributes} {...listeners} className="cursor-grab opacity-50 hover:opacity-100">
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <div className="font-medium">{name || nodeType.name}</div>
        <div className="text-xs text-muted-foreground">{nodeType.category}</div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(id)}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Node palette component
function NodePalette({ onAddNode }) {
  const categories = [...new Set(nodeTypes.map((node) => node.category))]

  return (
    <div className="border rounded-md">
      {categories.map((category) => (
        <Collapsible key={category} defaultOpen={category === "Core"}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent">
            <span className="font-medium">{category}</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-2 space-y-1">
              {nodeTypes
                .filter((node) => node.category === category)
                .map((node) => (
                  <Button
                    key={node.id}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => onAddNode(node.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {node.name}
                  </Button>
                ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}

export function WorkflowDesigner() {
  const [workflow, setWorkflow] = useState<{
    name: string
    nodes: Array<{
      id: string
      type: string
      name: string
      parameters?: Record<string, any>
    }>
    connections: Array<{
      source: string
      target: string
      sourceOutput?: string
      targetInput?: string
      sourceOutputIndex?: number
    }>
  }>({
    name: "New Workflow",
    nodes: [
      { id: "node-1", type: "httpRequest", name: "Fetch Data" },
      { id: "node-2", type: "function", name: "Process Data" },
      { id: "node-3", type: "netlifyDeploy", name: "Deploy to Netlify" },
    ],
    connections: [
      { source: "node-1", target: "node-2" },
      { source: "node-2", target: "node-3" },
    ],
  })

  const [editingNodeId, setEditingNodeId] = useState(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState(null)

  // Add form methods
  const formMethods = useForm()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setWorkflow((currentWorkflow) => {
        const oldIndex = currentWorkflow.nodes.findIndex((item) => item.id === active.id)
        const newIndex = currentWorkflow.nodes.findIndex((item) => item.id === over.id)

        return {
          ...currentWorkflow,
          nodes: arrayMove(currentWorkflow.nodes, oldIndex, newIndex),
        }
      })
    }
  }

  const handleAddNode = (type: string) => {
    const nodeType = nodeTypes.find((n) => n.id === type)
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      name: nodeType ? nodeType.name : type,
    }

    setWorkflow({
      ...workflow,
      nodes: [...workflow.nodes, newNode],
    })
  }

  const handleEditNode = (id: string) => {
    setEditingNodeId(id)
  }

  const handleDeleteNode = (id: string) => {
    setWorkflow({
      ...workflow,
      nodes: workflow.nodes.filter((node) => node.id !== id),
      connections: workflow.connections.filter((conn) => conn.source !== id && conn.target !== id),
    })
  }

  const handleDeployToNetlify = async () => {
    try {
      setIsDeploying(true)

      // Convert the visual workflow to n8n format
      const n8nWorkflow = convertToN8nWorkflow(workflow)

      // Create a mock deployment service
      // In a real implementation, this would use actual API keys
      const deploymentService = new NetlifyDeploymentService("mock-api-key")

      // Deploy the workflow
      const result = await deploymentService.deployWorkflow(n8nWorkflow, {
        environmentVariables: {
          N8N_WORKFLOW_NAME: workflow.name,
        },
      })

      setDeploymentResult(result)
    } catch (error) {
      console.error("Deployment failed:", error)
      setDeploymentResult({
        success: false,
        error: error.message,
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleDeployWithV0 = async () => {
    try {
      setIsDeploying(true)

      // Convert the visual workflow to n8n format
      const n8nWorkflow = convertToN8nWorkflow(workflow)

      // Create a mock V0 integration
      // In a real implementation, this would use actual API keys
      const v0Integration = new V0Integration("mock-api-key")

      // Deploy the workflow using V0
      const result = await v0Integration.initiateDeployment(n8nWorkflow, {
        workflowName: workflow.name,
        workflowDescription: `n8n workflow: ${workflow.name}`,
        deployPreview: true,
      })

      setDeploymentResult(result)
    } catch (error) {
      console.error("V0 deployment failed:", error)
      setDeploymentResult({
        success: false,
        error: error.message,
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <FormProvider {...formMethods}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => console.log(JSON.stringify(convertToN8nWorkflow(workflow), null, 2))}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>

            <Button variant="default" onClick={handleDeployWithV0} disabled={isDeploying}>
              {isDeploying ? "Deploying..." : "Deploy with v0"}
            </Button>
          </div>
        </div>

        {deploymentResult && (
          <div
            className={`p-4 rounded-md ${deploymentResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <h3 className="font-medium mb-2">
              {deploymentResult.success ? "Deployment Successful" : "Deployment Failed"}
            </h3>
            {deploymentResult.success && deploymentResult.deploymentUrl && (
              <p className="text-sm">
                Deployed to:{" "}
                <a
                  href={deploymentResult.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {deploymentResult.deploymentUrl}
                </a>
              </p>
            )}
            {!deploymentResult.success && deploymentResult.error && (
              <p className="text-sm text-red-600">{deploymentResult.error}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <div className="p-4 border rounded-md bg-background min-h-[400px]">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={workflow.nodes.map((node) => node.id)} strategy={verticalListSortingStrategy}>
                  {workflow.nodes.map((node) => (
                    <WorkflowNode
                      key={node.id}
                      id={node.id}
                      type={node.type}
                      name={node.name}
                      isEditing={editingNodeId === node.id}
                      onEdit={handleEditNode}
                      onDelete={handleDeleteNode}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {workflow.nodes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <div className="text-muted-foreground mb-4">Your workflow is empty. Add nodes from the palette.</div>
                  <Button onClick={() => handleAddNode("httpRequest")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Node
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Node Palette</h3>
            <NodePalette onAddNode={handleAddNode} />
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

