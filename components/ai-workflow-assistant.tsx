"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2, Code, Wand2, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { IWorkflowData } from "@/lib/n8n-schema/workflow-schema"

interface AIWorkflowAssistantProps {
  onWorkflowGenerated?: (workflow: IWorkflowData) => void
  onWorkflowOptimized?: (workflow: IWorkflowData) => void
  currentWorkflow?: IWorkflowData
}

export function AIWorkflowAssistant({
  onWorkflowGenerated,
  onWorkflowOptimized,
  currentWorkflow,
}: AIWorkflowAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{
    workflow?: IWorkflowData
    suggestions?: string[]
    error?: string
  } | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setResult(null)

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

      // Call the onWorkflowGenerated callback
      if (onWorkflowGenerated) {
        onWorkflowGenerated(generatedWorkflow)
      }
    } catch (error) {
      console.error("Workflow generation failed:", error)
      setResult({ error: error.message })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOptimize = async () => {
    if (!currentWorkflow) return

    setIsGenerating(true)
    setResult(null)

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

      // Call the onWorkflowOptimized callback
      if (onWorkflowOptimized) {
        onWorkflowOptimized(optimizedWorkflow)
      }
    } catch (error) {
      console.error("Workflow optimization failed:", error)
      setResult({ error: error.message })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDebug = async () => {
    if (!currentWorkflow) return

    setIsGenerating(true)
    setResult(null)

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
    } catch (error) {
      console.error("Workflow debugging failed:", error)
      setResult({ error: error.message })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="generate">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">
            <Wand2 className="h-4 w-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="optimize">
            <Sparkles className="h-4 w-4 mr-2" />
            Optimize
          </TabsTrigger>
          <TabsTrigger value="debug">
            <Code className="h-4 w-4 mr-2" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe the workflow you want to create..."
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
      </Tabs>
    </div>
  )
}

