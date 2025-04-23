/**
 * AI agent for workflow generation and optimization
 */

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { IWorkflowData, INode, INodeTypeDescription } from "../n8n-schema/workflow-schema"

export interface WorkflowGenerationOptions {
  description: string
  nodeTypes?: INodeTypeDescription[]
  complexity?: "simple" | "medium" | "complex"
  preferredNodeTypes?: string[]
}

export interface WorkflowOptimizationOptions {
  workflow: IWorkflowData
  optimizationGoals?: Array<"performance" | "reliability" | "security">
}

export interface NodeConfigurationOptions {
  nodeType: string
  nodeTypeDescription: INodeTypeDescription
  userDescription: string
}

export class AIWorkflowAgent {
  private availableNodeTypes: INodeTypeDescription[]
  private model: string
  private n8nSchemaData: any

  constructor(availableNodeTypes: INodeTypeDescription[] = [], model = "gpt-4o") {
    this.availableNodeTypes = availableNodeTypes
    this.model = model

    // In a real implementation, this would be loaded from the n8n GitHub repository
    this.n8nSchemaData = {
      version: "1.0.0",
      nodeTypes: availableNodeTypes,
      // Additional schema data would be loaded here
    }
  }

  /**
   * Generates a workflow based on a natural language description
   */
  async generateWorkflow(options: WorkflowGenerationOptions): Promise<IWorkflowData> {
    try {
      // Create a prompt for the AI model
      const prompt = this.createWorkflowGenerationPrompt(options)

      // Generate the workflow using the AI model
      const { text } = await generateText({
        model: openai(this.model),
        prompt,
        system:
          "You are an expert n8n workflow designer. Your task is to create valid n8n workflow JSON based on the user's description. Only respond with valid JSON that follows the n8n workflow schema.",
      })

      // Parse the generated workflow
      const workflow = JSON.parse(text)

      // Validate and clean up the generated workflow
      return this.validateAndCleanWorkflow(workflow)
    } catch (error) {
      console.error("Workflow generation failed:", error)
      throw new Error(`Failed to generate workflow: ${error.message}`)
    }
  }

  /**
   * Optimizes an existing workflow
   */
  async optimizeWorkflow(options: WorkflowOptimizationOptions): Promise<{
    optimizedWorkflow: IWorkflowData
    suggestions: string[]
    optimizationDetails: string
  }> {
    try {
      // Create a prompt for the AI model
      const prompt = this.createWorkflowOptimizationPrompt(options)

      // Generate the optimized workflow using the AI model
      const { text } = await generateText({
        model: openai(this.model),
        prompt,
        system:
          "You are an expert n8n workflow optimizer. Your task is to analyze the provided workflow and suggest optimizations based on the specified goals. Respond with a JSON object containing the optimized workflow, suggestions, and optimization details.",
      })

      // Parse the response
      const response = JSON.parse(text)

      // Validate and clean up the optimized workflow
      const optimizedWorkflow = this.validateAndCleanWorkflow(response.workflow || response.optimizedWorkflow)

      return {
        optimizedWorkflow,
        suggestions: response.suggestions || [],
        optimizationDetails: response.optimizationDetails || "",
      }
    } catch (error) {
      console.error("Workflow optimization failed:", error)
      throw new Error(`Failed to optimize workflow: ${error.message}`)
    }
  }

  /**
   * Provides configuration assistance for a specific node
   */
  async configureNode(options: NodeConfigurationOptions): Promise<INode> {
    try {
      // Create a prompt for the AI model
      const prompt = this.createNodeConfigurationPrompt(options)

      // Generate the node configuration using the AI model
      const { text } = await generateText({
        model: openai(this.model),
        prompt,
        system:
          "You are an expert n8n node configurator. Your task is to configure the specified node based on the user's description. Only respond with valid JSON that follows the n8n node schema.",
      })

      // Parse the configured node
      const node = JSON.parse(text)

      // Validate the node configuration
      return this.validateNodeConfiguration(node, options.nodeTypeDescription)
    } catch (error) {
      console.error("Node configuration failed:", error)
      throw new Error(`Failed to configure node: ${error.message}`)
    }
  }

