"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus, Settings, Upload, Menu } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

export function DashboardHeader() {
  const [isDeploying, setIsDeploying] = useState(false)
  const { toggleSidebar } = useSidebar()

  const handleDeploy = () => {
    setIsDeploying(true)
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false)
    }, 2000)
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">n8n Workflow Dashboard</h1>
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-sm font-medium">
              Workflows
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Templates
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Monitoring
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>New Workflow</DropdownMenuItem>
              <DropdownMenuItem>From Template</DropdownMenuItem>
              <DropdownMenuItem>Import Existing</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" size="sm" onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? (
              <>Deploying to Netlify...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Deploy to Netlify
              </>
            )}
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

