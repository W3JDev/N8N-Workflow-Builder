"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Copy, ArrowRight } from "lucide-react"

// Mock template data
const templates = [
  {
    id: "template-1",
    name: "Netlify Form to Email",
    description: "Send form submissions to email",
    category: "Netlify",
    tags: ["form", "email", "notification"],
    popularity: 4.8,
  },
  {
    id: "template-2",
    name: "Scheduled Content Deployment",
    description: "Deploy content on a schedule",
    category: "Netlify",
    tags: ["schedule", "deployment", "content"],
    popularity: 4.5,
  },
  {
    id: "template-3",
    name: "API Data Sync",
    description: "Sync data from external API to Netlify",
    category: "Integration",
    tags: ["api", "sync", "data"],
    popularity: 4.2,
  },
  {
    id: "template-4",
    name: "Image Processing Pipeline",
    description: "Process and optimize images for Netlify",
    category: "Media",
    tags: ["images", "optimization", "media"],
    popularity: 4.7,
  },
]

export function TemplateLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", ...new Set(templates.map((t) => t.category))]

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="flex-shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded-md p-3 hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{template.name}</h3>
              <Badge variant="outline">{template.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">No templates found matching your criteria.</div>
        )}
      </div>
    </div>
  )
}

