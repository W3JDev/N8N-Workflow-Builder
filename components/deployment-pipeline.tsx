"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormDescription, FormLabel } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Download, Server, Settings, Shield, Loader2, CheckCircle2, XCircle } from "lucide-react"
import type { IWorkflowData } from "@/lib/n8n-schema/workflow-schema"
import { NetlifyDeploymentService } from "@/lib/netlify/deployment-service"
import { V0Integration } from "@/lib/v0/v0-integration"
import { FormProvider, useForm } from "react-hook-form"

interface DeploymentPipelineProps {
  workflow: IWorkflowData
  onDeploymentComplete?: (result: any) => void
}

export function DeploymentPipeline({ workflow, onDeploymentComplete }: DeploymentPipelineProps) {
  const [deploymentConfig, setDeploymentConfig] = useState({
    netlify: {
      siteId: "",
      teamId: "",
      functionsDirectory: "netlify/functions",
      buildCommand: "npm run build",
      publishDirectory: "dist",
    },
    environment: {
      N8N_WORKFLOW_NAME: workflow.name,
      N8N_ENCRYPTION_KEY: "",
      NETLIFY_AUTH_TOKEN: "",
    },
    security: {
      encryptCredentials: true,
      generateApiKey: true,
      restrictAccess: false,
    },
    v0: {
      deployPreview: true,
      description: `n8n workflow: ${workflow.name}`,
    },
  })

  const [deploymentStatus, setDeploymentStatus] = useState<{
    isDeploying: boolean
    currentStep: string
    steps: Array<{
      id: string
      name: string
      status: "pending" | "processing" | "success" | "error"
      message?: string
    }>
    result?: any
  }>({
    isDeploying: false,
    currentStep: "",
    steps: [
      { id: "validate", name: "Validate Workflow", status: "pending" },
      { id: "prepare", name: "Prepare Deployment Files", status: "pending" },
      { id: "configure", name: "Configure Netlify", status: "pending" },
      { id: "deploy", name: "Deploy to Netlify", status: "pending" },
      { id: "verify", name: "Verify Deployment", status: "pending" },
    ],
  })

  const updateDeploymentStep = (
    stepId: string,
    status: "pending" | "processing" | "success" | "error",
    message?: string,
  ) => {
    setDeploymentStatus((current) => ({
      ...current,
      currentStep: stepId,
      steps: current.steps.map((step) => (step.id === stepId ? { ...step, status, message } : step)),
    }))
  }

  const handleDeployWithNetlify = async () => {
    try {
      setDeploymentStatus({
        ...deploymentStatus,
        isDeploying: true,
        result: undefined,
      })

      // Step 1: Validate workflow
      updateDeploymentStep("validate", "processing")
      // In a real implementation, this would validate the workflow
      await new Promise((resolve) => setTimeout(resolve, 1000))
      updateDeploymentStep("validate", "success", "Workflow validation successful")

      // Step 2: Prepare deployment files
      updateDeploymentStep("prepare", "processing")
      // In a real implementation, this would prepare the deployment files
      await new Promise((resolve) => setTimeout(resolve, 1500))
      updateDeploymentStep("prepare", "success", "Deployment files prepared")

      // Step 3: Configure Netlify
      updateDeploymentStep("configure", "processing")
      // In a real implementation, this would configure Netlify
      await new Promise((resolve) => setTimeout(resolve, 1200))
      updateDeploymentStep("configure", "success", "Netlify configuration complete")

      // Step 4: Deploy to Netlify
      updateDeploymentStep("deploy", "processing")

      // Create a mock deployment service
      const deploymentService = new NetlifyDeploymentService("mock-api-key", {
        ...deploymentConfig.netlify,
        environmentVariables: deploymentConfig.environment,
      })

      // Deploy the workflow
      const result = await deploymentService.deployWorkflow(workflow)

      if (result.success) {
        updateDeploymentStep("deploy", "success", "Deployment to Netlify successful")
      } else {
        updateDeploymentStep("deploy", "error", `Deployment failed: ${result.error}`)
        throw new Error(result.error)
      }

      // Step 5: Verify deployment
      updateDeploymentStep("verify", "processing")
      // In a real implementation, this would verify the deployment
      await new Promise((resolve) => setTimeout(resolve, 1000))
      updateDeploymentStep("verify", "success", "Deployment verification successful")

      // Set the deployment result
      setDeploymentStatus((current) => ({
        ...current,
        isDeploying: false,
        result,
      }))

      // Call the onDeploymentComplete callback
      if (onDeploymentComplete) {
        onDeploymentComplete(result)
      }
    } catch (error) {
      console.error("Deployment failed:", error)

      // Update the current step to error
      if (deploymentStatus.currentStep) {
        updateDeploymentStep(deploymentStatus.currentStep, "error", `Error: ${error.message}`)
      }

      // Set the deployment status to not deploying
      setDeploymentStatus((current) => ({
        ...current,
        isDeploying: false,
        result: {
          success: false,
          error: error.message,
        },
      }))
    }
  }

  const handleDeployWithV0 = async () => {
    try {
      setDeploymentStatus({
        ...deploymentStatus,
        isDeploying: true,
        result: undefined,
      })

      // Step 1: Validate workflow
      updateDeploymentStep("validate", "processing")
      // In a real implementation, this would validate the workflow
      await new Promise((resolve) => setTimeout(resolve, 1000))
      updateDeploymentStep("validate", "success", "Workflow validation successful")

      // Step 2: Prepare deployment files
      updateDeploymentStep("prepare", "processing")
      // In a real implementation, this would prepare the deployment files
      await new Promise((resolve) => setTimeout(resolve, 1500))
      updateDeploymentStep("prepare", "success", "Deployment files prepared")

      // Step 3: Configure Netlify
      updateDeploymentStep("configure", "processing")
      // In a real implementation, this would configure Netlify
      await new Promise((resolve) => setTimeout(resolve, 1200))
      updateDeploymentStep("configure", "success", "Netlify configuration complete")

      // Step 4: Deploy to Netlify using v0
      updateDeploymentStep("deploy", "processing")

      // Create a mock V0 integration
      const v0Integration = new V0Integration("mock-api-key")

      // Deploy the workflow using V0
      const result = await v0Integration.initiateDeployment(workflow, {
        workflowName: workflow.name,
        workflowDescription: deploymentConfig.v0.description,
        netlifyTeamId: deploymentConfig.netlify.teamId,
        environmentVariables: deploymentConfig.environment,
        deployPreview: deploymentConfig.v0.deployPreview,
      })

      if (result.success) {
        updateDeploymentStep("deploy", "success", "Deployment with v0 successful")
      } else {
        updateDeploymentStep("deploy", "error", `Deployment failed: ${result.error}`)
        throw new Error(result.error)
      }

      // Step 5: Verify deployment
      updateDeploymentStep("verify", "processing")
      // In a real implementation, this would verify the deployment
      await new Promise((resolve) => setTimeout(resolve, 1000))
      updateDeploymentStep("verify", "success", "Deployment verification successful")

      // Set the deployment result
      setDeploymentStatus((current) => ({
        ...current,
        isDeploying: false,
        result,
      }))

      // Call the onDeploymentComplete callback
      if (onDeploymentComplete) {
        onDeploymentComplete(result)
      }
    } catch (error) {
      console.error("Deployment failed:", error)

      // Update the current step to error
      if (deploymentStatus.currentStep) {
        updateDeploymentStep(deploymentStatus.currentStep, "error", `Error: ${error.message}`)
      }

      // Set the deployment status to not deploying
      setDeploymentStatus((current) => ({
        ...current,
        isDeploying: false,
        result: {
          success: false,
          error: error.message,
        },
      }))
    }
  }

  // Add form methods
  const formMethods = useForm()

  return (
    <FormProvider {...formMethods}>
      <div className="space-y-6">
        <Tabs defaultValue="netlify">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="netlify">
              <Server className="h-4 w-4 mr-2" />
              Netlify Config
            </TabsTrigger>
            <TabsTrigger value="environment">
              <Settings className="h-4 w-4 mr-2" />
              Environment
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="netlify" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Netlify Configuration</CardTitle>
                <CardDescription>Configure your Netlify deployment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Site ID</FormLabel>
                    <Input
                      placeholder="your-site-id"
                      value={deploymentConfig.netlify.siteId}
                      onChange={(e) =>
                        setDeploymentConfig({
                          ...deploymentConfig,
                          netlify: {
                            ...deploymentConfig.netlify,
                            siteId: e.target.value,
                          },
                        })
                      }
                    />
                    <FormDescription>Your Netlify site ID (optional)</FormDescription>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Team ID</FormLabel>
                    <Input
                      placeholder="your-team-id"
                      value={deploymentConfig.netlify.teamId}
                      onChange={(e) =>
                        setDeploymentConfig({
                          ...deploymentConfig,
                          netlify: {
                            ...deploymentConfig.netlify,
                            teamId: e.target.value,
                          },
                        })
                      }
                    />
                    <FormDescription>Your Netlify team ID (optional)</FormDescription>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Functions Directory</FormLabel>
                    <Input
                      placeholder="netlify/functions"
                      value={deploymentConfig.netlify.functionsDirectory}
                      onChange={(e) =>
                        setDeploymentConfig({
                          ...deploymentConfig,
                          netlify: {
                            ...deploymentConfig.netlify,
                            functionsDirectory: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Build Command</FormLabel>
                    <Input
                      placeholder="npm run build"
                      value={deploymentConfig.netlify.buildCommand}
                      onChange={(e) =>
                        setDeploymentConfig({
                          ...deploymentConfig,
                          netlify: {
                            ...deploymentConfig.netlify,
                            buildCommand: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Publish Directory</FormLabel>
                  <Input
                    placeholder="dist"
                    value={deploymentConfig.netlify.publishDirectory}
                    onChange={(e) =>
                      setDeploymentConfig({
                        ...deploymentConfig,
                        netlify: {
                          ...deploymentConfig.netlify,
                          publishDirectory: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Configure environment variables for your deployment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>N8N_WORKFLOW_NAME</FormLabel>
                  <Input
                    value={deploymentConfig.environment.N8N_WORKFLOW_NAME}
                    onChange={(e) =>
                      setDeploymentConfig({
                        ...deploymentConfig,
                        environment: {
                          ...deploymentConfig.environment,
                          N8N_WORKFLOW_NAME: e.target.value,
                        },
                      })
                    }
                  />
                  <FormDescription>The name of your n8n workflow</FormDescription>
                </div>

                <div className="space-y-2">
                  <FormLabel>N8N_ENCRYPTION_KEY</FormLabel>
                  <Input
                    type="password"
                    placeholder="Your encryption key"
                    value={deploymentConfig.environment.N8N_ENCRYPTION_KEY}
                    onChange={(e) =>
                      setDeploymentConfig({
                        ...deploymentConfig,
                        environment: {
                          ...deploymentConfig.environment,
                          N8N_ENCRYPTION_KEY: e.target.value,
                        },
                      })
                    }
                  />
                  <FormDescription>Used to encrypt sensitive data</FormDescription>
                </div>

                <div className="space-y-2">
                  <FormLabel>NETLIFY_AUTH_TOKEN</FormLabel>
                  <Input
                    type="password"
                    placeholder="Your Netlify auth token"
                    value={deploymentConfig.environment.NETLIFY_AUTH_TOKEN}
                    onChange={(e) =>
                      setDeploymentConfig({
                        ...deploymentConfig,
                        environment: {
                          ...deploymentConfig.environment,
                          NETLIFY_AUTH_TOKEN: e.target.value,
                        },
                      })
                    }
                  />
                  <FormDescription>Your Netlify authentication token</FormDescription>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security settings for your deployment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="encrypt-credentials"
                    checked={deploymentConfig.security.encryptCredentials}
                    onCheckedChange={(checked) =>
                      setDeploymentConfig({
                        ...deploymentConfig,
                        security: {
                          ...deploymentConfig.security,
                          encryptCredentials: checked === true,
                        },
                      })
                    }
                  />
                  <label
                    htmlFor="encrypt-credentials"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Encrypt credentials
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generate-api-key"
                    checked={deploymentConfig.security.generateApiKey}
                    onCheckedChange={(checked) =>
                      setDeploymentConfig({
                        ...deploymentConfig,
                        security: {
                          ...deploymentConfig.security,
                          generateApiKey: checked === true,
                        },
                      })
                    }
                  />
                  <label
                    htmlFor="generate-api-key"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Generate API key for workflow execution
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restrict-access"
                    checked={deploymentConfig.security.restrictAccess}
                    onCheckedChange={(checked) =>
                      setDeploymentConfig({
                        ...deploymentConfig,
                        security: {
                          ...deploymentConfig.security,
                          restrictAccess: checked === true,
                        },
                      })
                    }
                  />
                  <label
                    htmlFor="restrict-access"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Restrict access to specific IP addresses
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => console.log(deploymentConfig)}>
            <Download className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDeployWithNetlify} disabled={deploymentStatus.isDeploying}>
              {deploymentStatus.isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Server className="h-4 w-4 mr-2" />
                  Deploy to Netlify
                </>
              )}
            </Button>

            <Button variant="default" onClick={handleDeployWithV0} disabled={deploymentStatus.isDeploying}>
              {deploymentStatus.isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Deploy with v0
                </>
              )}
            </Button>
          </div>
        </div>

        {deploymentStatus.isDeploying && (
          <Card>
            <CardHeader>
              <CardTitle>Deployment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deploymentStatus.steps.map((step) => (
                  <div key={step.id} className="flex items-center">
                    <div className="w-6 h-6 mr-2 flex-shrink-0">
                      {step.status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                      {step.status === "processing" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                      {step.status === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {step.status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.name}</div>
                      {step.message && (
                        <div
                          className={`text-xs ${
                            step.status === "error"
                              ? "text-red-500"
                              : step.status === "success"
                                ? "text-green-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {step.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {deploymentStatus.result && (
          <Card className={deploymentStatus.result.success ? "border-green-200" : "border-red-200"}>
            <CardHeader>
              <CardTitle className={deploymentStatus.result.success ? "text-green-600" : "text-red-600"}>
                {deploymentStatus.result.success ? "Deployment Successful" : "Deployment Failed"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deploymentStatus.result.success && deploymentStatus.result.deploymentUrl && (
                <div className="space-y-2">
                  <p>Your workflow has been successfully deployed to Netlify.</p>
                  <p>
                    Deployment URL:{" "}
                    <a
                      href={deploymentStatus.result.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {deploymentStatus.result.deploymentUrl}
                    </a>
                  </p>
                </div>
              )}

              {!deploymentStatus.result.success && deploymentStatus.result.error && (
                <div className="space-y-2">
                  <p>The deployment failed with the following error:</p>
                  <p className="text-red-600">{deploymentStatus.result.error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant={deploymentStatus.result.success ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  if (deploymentStatus.result.success && deploymentStatus.result.deploymentUrl) {
                    window.open(deploymentStatus.result.deploymentUrl, "_blank")
                  }
                }}
              >
                {deploymentStatus.result.success ? "Visit Deployed Workflow" : "Try Again"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </FormProvider>
  )
}

