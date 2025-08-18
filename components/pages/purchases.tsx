"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, CheckCircle, XCircle, Clock, Package } from "lucide-react"
import type { User } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { mockPurchases, type Purchase, type Asset } from "@/lib/mock-data"

interface PurchasesProps {
  user: User
}

export function Purchases({ user }: PurchasesProps) {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPurchase, setNewPurchase] = useState({
    assetName: "",
    category: "" as Asset["category"],
    quantity: 1,
    unitCost: 0,
    vendor: "",
    reason: "",
    expectedDelivery: "",
  })

  // Filter purchases based on user role and base
  const userPurchases =
    user.role === "admin" ? purchases : purchases.filter((purchase) => purchase.baseId === user.baseId)

  // Apply search and status filters
  const filteredPurchases = userPurchases.filter((purchase) => {
    const matchesSearch =
      purchase.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || purchase.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-secondary text-secondary-foreground"
      case "Pending":
        return "bg-yellow-500 text-white"
      case "Ordered":
        return "bg-blue-500 text-white"
      case "Delivered":
        return "bg-green-600 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4" />
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Ordered":
        return <Package className="h-4 w-4" />
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const handleCreatePurchase = () => {
    const purchase: Purchase = {
      id: `purchase${purchases.length + 1}`,
      assetName: newPurchase.assetName,
      category: newPurchase.category,
      quantity: newPurchase.quantity,
      unitCost: newPurchase.unitCost,
      totalCost: newPurchase.quantity * newPurchase.unitCost,
      vendor: newPurchase.vendor,
      requestedBy: user.username,
      baseId: user.baseId || "base1",
      baseName: user.baseName || "Fort Liberty",
      status: "Pending",
      requestDate: new Date().toISOString().split("T")[0],
      expectedDelivery: newPurchase.expectedDelivery,
    }

    setPurchases([...purchases, purchase])
    setNewPurchase({
      assetName: "",
      category: "" as Asset["category"],
      quantity: 1,
      unitCost: 0,
      vendor: "",
      reason: "",
      expectedDelivery: "",
    })
    setIsCreateDialogOpen(false)
  }

  const handleStatusChange = (purchaseId: string, newStatus: Purchase["status"]) => {
    setPurchases(
      purchases.map((purchase) => (purchase.id === purchaseId ? { ...purchase, status: newStatus } : purchase)),
    )
  }

  const canApprove = hasPermission(user, "approve_transfers") // Using same permission logic
  const canCreate = hasPermission(user, "create_purchase")

  // Calculate summary statistics
  const totalPending = filteredPurchases.filter((p) => p.status === "Pending").length
  const totalValue = filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0)
  const totalApproved = filteredPurchases.filter((p) => p.status === "Approved").length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Management</h1>
          <p className="text-muted-foreground">Manage asset purchase requests and approvals</p>
        </div>
        {canCreate && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Purchase Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Request</DialogTitle>
                <DialogDescription>Submit a new asset purchase request for approval</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name</Label>
                  <Input
                    id="assetName"
                    value={newPurchase.assetName}
                    onChange={(e) => setNewPurchase({ ...newPurchase, assetName: e.target.value })}
                    placeholder="Enter asset name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPurchase.category}
                    onValueChange={(value: Asset["category"]) => setNewPurchase({ ...newPurchase, category: value })}
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newPurchase.quantity}
                    onChange={(e) => setNewPurchase({ ...newPurchase, quantity: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Unit Cost ($)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPurchase.unitCost}
                    onChange={(e) =>
                      setNewPurchase({ ...newPurchase, unitCost: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={newPurchase.vendor}
                    onChange={(e) => setNewPurchase({ ...newPurchase, vendor: e.target.value })}
                    placeholder="Enter vendor name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={newPurchase.expectedDelivery}
                    onChange={(e) => setNewPurchase({ ...newPurchase, expectedDelivery: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="reason">Justification</Label>
                  <Textarea
                    id="reason"
                    value={newPurchase.reason}
                    onChange={(e) => setNewPurchase({ ...newPurchase, reason: e.target.value })}
                    placeholder="Provide justification for this purchase request"
                    rows={3}
                  />
                </div>
                <div className="col-span-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-lg font-bold text-primary">
                      ${(newPurchase.quantity * newPurchase.unitCost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePurchase}
                  disabled={!newPurchase.assetName || !newPurchase.category || !newPurchase.vendor}
                >
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalApproved}</div>
            <p className="text-xs text-muted-foreground">Ready to order</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Purchase Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by asset name or vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  {canApprove && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.assetName}</TableCell>
                    <TableCell>{purchase.category}</TableCell>
                    <TableCell>{purchase.quantity}</TableCell>
                    <TableCell>${purchase.unitCost.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">${purchase.totalCost.toLocaleString()}</TableCell>
                    <TableCell>{purchase.vendor}</TableCell>
                    <TableCell>{purchase.requestedBy}</TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${getStatusColor(purchase.status)}`}>
                        {getStatusIcon(purchase.status)}
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    {canApprove && (
                      <TableCell>
                        {purchase.status === "Pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              onClick={() => handleStatusChange(purchase.id, "Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/80"
                              onClick={() => handleStatusChange(purchase.id, "Pending")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {purchase.status === "Approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-transparent"
                            onClick={() => handleStatusChange(purchase.id, "Ordered")}
                          >
                            Mark Ordered
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredPurchases.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No purchase requests found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
