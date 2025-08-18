export type UserRole = "admin" | "base_commander" | "logistics_officer"

export interface User {
  id: string
  username: string
  role: UserRole
  baseId?: string
  baseName?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Mock users for demonstration
const mockUsers: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin123",
    user: {
      id: "1",
      username: "admin",
      role: "admin",
    },
  },
  commander1: {
    password: "cmd123",
    user: {
      id: "2",
      username: "commander1",
      role: "base_commander",
      baseId: "base1",
      baseName: "Fort Liberty",
    },
  },
  logistics1: {
    password: "log123",
    user: {
      id: "3",
      username: "logistics1",
      role: "logistics_officer",
      baseId: "base1",
      baseName: "Fort Liberty",
    },
  },
}

export const authenticate = (username: string, password: string): User | null => {
  console.log("[v0] Authenticate called with:", { username, password })

  const trimmedUsername = username.trim()
  const trimmedPassword = password.trim()

  const userRecord = mockUsers[trimmedUsername]
  console.log("[v0] User record found:", userRecord)

  if (userRecord && userRecord.password === trimmedPassword) {
    console.log("[v0] Authentication successful for:", trimmedUsername)
    return userRecord.user
  }

  console.log("[v0] Authentication failed for:", trimmedUsername)
  return null
}

export const hasPermission = (user: User | null, action: string): boolean => {
  if (!user) return false

  switch (action) {
    case "view_all_bases":
    case "manage_users":
    case "system_admin":
      return user.role === "admin"

    case "approve_transfers":
    case "manage_base_assets":
      return user.role === "admin" || user.role === "base_commander"

    case "create_purchase":
    case "request_transfer":
    case "view_assignments":
      return true // All authenticated users

    default:
      return false
  }
}
