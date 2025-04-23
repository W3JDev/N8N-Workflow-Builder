/**
 * Service for handling security-related functionality
 */

import type { IWorkflowData } from "../n8n-schema/workflow-schema"

export interface Credential {
  id: string
  name: string
  type: string
  data: Record<string, any>
  nodesAccess: Array<{
    nodeType: string
  }>
}

export class SecurityService {
  private encryptionKey: string
  private credentialsStore: Map<string, Credential>

  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey
    this.credentialsStore = new Map()
  }

  /**
   * Encrypts sensitive data
   */
  encryptData(data: any): string {
    // In a real implementation, this would use proper encryption
    // For this example, we'll just do a simple base64 encoding
    return Buffer.from(JSON.stringify(data)).toString("base64")
  }

  /**
   * Decrypts sensitive data
   */
  decryptData(encryptedData: string): any {
    // In a real implementation, this would use proper decryption
    // For this example, we'll just do a simple base64 decoding
    return JSON.parse(Buffer.from(encryptedData, "base64").toString())
  }

  /**
   * Stores credentials securely
   */
  async storeCredential(credential: Credential): Promise<string> {
    // Encrypt the credential data
    const encryptedData = this.encryptData(credential.data)

    // Create a new credential object with encrypted data
    const secureCredential: Credential = {
      ...credential,
      data: { encrypted: encryptedData },
    }

    // Store the credential
    this.credentialsStore.set(credential.id, secureCredential)

    return credential.id
  }

  /**
   * Retrieves credentials
   */
  async getCredential(id: string): Promise<Credential | null> {
    const credential = this.credentialsStore.get(id)

    if (!credential) {
      return null
    }

    // Decrypt the credential data
    const decryptedData = this.decryptData(credential.data.encrypted)

    // Return the credential with decrypted data
    return {
      ...credential,
      data: decryptedData,
    }
  }

  /**
   * Sanitizes a workflow by removing sensitive data
   */
  sanitizeWorkflow(workflow: IWorkflowData): IWorkflowData {
    // Create a deep copy of the workflow
    const sanitizedWorkflow = JSON.parse(JSON.stringify(workflow))

    // Remove credentials from nodes
    sanitizedWorkflow.nodes = sanitizedWorkflow.nodes.map((node: any) => {
      if (node.credentials) {
        // Replace credential data with just the IDs
        const sanitizedCredentials: Record<string, { id: string; name: string }> = {}

        for (const [name, cred] of Object.entries(node.credentials)) {
          if (typeof cred === "object" && cred !== null && "id" in cred && "name" in cred) {
            sanitizedCredentials[name] = {
              id: (cred as any).id,
              name: (cred as any).name,
            }
          }
        }

        return {
          ...node,
          credentials: sanitizedCredentials,
        }
      }

      return node
    })

    return sanitizedWorkflow
  }

  /**
   * Validates user permissions for a workflow
   */
  async validatePermissions(
    userId: string,
    workflowId: string,
    action: "view" | "edit" | "execute" | "delete",
  ): Promise<boolean> {
    // In a real implementation, this would:
    // 1. Check the user's permissions for the workflow
    // 2. Return whether the action is allowed

    // For this example, we'll just return true
    return true
  }

  /**
   * Generates a secure API key for workflow execution
   */
  generateApiKey(workflowId: string, expiresInSeconds = 3600): string {
    // In a real implementation, this would generate a proper JWT or similar token
    // For this example, we'll just create a simple token
    const payload = {
      workflowId,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    }

    return this.encryptData(payload)
  }

  /**
   * Validates an API key
   */
  validateApiKey(apiKey: string): { valid: boolean; workflowId?: string } {
    try {
      // Decrypt the API key
      const payload = this.decryptData(apiKey)

      // Check if the key has expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false }
      }

      return {
        valid: true,
        workflowId: payload.workflowId,
      }
    } catch (error) {
      return { valid: false }
    }
  }
}

