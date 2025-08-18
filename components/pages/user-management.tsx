"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Users, Shield, Trash2 } from "lucide-react"
import type { User as AuthUser, UserRole } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { mockBases } from "@/lib/mock-data"

interface UserManagementProps {
  user: AuthUser
}

interface SystemUser {
  id: string
  username: string
  role: UserRole
  baseId?: string
  baseName?: string
  email: string
  status: "Active" | "Inactive" | "Suspended"
  lastLogin: string
  createdDate: string
}

export function UserManagement({ user }: UserManagementProps) {
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: "1",
      username: "admin",
      role: "admin",
      email: "admin@military.gov",
      status: "Active",
      lastLogin: "2024-12-18",
      createdDate: "2024-01-01",
    },
    {
      id: "2",
      username: "commander1",
      role: "base_commander",
      baseId: "base1",
      baseName: "Fort Liberty",
      email: "commander1@military.gov",
      status: "Active",
      lastLogin: "2024-12-17",
      createdDate: "2024-02-15",
    },
    {
      id: "3",
      username: "logistics1",
      role: "logistics_officer",
      baseId: "base1",
      baseName: "Fort Liberty",
      email: "logistics1@military.gov",
      status: "Active",
      lastLogin: "2024-12-18",
      createdDate: "2024-03-10",
    },
    {
      id: "4",
      username: "commander2",
      role: "base_commander",
      baseId: "base2",
      baseName: "Camp Pendleton",
      email: "commander2@military.gov",
      status: "Active",
      lastLogin: "2024-12-16",
      createdDate: "2024-02-20",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "" as UserRole,
    baseId: "",
    password: "",
  })

  // Apply search and filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.baseName && u.baseName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesStatus = statusFilter === "all" || u.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-600 text-white"
      case "base_commander":
        return "bg-blue-600 text-white"
      case "logistics_officer":
        return "bg-green-600 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-secondary text-secondary-foreground"
      case "Inactive":
        return "bg-gray-500 text-white"
      case "Suspended":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "System Administrator"
      case "base_commander":
        return "Base Commander"
      case "logistics_officer":
        return "Logistics Officer"
      default:
        return role
    }
  }

  const handleCreateUser = () => {
    const selectedBase = mockBases.find((base) => base.id === newUser.baseId)
    const systemUser: SystemUser = {
      id: `user${users.length + 1}`,
      username: newUser.username,
      role: newUser.role,
      baseId: newUser.role !== "admin" ? newUser.baseId : undefined,
      baseName: newUser.role !== "admin" ? selectedBase?.name : undefined,
      email: newUser.email,
      status: "Active",
      lastLogin: "Never",
      createdDate: new Date().toISOString().split("T")[0],
    }

    setUsers([...users, systemUser])
    setNewUser({
      username: "",
      email: "",
      role: "" as UserRole,
      baseId: "",
      password: "",
    })
    setIsCreateDialogOpen(false)
  }

  const handleStatusChange = (userId: string, newStatus: SystemUser["status"]) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)))
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  const canManageUsers = hasPermission(user, "manage_users")

  if (!canManageUsers) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
              <p className="text-muted-foreground">You don't have permission to manage users.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate summary statistics
  const totalUsers = filteredUsers.length
  const activeUsers = filteredUsers.filter((u) => u.status === "Active").length
  const adminUsers = filteredUsers.filter((u) => u.role === "admin").length
  const commanderUsers = filteredUsers.filter((u) => u.role === "base_commander").length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the military asset management system</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">System Administrator</SelectItem>
                    <SelectItem value="base_commander">Base Commander</SelectItem>
                    <SelectItem value="logistics_officer">Logistics Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUser.role && newUser.role !== "admin" && (
                <div className="space-y-2">
                  <Label htmlFor="baseId">Assigned Base</Label>
                  <Select value={newUser.baseId} onValueChange={(value) => setNewUser({ ...newUser, baseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select base" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBases.map((base) => (
                        <SelectItem key={base.id} value={base.id}>
                          {base.name} - {base.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter temporary password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={
                  !newUser.username ||
                  !newUser.email ||
                  !newUser.role ||
                  !newUser.password ||
                  (newUser.role !== "admin" && !newUser.baseId)
                }
              >
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">System users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">System admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commanders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{commanderUsers}</div>
            <p className="text-xs text-muted-foreground">Base commanders</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by username, email, or base..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="base_commander">Base Commander</SelectItem>
                <SelectItem value="logistics_officer">Logistics Officer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Base Assignment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((systemUser) => (
                  <TableRow key={systemUser.id}>
                    <TableCell className="font-medium">{systemUser.username}</TableCell>
                    <TableCell>{systemUser.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(systemUser.role)}>{getRoleDisplayName(systemUser.role)}</Badge>
                    </TableCell>
                    <TableCell>{systemUser.baseName || "System-wide"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(systemUser.status)}>{systemUser.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {systemUser.lastLogin === "Never" ? "Never" : new Date(systemUser.lastLogin).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {systemUser.status === "Active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-yellow-500 text-white hover:bg-yellow-600"
                            onClick={() => handleStatusChange(systemUser.id, "Suspended")}
                          >
                            Suspend
                          </Button>
                        )}
                        {systemUser.status === "Suspended" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            onClick={() => handleStatusChange(systemUser.id, "Active")}
                          >
                            Activate
                          </Button>
                        )}
                        {systemUser.id !== user.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/80"
                            onClick={() => handleDeleteUser(systemUser.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No users found matching your criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
