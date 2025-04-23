"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2, Code, Wand2, Lightbulb } from "lucide-react"

export function AIAssistant() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerate = () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Simulate AI response
    setTimeout(() => {
      setResult({
        workflow: {
          name: "Generated Workflow",
          description: "This workflow was generated based on your prompt",
          nodes: [
            { id: "node-1", type: "httpRequest", name: "Fetch Data" },
            { id: "node-2", type: "function", name: "Process Data" },
            { id: "node-3", type: "netlifyDeploy", name: "Deploy to Netlify" },
          ],
        },
      })
      setIsGenerating(false)
    }, 2000)
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

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>{result.workflow.name}</CardTitle>
                <CardDescription>{result.workflow.description}</CardDescription>
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
                <Button variant="outline" className="w-full">
                  Apply to Designer
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimize">
          <div className="p-8 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Workflow Optimization</h3>
            <p className="text-muted-foreground mb-4">
              Open a workflow in the designer to get AI-powered optimization suggestions.
            </p>
            <Button variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize Current Workflow
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="debug">
          <div className="p-8 text-center">
            <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Workflow Debugging</h3>
            <p className="text-muted-foreground mb-4">
              Open a workflow in the designer to get AI-powered debugging assistance.
            </p>
            <Button variant="outline">
              <Code className="h-4 w-4 mr-2" />
              Debug Current Workflow
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

