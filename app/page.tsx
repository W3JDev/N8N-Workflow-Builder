"use client"

import { FormProvider, useForm } from "react-hook-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { WorkflowDesigner } from "@/components/workflow-designer"
import { DeploymentPipeline } from "@/components/deployment-pipeline"
import { AIWorkflowAssistant } from "@/components/ai-workflow-assistant"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Home, Settings, FileCode, Upload, Workflow, Bot, Server } from "lucide-react"

// Convert to client component
export default function Dashboard() {
  // Add form methods
  const formMethods = useForm()

  return (
    <FormProvider {...formMethods}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="p-2">
              <h1 className="text-xl font-bold">n8n Dashboard</h1>
              <p className="text-xs text-muted-foreground">Powered by Bolt.diy</p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive>
                    <a href="#">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Workflow className="h-4 w-4" />
                      <span>Workflows</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <FileCode className="h-4 w-4" />
                      <span>Templates</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Bot className="h-4 w-4" />
                      <span>AI Assistant</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Server className="h-4 w-4" />
                      <span>Deployments</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <DashboardHeader />
          <main className="container mx-auto p-4 md:p-6 space-y-6">
            <Tabs defaultValue="designer">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="designer">
                  <Workflow className="h-4 w-4 mr-2" />
                  Workflow Designer
                </TabsTrigger>
                <TabsTrigger value="deployment">
                  <Upload className="h-4 w-4 mr-2" />
                  Deployment Pipeline
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              <TabsContent value="designer" className="mt-6">
                <WorkflowDesigner />
              </TabsContent>

              <TabsContent value="deployment" className="mt-6">
                <DeploymentPipeline
                  workflow={{
                    name: "Example Workflow",
                    active: false,
                    nodes: [],
                    connections: {},
                  }}
                />
              </TabsContent>

              <TabsContent value="ai" className="mt-6">
                <AIWorkflowAssistant />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </FormProvider>
  )
}

