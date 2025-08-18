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
import { Plus, Search, Filter, Package, Trash2, Eye } from "lucide-react"
import type { User } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { mockAssets, type Asset } from "@/lib/mock-data"

interface AssetsProps {
  user: User
}

export function Assets({ user }: AssetsProps) {
  const [assets, setAssets] = useState<Asset[]>(mockAssets)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "" as Asset["category"],
    serialNumber: "",
    condition: "Excellent" as Asset["condition"],
    cost: 0,
    assignedTo: "",
  })

  // Filter assets based on user role and base
  const userAssets = user.role === "admin" ? assets : assets.filter((asset) => asset.baseId === user.baseId)

  // Apply search and filters
  const filteredAssets = userAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
    const matchesStatus = statusFilter === "all" || asset.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-secondary text-secondary-foreground"
      case "Maintenance":
        return "bg-yellow-500 text-white"
      case "Retired":
        return "bg-gray-500 text-white"
      case "In Transit":
        return "bg-blue-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Excellent":
        return "bg-green-600 text-white"
      case "Good":
        return "bg-blue-500 text-white"
      case "Fair":
        return "bg-yellow-500 text-white"
      case "Poor":
        return "bg-red-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleCreateAsset = () => {
    const asset: Asset = {
      id: `asset${assets.length + 1}`,
      name: newAsset.name,
      category: newAsset.category,
      serialNumber: newAsset.serialNumber,
      baseId: user.baseId || "base1",
      baseName: user.baseName || "Fort Liberty",
      status: "Active",
      condition: newAsset.condition,
      purchaseDate: new Date().toISOString().split("T")[0],
      cost: newAsset.cost,
      assignedTo: newAsset.assignedTo || undefined,
    }

    setAssets([...assets, asset])
    setNewAsset({
      name: "",
      category: "" as Asset["category"],
      serialNumber: "",
      condition: "Excellent",
      cost: 0,
      assignedTo: "",
    })
    setIsCreateDialogOpen(false)
  }

  const handleStatusChange = (assetId: string, newStatus: Asset["status"]) => {
    setAssets(assets.map((asset) => (asset.id === assetId ? { ...asset, status: newStatus } : asset)))
  }

  const handleDeleteAsset = (assetId: string) => {
    setAssets(assets.filter((asset) => asset.id !== assetId))
  }

  const canManage = hasPermission(user, "manage_base_assets")
  const canView = true // All users can view assets

  // Calculate summary statistics
  const totalAssets = filteredAssets.length
  const activeAssets = filteredAssets.filter((asset) => asset.status === "Active").length
  const maintenanceAssets = filteredAssets.filter((asset) => asset.status === "Maintenance").length
  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.cost, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
          <p className="text-muted-foreground">
            {user.role === "admin" ? "System-wide asset inventory" : `Asset inventory for ${user.baseName}`}
          </p>
        </div>
        {canManage && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>Register a new asset in the inventory system</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name</Label>
                  <Input
                    id="assetName"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    placeholder="Enter asset name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newAsset.category}
                    onValueChange={(value: Asset["category"]) => setNewAsset({ ...newAsset, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Weapon">Weapon</SelectItem>
                      <SelectItem value="Communication">Communication</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    placeholder="Enter serial number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={newAsset.condition}
                    onValueChange={(value: Asset["condition"]) => setNewAsset({ ...newAsset, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Purchase Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newAsset.cost}
                    onChange={(e) => setNewAsset({ ...newAsset, cost: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
                  <Input
                    id="assignedTo"
                    value={newAsset.assignedTo}
                    onChange={(e) => setNewAsset({ ...newAsset, assignedTo: e.target.value })}
                    placeholder="Personnel or unit"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAsset}
                  disabled={!newAsset.name || !newAsset.category || !newAsset.serialNumber}
                >
                  Add Asset
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{activeAssets}</div>
            <p className="text-xs text-muted-foreground">Operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceAssets}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Asset value</p>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asset Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, serial number, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Weapon">Weapon</SelectItem>
                <SelectItem value="Communication">Communication</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
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
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="in transit">In Transit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getConditionColor(asset.condition)}>{asset.condition}</Badge>
                    </TableCell>
                    <TableCell>{asset.assignedTo || "Unassigned"}</TableCell>
                    <TableCell>${asset.cost.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={() => {
                            setSelectedAsset(asset)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {canManage && (
                          <>
                            {asset.status === "Active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs bg-yellow-500 text-white hover:bg-yellow-600"
                                onClick={() => handleStatusChange(asset.id, "Maintenance")}
                              >
                                Maintenance
                              </Button>
                            )}
                            {asset.status === "Maintenance" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                onClick={() => handleStatusChange(asset.id, "Active")}
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/80"
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAssets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No assets found matching your criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Asset Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
            <DialogDescription>Complete information for {selectedAsset?.name}</DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Asset Name</Label>
                  <p className="text-sm font-medium">{selectedAsset.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="text-sm">{selectedAsset.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Serial Number</Label>
                  <p className="text-sm font-mono">{selectedAsset.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Base Location</Label>
                  <p className="text-sm">{selectedAsset.baseName}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedAsset.status)}>{selectedAsset.status}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Condition</Label>
                  <div className="mt-1">
                    <Badge className={getConditionColor(selectedAsset.condition)}>{selectedAsset.condition}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Purchase Date</Label>
                  <p className="text-sm">{new Date(selectedAsset.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Purchase Cost</Label>
                  <p className="text-sm font-medium">${selectedAsset.cost.toLocaleString()}</p>
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-muted-foreground">Currently Assigned To</Label>
                <p className="text-sm">{selectedAsset.assignedTo || "Unassigned"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