  /**
   * Suggests debugging solutions for workflow errors
   */
  async debugWorkflow(
    workflow: IWorkflowData,
    error?: string,
  ): Promise<{
    suggestions: string[]
    fixedWorkflow?: IWorkflowData
    debugDetails?: string
  }> {
    try {
      // Create a prompt for the AI model
      const prompt = `
I have an n8n workflow that's encountering issues. Please analyze the workflow and suggest solutions.

Workflow:
${JSON.stringify(workflow, null, 2)}

${error ? `Error:\n${error}` : "Please identify any potential issues in this workflow."}

Please provide:
1. A list of potential issues and solutions
2. A fixed version of the workflow if possible
3. Detailed explanation of the issues and how they were fixed
`

      // Generate debugging suggestions using the AI model
      const { text } = await generateText({
        model: openai(this.model),
        prompt,
        system:
          "You are an expert n8n workflow debugger. Your task is to analyze the provided workflow and error, and suggest solutions. Respond with a JSON object containing suggestions, a fixed workflow, and debug details.",
      })

      // Parse the response
      const response = JSON.parse(text)

      return {
        suggestions: response.suggestions || [],
        fixedWorkflow: response.fixedWorkflow ? this.validateAndCleanWorkflow(response.fixedWorkflow) : undefined,
        debugDetails: response.debugDetails || "",
      }
    } catch (error) {
      console.error("Workflow debugging failed:", error)
      throw new Error(`Failed to debug workflow: ${error.message}`)
    }
  }

  /**
   * Provides documentation and help for n8n concepts
   */
  async getHelp(query: string): Promise<{
    answer: string
    relatedNodes?: string[]
    examples?: string[]
  }> {
    try {
      // Create a prompt for the AI model
      const prompt = `
I need help with n8n workflows. Here's my question:

${query}

Please provide:
1. A detailed answer to my question
2. Related n8n nodes that might be helpful
3. Example usage if applicable
`

      // Generate help response using the AI model
      const { text } = await generateText({
        model: openai(this.model),
        prompt,
        system:
          "You are an expert n8n assistant. Your task is to provide helpful information about n8n workflows, nodes, and concepts. Respond with a JSON object containing your answer, related nodes, and examples.",
      })

      // Parse the response
      const response = JSON.parse(text)

      return {
        answer: response.answer || "",
        relatedNodes: response.relatedNodes || [],
        examples: response.examples || [],
      }
    } catch (error) {
      console.error("Help request failed:", error)
      throw new Error(`Failed to get help: ${error.message}`)
    }
  }

  /**
   * Creates a prompt for workflow generation
   */
  private createWorkflowGenerationPrompt(options: WorkflowGenerationOptions): string {
    const nodeTypesInfo = this.availableNodeTypes
      .filter((nodeType) => !options.preferredNodeTypes || options.preferredNodeTypes.includes(nodeType.name))
      .map(
        (nodeType) => `
Name: ${nodeType.name}
Display Name: ${nodeType.displayName || nodeType.name}
Description: ${nodeType.description || "No description available"}
Inputs: ${nodeType.inputs?.join(", ") || "main"}
Outputs: ${nodeType.outputs?.join(", ") || "main"}
Properties: ${nodeType.properties?.map((prop) => prop.name).join(", ") || "None"}
      `,
      )
      .join("\n")

    return `
Create an n8n workflow based on the following description:

${options.description}

Complexity level: ${options.complexity || "medium"}

Available node types:
${nodeTypesInfo}

Preferred node types: ${options.preferredNodeTypes?.join(", ") || "Any"}

The workflow should be valid according to the n8n workflow schema and should include:
- A meaningful name
- Properly configured nodes
- Correct connections between nodes
- Any necessary error handling

Please provide the workflow as a valid JSON object.
`
  }

  /**
   * Creates a prompt for workflow optimization
   */
  private createWorkflowOptimizationPrompt(options: WorkflowOptimizationOptions): string {
    return `
Optimize the following n8n workflow:

${JSON.stringify(options.workflow, null, 2)}

Optimization goals: ${options.optimizationGoals?.join(", ") || "performance, reliability, security"}

Please analyze the workflow and suggest optimizations for:
${options.optimizationGoals?.includes("performance") ? "- Performance: Reduce execution time and resource usage" : ""}
${options.optimizationGoals?.includes("reliability") ? "- Reliability: Improve error handling and recovery" : ""}
${options.optimizationGoals?.includes("security") ? "- Security: Enhance data protection and access control" : ""}

Please provide a JSON response with the following structure:
{
  "workflow": {
    // The optimized workflow in n8n format
  },
  "suggestions": [
    // Array of optimization suggestions
  ],
  "optimizationDetails": "Detailed explanation of the optimizations made"
}
`
  }

