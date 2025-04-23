"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Send,
  Loader2,
  Code,
  Wand2,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Search,
  HelpCircle,
  MessageSquare,
  Settings,
} from "lucide-react"
import { type IWorkflowData, type INode, convertToN8nWorkflow } from "@/lib/n8n-schema/workflow-schema"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FormProvider, useForm } from "react-hook-form"

interface AIWorkflowAssistantProps {
  onWorkflowGenerated?: (workflow: IWorkflowData) => void
  onWorkflowOptimized?: (workflow: IWorkflowData) => void
  onNodeConfigured?: (node: INode) => void
  currentWorkflow?: IWorkflowData
  availableNodeTypes?: any[]
}

// Mock n8n node types for demonstration
const mockNodeTypes = [
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
]

export function AIWorkflowAssistant({
  onWorkflowGenerated,
  onWorkflowOptimized,
  onNodeConfigured,
  currentWorkflow,
  availableNodeTypes = mockNodeTypes,
}: AIWorkflowAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{
    workflow?: IWorkflowData
    suggestions?: string[]
    node?: INode
    error?: string
  } | null>(null)

  const [chatHistory, setChatHistory] = useState<
    Array<{
      role: "user" | "assistant"
      content: string
      timestamp: Date
    }>
  >([])

  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null)
  const [nodeDescription, setNodeDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Add form methods
  const formMethods = useForm()

  // Filter node types based on search query
  const filteredNodeTypes = availableNodeTypes.filter(
    (node) =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Function to add message to chat history
  const addMessage = (role: "user" | "assistant", content: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        role,
        content,
        timestamp: new Date(),
      },
    ])
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setResult(null)

    // Add user message to chat history
    addMessage("user", prompt)

    try {
      // In a real implementation, this would use the AIWorkflowAgent
      // For this example, we'll simulate a response

      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a mock workflow
      const generatedWorkflow: IWorkflowData = {
        name: "Generated Workflow",
        active: false,
        nodes: [
          {
            id: "node-1",
            name: "HTTP Request",
            type: "httpRequest",
            position: [100, 100],
            parameters: {
              url: "https://api.example.com/data",
              method: "GET",
              authentication: "none",
            },
          },
          {
            id: "node-2",
            name: "Process Data",
            type: "function",
            position: [400, 100],
            parameters: {
              functionCode: `
return {
  json: {
    processed: true,
    data: $input.all()[0].json.data
  }
};
              `,
            },
          },
          {
            id: "node-3",
            name: "Deploy to Netlify",
            type: "netlifyDeploy",
            position: [700, 100],
            parameters: {
              siteId: "your-site-id",
              directory: "dist",
            },
          },
        ],
        connections: {
          "node-1": {
            main: [
              {
                node: "node-2",
                type: "main",
                index: 0,
              },
            ],
          },
          "node-2": {
            main: [
              {
                node: "node-3",
                type: "main",
                index: 0,
              },
            ],
          },
        },
      }

      setResult({ workflow: generatedWorkflow })

      // Add AI response to chat history
      addMessage(
        "assistant",
        `I've created a workflow based on your description. It includes an HTTP Request node to fetch data, a Function node to process the data, and a Netlify Deploy node to deploy the results.`,
      )

      // Call the onWorkflowGenerated callback
      if (onWorkflowGenerated) {
        onWorkflowGenerated(generatedWorkflow)
      }
    } catch (error) {
      console.error("Workflow generation failed:", error)
      setResult({ error: error.message })

      // Add error message to chat history
      addMessage("assistant", `I encountered an error while generating the workflow: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOptimize = async () => {
    if (!currentWorkflow) return

    setIsGenerating(true)
    setResult(null)

    // Add user message to chat history
    addMessage("user", `Please optimize my current workflow "${currentWorkflow.name}".`)

    try {
      // In a real implementation, this would use the AIWorkflowAgent
      // For this example, we'll simulate a response

      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate optimization suggestions
      const suggestions = [
        "Add error handling to the HTTP Request node to handle API failures",
        "Cache the results of the HTTP request to improve performance",
        "Add a retry mechanism for the Netlify deployment in case of failure",
        "Use environment variables for sensitive information like API keys",
      ]

      // Create an optimized version of the workflow
      const optimizedWorkflow: IWorkflowData = {
        ...currentWorkflow,
        name: `${currentWorkflow.name} (Optimized)`,
        nodes: [
          ...currentWorkflow.nodes,
          {
            id: "node-error-handler",
            name: "Error Handler",
            type: "if",
            position: [400, 300],
            parameters: {
              condition: "!!$input.all()[0].error",
            },
          },
        ],
      }

      setResult({
        workflow: optimizedWorkflow,
        suggestions,
      })

      // Add AI response to chat history
      addMessage(
        "assistant",
        `I've analyzed your workflow and found several optimization opportunities:\n\n${suggestions.map((s) => `- ${s}`).join("\n")}\n\nI've created an optimized version with improved error handling.`,
      )

      // Call the onWorkflowOptimized callback
      if (onWorkflowOptimized) {
        onWorkflowOptimized(optimizedWorkflow)
      }
    } catch (error) {
      console.error("Workflow optimization failed:", error)
      setResult({ error: error.message })

      // Add error message to chat history
      addMessage("assistant", `I encountered an error while optimizing the workflow: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConfigureNode = async () => {
    if (!selectedNodeType || !nodeDescription.trim()) return

    setIsGenerating(true)
    setResult(null)

    // Add user message to chat history
    addMessage("user", `Please configure a ${selectedNodeType} node that ${nodeDescription}`)

    try {
      // In a real implementation, this would use the AIWorkflowAgent
      // For this example, we'll simulate a response

      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Find the node type details
      const nodeTypeDetails = availableNodeTypes.find((n) => n.id === selectedNodeType)

      // Generate a configured node
      const configuredNode: INode = {
        id: `node-${Date.now()}`,
        name: nodeTypeDetails ? `${nodeTypeDetails.name} - ${nodeDescription.substring(0, 20)}...` : "Configured Node",
        type: selectedNodeType,
        position: [100, 100],
        parameters: {},
      }

      // Add parameters based on node type
      if (selectedNodeType === "httpRequest") {
        configuredNode.parameters = {
          url: "https://api.example.com/data",
          method: "GET",
          authentication: "none",
        }
      } else if (selectedNodeType === "function") {
        configuredNode.parameters = {
          functionCode: `// Process the data as described: ${nodeDescription}\nreturn { json: { success: true } };`,
        }
      } else if (selectedNodeType === "netlifyDeploy") {
        configuredNode.parameters = {
          siteId: "your-site-id",
          directory: "dist",
        }
      }

      setResult({ node: configuredNode })

      // Add AI response to chat history
      addMessage(
        "assistant",
        `I've configured a ${nodeTypeDetails?.name || selectedNodeType} node based on your description. The node is set up to ${nodeDescription}.`,
      )

      // Call the onNodeConfigured callback
      if (onNodeConfigured) {
        onNodeConfigured(configuredNode)
      }
    } catch (error) {
      console.error("Node configuration failed:", error)
      setResult({ error: error.message })

      // Add error message to chat history
      addMessage("assistant", `I encountered an error while configuring the node: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDebug = async () => {
    if (!currentWorkflow) return

    setIsGenerating(true)
    setResult(null)

    // Add user message to chat history
    addMessage("user", `Please debug my current workflow "${currentWorkflow.name}" and identify any issues.`)

    try {
      // In a real implementation, this would use the AIWorkflowAgent
      // For this example, we'll simulate a response

      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate debugging suggestions
      const suggestions = [
        "The HTTP Request node is missing required authentication parameters",
        "The Function node has a syntax error in the code",
        "The Netlify Deploy node is missing the required site ID",
        "There's a missing connection between the Process Data and Error Handler nodes",
      ]

      // Create a fixed version of the workflow
      const fixedWorkflow: IWorkflowData = {
        ...currentWorkflow,
        name: `${currentWorkflow.name} (Fixed)`,
      }

      setResult({
        workflow: fixedWorkflow,
        suggestions,
      })

      // Add AI response to chat history
      addMessage(
        "assistant",
        `I've analyzed your workflow and found several issues:\n\n${suggestions.map((s) => `- ${s}`).join("\n")}\n\nI've created a fixed version that addresses these issues.`,
      )
    } catch (error) {
      console.error("Workflow debugging failed:", error)
      setResult({ error: error.message })

      // Add error message to chat history
      addMessage("assistant", `I encountered an error while debugging the workflow: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChatSubmit = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Add user message to chat history
    addMessage("user", prompt)

    try {
      // In a real implementation, this would use the AI SDK
      // For this example, we'll simulate a response

      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a response
      const response = `I can help with that! Based on your question about "${prompt}", here are some suggestions:
      
1. You might want to look at the HTTP Request node for external API integration
2. Consider using the Function node for custom logic
3. The Netlify Deploy node would be perfect for deployment

Would you like me to help you set up any of these nodes?`

      // Add AI response to chat history
      addMessage("assistant", response)
    } catch (error) {
      console.error("Chat response failed:", error)

      // Add error message to chat history
      addMessage("assistant", `I encountered an error while responding: ${error.message}`)
    } finally {
      setIsGenerating(false)
      setPrompt("")
    }
  }

  return (
    <FormProvider {...formMethods}>
      <div className="space-y-4">
        <Tabs defaultValue="generate">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="generate">
              <Wand2 className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="optimize">
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="configure">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="debug">
              <Code className="h-4 w-4 mr-2" />
              Debug
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Describe the workflow you want to create... (e.g., 'Create a workflow that fetches data from an API, processes it, and deploys the results to Netlify')"
                className="min-h-[100px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Workflow
                  </>
                )}
              </Button>
            </div>

            {result?.error && (
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600">{result.error}</p>
                </CardContent>
              </Card>
            )}

            {result?.workflow && (
              <Card>
                <CardHeader>
                  <CardTitle>{result.workflow.name}</CardTitle>
                  <CardDescription>AI-generated workflow based on your description</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.workflow.nodes.map((node, index) => (
                      <div key={node.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{node.name}</div>
                          <div className="text-xs text-muted-foreground">{node.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="json">
                        <AccordionTrigger>View Workflow JSON</AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-xs overflow-auto">
                            {JSON.stringify(convertToN8nWorkflow(result.workflow), null, 2)}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (onWorkflowGenerated && result.workflow) {
                        onWorkflowGenerated(result.workflow)
                      }
                    }}
                  >
                    Apply to Designer
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="optimize">
            {!currentWorkflow ? (
              <div className="p-8 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Workflow Optimization</h3>
                <p className="text-muted-foreground mb-4">
                  Open a workflow in the designer to get AI-powered optimization suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Optimize Current Workflow</CardTitle>
                    <CardDescription>Get AI-powered suggestions to improve your workflow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      The AI assistant will analyze your workflow and suggest optimizations for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mb-4">
                      <li>Performance improvements</li>
                      <li>Error handling and reliability</li>
                      <li>Security enhancements</li>
                      <li>Best practices</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleOptimize} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Optimize Workflow
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {result?.error && (
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Error
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </CardContent>
                  </Card>
                )}

                {result?.suggestions && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Optimization Suggestions</CardTitle>
                      <CardDescription>AI-powered recommendations to improve your workflow</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    {result.workflow && (
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            if (onWorkflowOptimized && result.workflow) {
                              onWorkflowOptimized(result.workflow)
                            }
                          }}
                        >
                          Apply Optimized Workflow
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="configure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Node Configuration Assistant</CardTitle>
                <CardDescription>Get AI-powered assistance to configure specific nodes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Node Types</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for node types..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {filteredNodeTypes.map((nodeType) => (
                    <Button
                      key={nodeType.id}
                      variant={selectedNodeType === nodeType.id ? "default" : "outline"}
                      className="justify-start h-auto py-2"
                      onClick={() => setSelectedNodeType(nodeType.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{nodeType.name}</div>
                        <div className="text-xs text-muted-foreground">{nodeType.category}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                {selectedNodeType && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Describe what you want this node to do</label>
                    <Textarea
                      placeholder="e.g., 'Fetch user data from the GitHub API' or 'Process JSON data and extract the name and email fields'"
                      className="min-h-[100px]"
                      value={nodeDescription}
                      onChange={(e) => setNodeDescription(e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={handleConfigureNode}
                      disabled={isGenerating || !nodeDescription.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Configuring...
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Node
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {result?.error && (
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600">{result.error}</p>
                </CardContent>
              </Card>
            )}

            {result?.node && (
              <Card>
                <CardHeader>
                  <CardTitle>Configured Node</CardTitle>
                  <CardDescription>AI-configured node based on your description</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{result.node.name}</div>
                        <div className="text-xs text-muted-foreground">{result.node.type}</div>
                      </div>
                      <Badge variant="outline">
                        {availableNodeTypes.find((n) => n.id === result.node.type)?.category || "Node"}
                      </Badge>
                    </div>

                    <div className="mt-4">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="parameters">
                          <AccordionTrigger>View Node Parameters</AccordionTrigger>
                          <AccordionContent>
                            <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-xs overflow-auto">
                              {JSON.stringify(result.node.parameters, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (onNodeConfigured && result.node) {
                        onNodeConfigured(result.node)
                      }
                    }}
                  >
                    Add to Workflow
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="debug">
            {!currentWorkflow ? (
              <div className="p-8 text-center">
                <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Workflow Debugging</h3>
                <p className="text-muted-foreground mb-4">
                  Open a workflow in the designer to get AI-powered debugging assistance.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Debug Current Workflow</CardTitle>
                    <CardDescription>Get AI-powered assistance to identify and fix issues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      The AI assistant will analyze your workflow and identify potential issues:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mb-4">
                      <li>Configuration errors</li>
                      <li>Missing connections</li>
                      <li>Logic problems</li>
                      <li>Potential runtime errors</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleDebug} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Code className="h-4 w-4 mr-2" />
                          Debug Workflow
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {result?.error && (
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Error
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </CardContent>
                  </Card>
                )}

                {result?.suggestions && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Debugging Results</CardTitle>
                      <CardDescription>Issues identified in your workflow</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    {result.workflow && (
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            if (onWorkflowGenerated && result.workflow) {
                              onWorkflowGenerated(result.workflow)
                            }
                          }}
                        >
                          Apply Fixed Workflow
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant Chat</CardTitle>
                <CardDescription>Ask questions about n8n, workflows, or get help with specific tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {chatHistory.length === 0 ? (
                      <div className="text-center p-4">
                        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No messages yet. Ask a question to get started!</p>
                      </div>
                    ) : (
                      chatHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-center space-x-2">
                  <Textarea
                    placeholder="Ask a question about n8n, workflows, or specific nodes..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleChatSubmit()
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleChatSubmit} disabled={isGenerating || !prompt.trim()}>
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FormProvider>
  )
}

