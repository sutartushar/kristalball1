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
import { Plus, Search, Filter, ArrowRightLeft, CheckCircle, XCircle, Clock, Truck } from "lucide-react"
import type { User } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { mockTransfers, mockAssets, mockBases, type Transfer } from "@/lib/mock-data"

interface TransfersProps {
  user: User
}

export function Transfers({ user }: TransfersProps) {
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTransfer, setNewTransfer] = useState({
    assetId: "",
    toBaseId: "",
    reason: "",
    urgency: "Normal" as "Low" | "Normal" | "High" | "Critical",
  })

  // Filter transfers based on user role and base
  const userTransfers =
    user.role === "admin"
      ? transfers
      : transfers.filter((transfer) => transfer.fromBaseId === user.baseId || transfer.toBaseId === user.baseId)

  // Get available assets for transfer (only from user's base if not admin)
  const availableAssets =
    user.role === "admin"
      ? mockAssets.filter((asset) => asset.status === "Active")
      : mockAssets.filter((asset) => asset.baseId === user.baseId && asset.status === "Active")

  // Get available destination bases (exclude user's own base)
  const availableBases = mockBases.filter((base) => base.id !== user.baseId)

  // Apply search and status filters
  const filteredTransfers = userTransfers.filter((transfer) => {
    const matchesSearch =
      transfer.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromBaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toBaseName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transfer.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-secondary text-secondary-foreground"
      case "Pending":
        return "bg-yellow-500 text-white"
      case "In Transit":
        return "bg-blue-500 text-white"
      case "Completed":
        return "bg-green-600 text-white"
      case "Rejected":
        return "bg-destructive text-destructive-foreground"
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
      case "In Transit":
        return <Truck className="h-4 w-4" />
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <ArrowRightLeft className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-600 text-white"
      case "High":
        return "bg-orange-500 text-white"
      case "Normal":
        return "bg-blue-500 text-white"
      case "Low":
        return "bg-gray-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleCreateTransfer = () => {
    const selectedAsset = availableAssets.find((asset) => asset.id === newTransfer.assetId)
    const selectedBase = availableBases.find((base) => base.id === newTransfer.toBaseId)

    if (!selectedAsset || !selectedBase) return

    const transfer: Transfer = {
      id: `transfer${transfers.length + 1}`,
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      fromBaseId: user.baseId || "base1",
      fromBaseName: user.baseName || "Fort Liberty",
      toBaseId: selectedBase.id,
      toBaseName: selectedBase.name,
      requestedBy: user.username,
      status: "Pending",
      requestDate: new Date().toISOString().split("T")[0],
      reason: newTransfer.reason,
    }

    setTransfers([...transfers, transfer])
    setNewTransfer({
      assetId: "",
      toBaseId: "",
      reason: "",
      urgency: "Normal",
    })
    setIsCreateDialogOpen(false)
  }

  const handleStatusChange = (transferId: string, newStatus: Transfer["status"], approvedBy?: string) => {
    setTransfers(
      transfers.map((transfer) =>
        transfer.id === transferId
          ? {
              ...transfer,
              status: newStatus,
              approvedBy: approvedBy || transfer.approvedBy,
              transferDate: newStatus === "Approved" ? new Date().toISOString().split("T")[0] : transfer.transferDate,
            }
          : transfer,
      ),
    )
  }

  const canApprove = hasPermission(user, "approve_transfers")
  const canCreate = hasPermission(user, "request_transfer")

  // Calculate summary statistics
  const totalPending = filteredTransfers.filter((t) => t.status === "Pending").length
  const totalInTransit = filteredTransfers.filter((t) => t.status === "In Transit").length
  const totalCompleted = filteredTransfers.filter((t) => t.status === "Completed").length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transfer Management</h1>
          <p className="text-muted-foreground">Manage asset transfers between military bases</p>
        </div>
        {canCreate && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Transfer Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Transfer Request</DialogTitle>
                <DialogDescription>Request to transfer an asset to another military base</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetId">Asset to Transfer</Label>
                    <Select
                      value={newTransfer.assetId}
                      onValueChange={(value) => setNewTransfer({ ...newTransfer, assetId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAssets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.serialNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toBaseId">Destination Base</Label>
                    <Select
                      value={newTransfer.toBaseId}
                      onValueChange={(value) => setNewTransfer({ ...newTransfer, toBaseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBases.map((base) => (
                          <SelectItem key={base.id} value={base.id}>
                            {base.name} - {base.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Priority Level</Label>
                  <Select
                    value={newTransfer.urgency}
                    onValueChange={(value: "Low" | "Normal" | "High" | "Critical") =>
                      setNewTransfer({ ...newTransfer, urgency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low Priority</SelectItem>
                      <SelectItem value="Normal">Normal Priority</SelectItem>
                      <SelectItem value="High">High Priority</SelectItem>
                      <SelectItem value="Critical">Critical Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Transfer Justification</Label>
                  <Textarea
                    id="reason"
                    value={newTransfer.reason}
                    onChange={(e) => setNewTransfer({ ...newTransfer, reason: e.target.value })}
                    placeholder="Provide detailed justification for this transfer request"
                    rows={4}
                  />
                </div>
                {newTransfer.assetId && newTransfer.toBaseId && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Transfer Summary</h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Asset:</strong> {availableAssets.find((a) => a.id === newTransfer.assetId)?.name}
                      </p>
                      <p>
                        <strong>From:</strong> {user.baseName}
                      </p>
                      <p>
                        <strong>To:</strong> {availableBases.find((b) => b.id === newTransfer.toBaseId)?.name}
                      </p>
                      <p>
                        <strong>Priority:</strong>{" "}
                        <Badge className={getUrgencyColor(newTransfer.urgency)}>{newTransfer.urgency}</Badge>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTransfer}
                  disabled={!newTransfer.assetId || !newTransfer.toBaseId || !newTransfer.reason}
                >
                  Submit Request
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
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalInTransit}</div>
            <p className="text-xs text-muted-foreground">Currently moving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground">Successfully transferred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{filteredTransfers.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by asset name or base..."
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
                <SelectItem value="in transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>From Base</TableHead>
                  <TableHead>To Base</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  {canApprove && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.assetName}</TableCell>
                    <TableCell>{transfer.fromBaseName}</TableCell>
                    <TableCell>{transfer.toBaseName}</TableCell>
                    <TableCell>{transfer.requestedBy}</TableCell>
                    <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${getStatusColor(transfer.status)}`}>
                        {getStatusIcon(transfer.status)}
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={transfer.reason}>
                      {transfer.reason}
                    </TableCell>
                    {canApprove && (
                      <TableCell>
                        {transfer.status === "Pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              onClick={() => handleStatusChange(transfer.id, "Approved", user.username)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/80"
                              onClick={() => handleStatusChange(transfer.id, "Rejected", user.username)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {transfer.status === "Approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-transparent"
                            onClick={() => handleStatusChange(transfer.id, "In Transit")}
                          >
                            Mark In Transit
                          </Button>
                        )}
                        {transfer.status === "In Transit" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleStatusChange(transfer.id, "Completed")}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTransfers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transfer requests found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