  /**
   * Creates a prompt for node configuration
   */
  private createNodeConfigurationPrompt(options: NodeConfigurationOptions): string {
    const propertiesInfo =
      options.nodeTypeDescription.properties
        ?.map(
          (prop) => `
Name: ${prop.name}
Display Name: ${prop.displayName || prop.name}
Type: ${prop.type}
Required: ${prop.required ? "Yes" : "No"}
Default: ${prop.default !== undefined ? JSON.stringify(prop.default) : "None"}
Description: ${prop.description || "No description"}
      `,
        )
        ?.join("\n") || "No properties available"

    return `
Configure an n8n node of type "${options.nodeType}" based on the following description:

${options.userDescription}

Node type details:
Display Name: ${options.nodeTypeDescription.displayName || options.nodeTypeDescription.name}
Description: ${options.nodeTypeDescription.description || "No description available"}
Inputs: ${options.nodeTypeDescription.inputs?.join(", ") || "main"}
Outputs: ${options.nodeTypeDescription.outputs?.join(", ") || "main"}

Properties:
${propertiesInfo}

Please provide the configured node as a valid JSON object following the n8n node schema.
`
  }

  /**
   * Validates and cleans up a generated workflow
   */
  private validateAndCleanWorkflow(workflow: any): IWorkflowData {
    // Ensure the workflow has the required fields
    if (!workflow.name) {
      workflow.name = "Generated Workflow"
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      workflow.nodes = []
    }

    if (!workflow.connections || typeof workflow.connections !== "object") {
      workflow.connections = {}
    }

    // Ensure all nodes have the required fields
    workflow.nodes = workflow.nodes.map((node: any, index: number) => {
      if (!node.id) {
        node.id = `node_${index}`
      }

      if (!node.name) {
        node.name = `Node ${index}`
      }

      if (!node.type) {
        node.type = "unknown"
      }

      if (!node.parameters) {
        node.parameters = {}
      }

      if (!node.position) {
        // Generate a position based on the index
        node.position = [index * 200, Math.floor(index / 5) * 200]
      }

      return node
    })

    // Set active status if not present
    if (workflow.active === undefined) {
      workflow.active = false
    }

    return workflow as IWorkflowData
  }

  /**
   * Validates a node configuration
   */
  private validateNodeConfiguration(node: any, nodeTypeDescription: INodeTypeDescription): INode {
    // Ensure the node has the required fields
    if (!node.id) {
      node.id = `node_${Date.now()}`
    }

    if (!node.name) {
      node.name = nodeTypeDescription.displayName || nodeTypeDescription.name
    }

    if (!node.type) {
      node.type = nodeTypeDescription.name
    }

    if (!node.parameters) {
      node.parameters = {}
    }

    if (!node.position) {
      node.position = [0, 0]
    }

    // Validate parameters against the node type description
    const validParameters: Record<string, any> = {}

    if (nodeTypeDescription.properties) {
      for (const prop of nodeTypeDescription.properties) {
        if (node.parameters[prop.name] !== undefined) {
          validParameters[prop.name] = node.parameters[prop.name]
        } else if (prop.required) {
          // If a required parameter is missing, use the default value or null
          validParameters[prop.name] = prop.default !== undefined ? prop.default : null
        }
      }
    }

    node.parameters = validParameters

    return node as INode
  }

  /**
   * Updates the available node types from the n8n GitHub repository
   */
  async updateNodeTypesFromGitHub(): Promise<void> {
    try {
      // In a real implementation, this would fetch the latest node types from the n8n GitHub repository
      // For this example, we'll just log a message
      console.log("Updating node types from GitHub...")

      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Node types updated successfully!")
    } catch (error) {
      console.error("Failed to update node types from GitHub:", error)
      throw error
    }
  }
}

