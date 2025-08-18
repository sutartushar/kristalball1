"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, ArrowRightLeft, ClipboardList, TrendingUp, AlertTriangle } from "lucide-react"
import type { User } from "@/lib/auth"
import { mockAssets, mockPurchases, mockTransfers, mockAssignments } from "@/lib/mock-data"

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  // Filter data based on user permissions and base
  const userAssets = user.role === "admin" ? mockAssets : mockAssets.filter((asset) => asset.baseId === user.baseId)

  const userPurchases =
    user.role === "admin" ? mockPurchases : mockPurchases.filter((purchase) => purchase.baseId === user.baseId)

  const userTransfers =
    user.role === "admin"
      ? mockTransfers
      : mockTransfers.filter((transfer) => transfer.fromBaseId === user.baseId || transfer.toBaseId === user.baseId)

  const userAssignments =
    user.role === "admin" ? mockAssignments : mockAssignments.filter((assignment) => assignment.baseId === user.baseId)

  // Calculate metrics
  const totalAssets = userAssets.length
  const activeAssets = userAssets.filter((asset) => asset.status === "Active").length
  const pendingPurchases = userPurchases.filter((purchase) => purchase.status === "Pending").length
  const pendingTransfers = userTransfers.filter((transfer) => transfer.status === "Pending").length
  const activeAssignments = userAssignments.filter((assignment) => assignment.status === "Active").length
  const maintenanceAssets = userAssets.filter((asset) => asset.status === "Maintenance").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Approved":
      case "Delivered":
        return "bg-secondary text-secondary-foreground"
      case "Pending":
        return "bg-yellow-500 text-white"
      case "Maintenance":
      case "In Transit":
        return "bg-blue-500 text-white"
      case "Rejected":
      case "Retired":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          {user.role === "admin" ? "System-wide overview" : `Overview for ${user.baseName}`}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">{activeAssets} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingPurchases}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingTransfers}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeAssignments}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              System Alerts
            </CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenanceAssets > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Assets in Maintenance</p>
                  <p className="text-xs text-muted-foreground">{maintenanceAssets} assets need attention</p>
                </div>
                <Badge variant="outline" className="bg-yellow-500 text-white">
                  {maintenanceAssets}
                </Badge>
              </div>
            )}
            {pendingPurchases > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Pending Purchase Approvals</p>
                  <p className="text-xs text-muted-foreground">Purchases awaiting review</p>
                </div>
                <Badge variant="outline" className="bg-blue-500 text-white">
                  {pendingPurchases}
                </Badge>
              </div>
            )}
            {pendingTransfers > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Pending Transfers</p>
                  <p className="text-xs text-muted-foreground">Transfer requests awaiting approval</p>
                </div>
                <Badge variant="outline" className="bg-purple-500 text-white">
                  {pendingTransfers}
                </Badge>
              </div>
            )}
            {maintenanceAssets === 0 && pendingPurchases === 0 && pendingTransfers === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No alerts at this time</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userTransfers.slice(0, 3).map((transfer) => (
              <div key={transfer.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{transfer.assetName}</p>
                  <p className="text-xs text-muted-foreground">
                    {transfer.fromBaseName} → {transfer.toBaseName}
                  </p>
                </div>
                <Badge className={getStatusColor(transfer.status)}>{transfer.status}</Badge>
              </div>
            ))}
            {userAssignments.slice(0, 2).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{assignment.assetName}</p>
                  <p className="text-xs text-muted-foreground">Assigned to {assignment.assignedTo}</p>
                </div>
                <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
              </div>
            ))}
            {userTransfers.length === 0 && userAssignments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
