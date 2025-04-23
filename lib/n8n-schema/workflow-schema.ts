/**
 * Core n8n workflow schema types based on n8n GitHub repository
 * These types represent the structure of n8n workflows and nodes
 */

export interface INodeTypeDescription {
  displayName: string
  name: string
  group: string[]
  description: string
  version: number
  defaults: {
    name: string
    color: string
  }
  inputs: string[]
  outputs: string[]
  properties: INodeProperties[]
}

export interface INodeProperties {
  displayName: string
  name: string
  type: string
  default?: any
  description?: string
  placeholder?: string
  options?: Array<{
    name: string
    value: string
    description?: string
  }>
  required?: boolean
  typeOptions?: {
    [key: string]: any
  }
}

export interface INode {
  id: string
  name: string
  type: string
  position: [number, number]
  parameters: {
    [key: string]: any
  }
  typeVersion?: number
  credentials?: {
    [key: string]: {
      id: string
      name: string
    }
  }
  disabled?: boolean
  notes?: string
}

export interface IConnections {
  [key: string]: {
    [key: string]: Array<{
      node: string
      type: string
      index: number
    }>
  }
}

export interface IWorkflowSettings {
  saveExecutionProgress?: boolean
  saveManualExecutions?: boolean
  saveDataErrorExecution?: string
  saveDataSuccessExecution?: string
  executionTimeout?: number
  errorWorkflow?: string
  callerPolicy?: string
  timezone?: string
}

export interface IWorkflowData {
  id?: string
  name: string
  active: boolean
  nodes: INode[]
  connections: IConnections
  settings?: IWorkflowSettings
  tags?: string[]
  pinData?: {
    [key: string]: any[]
  }
  staticData?: {
    [key: string]: any
  }
  versionId?: string
}

/**
 * Converts a visual workflow from the UI to n8n workflow format
 */
export function convertToN8nWorkflow(visualWorkflow: any): IWorkflowData {
  // Implementation would map from our visual representation to n8n format
  // This is a simplified example
  const nodes: INode[] = visualWorkflow.nodes.map((node: any) => ({
    id: node.id,
    name: node.name || node.type,
    type: node.type,
    position: node.position || [0, 0],
    parameters: node.parameters || {},
    typeVersion: node.typeVersion || 1,
    credentials: node.credentials || {},
    disabled: node.disabled || false,
    notes: node.notes || "",
  }))

  // Convert connections from visual format to n8n format
  const connections: IConnections = {}
  visualWorkflow.connections.forEach((connection: any) => {
    const sourceNodeId = connection.source
    const targetNodeId = connection.target
    const sourceOutput = connection.sourceOutput || "main"
    const targetInput = connection.targetInput || "main"
    const sourceOutputIndex = connection.sourceOutputIndex || 0

    if (!connections[sourceNodeId]) {
      connections[sourceNodeId] = {}
    }

    if (!connections[sourceNodeId][sourceOutput]) {
      connections[sourceNodeId][sourceOutput] = []
    }

    connections[sourceNodeId][sourceOutput].push({
      node: targetNodeId,
      type: targetInput,
      index: sourceOutputIndex,
    })
  })

  return {
    name: visualWorkflow.name || "New Workflow",
    active: visualWorkflow.active || false,
    nodes,
    connections,
    settings: visualWorkflow.settings || {},
    tags: visualWorkflow.tags || [],
  }
}

/**
 * Converts an n8n workflow to our visual format
 */
export function convertFromN8nWorkflow(n8nWorkflow: IWorkflowData): any {
  // Implementation would map from n8n format to our visual representation
  // This is a simplified example
  const nodes = n8nWorkflow.nodes.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    position: node.position,
    parameters: node.parameters,
    typeVersion: node.typeVersion,
    credentials: node.credentials,
    disabled: node.disabled,
    notes: node.notes,
  }))

  // Convert connections from n8n format to visual format
  const connections: any[] = []
  Object.entries(n8nWorkflow.connections).forEach(([sourceNodeId, outputs]) => {
    Object.entries(outputs).forEach(([outputName, targets]) => {
      targets.forEach((target) => {
        connections.push({
          source: sourceNodeId,
          target: target.node,
          sourceOutput: outputName,
          targetInput: target.type,
          sourceOutputIndex: target.index,
        })
      })
    })
  })

  return {
    name: n8nWorkflow.name,
    active: n8nWorkflow.active,
    nodes,
    connections,
    settings: n8nWorkflow.settings,
    tags: n8nWorkflow.tags,
  }
}

/**
 * Validates an n8n workflow
 */
export function validateN8nWorkflow(workflow: IWorkflowData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required fields
  if (!workflow.name) {
    errors.push("Workflow name is required")
  }

  if (!workflow.nodes || !Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    errors.push("Workflow must contain at least one node")
  }

  // Validate nodes
  workflow.nodes.forEach((node, index) => {
    if (!node.id) {
      errors.push(`Node at index ${index} is missing an ID`)
    }
    if (!node.type) {
      errors.push(`Node ${node.id || index} is missing a type`)
    }
    if (!node.name) {
      errors.push(`Node ${node.id || index} is missing a name`)
    }
  })

  // Validate connections
  if (workflow.connections) {
    Object.entries(workflow.connections).forEach(([sourceNodeId, outputs]) => {
      // Check if source node exists
      if (!workflow.nodes.some((node) => node.id === sourceNodeId)) {
        errors.push(`Connection references non-existent source node: ${sourceNodeId}`)
      }

      Object.entries(outputs).forEach(([outputName, targets]) => {
        targets.forEach((target) => {
          // Check if target node exists
          if (!workflow.nodes.some((node) => node.id === target.node)) {
            errors.push(`Connection references non-existent target node: ${target.node}`)
          }
        })
      })
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

