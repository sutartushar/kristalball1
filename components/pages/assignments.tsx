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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, ClipboardList, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { User as AuthUser } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { mockAssignments, mockAssets, type Assignment } from "@/lib/mock-data"

interface AssignmentsProps {
  user: AuthUser
}

interface Expenditure {
  id: string
  assetId: string
  assetName: string
  type: "Maintenance" | "Fuel" | "Repair" | "Upgrade" | "Training"
  amount: number
  description: string
  date: string
  approvedBy: string
  baseId: string
  baseName: string
}

export function Assignments({ user }: AssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [expenditures, setExpenditures] = useState<Expenditure[]>([
    {
      id: "exp1",
      assetId: "asset1",
      assetName: "M1A2 Abrams Tank",
      type: "Maintenance",
      amount: 15000,
      description: "Routine maintenance and parts replacement",
      date: "2024-12-01",
      approvedBy: "commander1",
      baseId: "base1",
      baseName: "Fort Liberty",
    },
    {
      id: "exp2",
      assetId: "asset2",
      assetName: "Night Vision Goggles",
      type: "Repair",
      amount: 450,
      description: "Lens replacement and calibration",
      date: "2024-12-10",
      approvedBy: "logistics1",
      baseId: "base1",
      baseName: "Fort Liberty",
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isExpenditureDialogOpen, setIsExpenditureDialogOpen] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    assetId: "",
    assignedTo: "",
    purpose: "",
    returnDate: "",
  })
  const [newExpenditure, setNewExpenditure] = useState({
    assetId: "",
    type: "" as Expenditure["type"],
    amount: 0,
    description: "",
  })

  // Filter assignments based on user role and base
  const userAssignments =
    user.role === "admin" ? assignments : assignments.filter((assignment) => assignment.baseId === user.baseId)

  const userExpenditures =
    user.role === "admin" ? expenditures : expenditures.filter((expenditure) => expenditure.baseId === user.baseId)

  // Get available assets for assignment (only from user's base if not admin)
  const availableAssets =
    user.role === "admin"
      ? mockAssets.filter((asset) => asset.status === "Active" && !asset.assignedTo)
      : mockAssets.filter((asset) => asset.baseId === user.baseId && asset.status === "Active" && !asset.assignedTo)

  // Get all assets for expenditure tracking
  const allUserAssets = user.role === "admin" ? mockAssets : mockAssets.filter((asset) => asset.baseId === user.baseId)

  // Apply search and status filters for assignments
  const filteredAssignments = userAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || assignment.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-secondary text-secondary-foreground"
      case "Returned":
        return "bg-green-600 text-white"
      case "Overdue":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Clock className="h-4 w-4" />
      case "Returned":
        return <CheckCircle className="h-4 w-4" />
      case "Overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getExpenditureTypeColor = (type: string) => {
    switch (type) {
      case "Maintenance":
        return "bg-blue-500 text-white"
      case "Fuel":
        return "bg-yellow-600 text-white"
      case "Repair":
        return "bg-red-500 text-white"
      case "Upgrade":
        return "bg-purple-500 text-white"
      case "Training":
        return "bg-green-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleCreateAssignment = () => {
    const selectedAsset = availableAssets.find((asset) => asset.id === newAssignment.assetId)
    if (!selectedAsset) return

    const assignment: Assignment = {
      id: `assignment${assignments.length + 1}`,
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      assignedTo: newAssignment.assignedTo,
      assignedBy: user.username,
      baseId: user.baseId || "base1",
      baseName: user.baseName || "Fort Liberty",
      assignmentDate: new Date().toISOString().split("T")[0],
      returnDate: newAssignment.returnDate,
      status: "Active",
      purpose: newAssignment.purpose,
    }

    setAssignments([...assignments, assignment])
    setNewAssignment({
      assetId: "",
      assignedTo: "",
      purpose: "",
      returnDate: "",
    })
    setIsAssignDialogOpen(false)
  }

  const handleCreateExpenditure = () => {
    const selectedAsset = allUserAssets.find((asset) => asset.id === newExpenditure.assetId)
    if (!selectedAsset) return

    const expenditure: Expenditure = {
      id: `exp${expenditures.length + 1}`,
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      type: newExpenditure.type,
      amount: newExpenditure.amount,
      description: newExpenditure.description,
      date: new Date().toISOString().split("T")[0],
      approvedBy: user.username,
      baseId: user.baseId || "base1",
      baseName: user.baseName || "Fort Liberty",
    }

    setExpenditures([...expenditures, expenditure])
    setNewExpenditure({
      assetId: "",
      type: "" as Expenditure["type"],
      amount: 0,
      description: "",
    })
    setIsExpenditureDialogOpen(false)
  }

  const handleReturnAsset = (assignmentId: string) => {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, status: "Returned", returnDate: new Date().toISOString().split("T")[0] }
          : assignment,
      ),
    )
  }

  const canAssign = hasPermission(user, "view_assignments")
  const canManageExpenditures = hasPermission(user, "manage_base_assets")

  // Calculate summary statistics
  const totalActive = filteredAssignments.filter((a) => a.status === "Active").length
  const totalOverdue = filteredAssignments.filter((a) => {
    if (a.status !== "Active" || !a.returnDate) return false
    return new Date(a.returnDate) < new Date()
  }).length
  const totalExpenditures = userExpenditures.reduce((sum, exp) => sum + exp.amount, 0)
  const monthlyExpenditures = userExpenditures
    .filter((exp) => {
      const expDate = new Date(exp.date)
      const now = new Date()
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignments & Expenditures</h1>
          <p className="text-muted-foreground">Manage asset assignments and track operational expenditures</p>
        </div>
        <div className="flex gap-2">
          {canAssign && (
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Asset Assignment</DialogTitle>
                  <DialogDescription>Assign an asset to personnel or unit</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetId">Asset</Label>
                      <Select
                        value={newAssignment.assetId}
                        onValueChange={(value) => setNewAssignment({ ...newAssignment, assetId: value })}
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
                      <Label htmlFor="assignedTo">Assign To</Label>
                      <Input
                        id="assignedTo"
                        value={newAssignment.assignedTo}
                        onChange={(e) => setNewAssignment({ ...newAssignment, assignedTo: e.target.value })}
                        placeholder="Personnel name or unit"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnDate">Expected Return Date</Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={newAssignment.returnDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, returnDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      id="purpose"
                      value={newAssignment.purpose}
                      onChange={(e) => setNewAssignment({ ...newAssignment, purpose: e.target.value })}
                      placeholder="Purpose of assignment"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAssignment}
                    disabled={!newAssignment.assetId || !newAssignment.assignedTo || !newAssignment.purpose}
                  >
                    Create Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {canManageExpenditures && (
            <Dialog open={isExpenditureDialogOpen} onOpenChange={setIsExpenditureDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <DollarSign className="h-4 w-4" />
                  Add Expenditure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Expenditure</DialogTitle>
                  <DialogDescription>Record operational expenditure for an asset</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expenditureAssetId">Asset</Label>
                      <Select
                        value={newExpenditure.assetId}
                        onValueChange={(value) => setNewExpenditure({ ...newExpenditure, assetId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {allUserAssets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.name} ({asset.serialNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expenditureType">Type</Label>
                      <Select
                        value={newExpenditure.type}
                        onValueChange={(value: Expenditure["type"]) =>
                          setNewExpenditure({ ...newExpenditure, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Fuel">Fuel</SelectItem>
                          <SelectItem value="Repair">Repair</SelectItem>
                          <SelectItem value="Upgrade">Upgrade</SelectItem>
                          <SelectItem value="Training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newExpenditure.amount}
                      onChange={(e) =>
                        setNewExpenditure({ ...newExpenditure, amount: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expenditureDescription">Description</Label>
                    <Textarea
                      id="expenditureDescription"
                      value={newExpenditure.description}
                      onChange={(e) => setNewExpenditure({ ...newExpenditure, description: e.target.value })}
                      placeholder="Detailed description of expenditure"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsExpenditureDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateExpenditure}
                    disabled={!newExpenditure.assetId || !newExpenditure.type || !newExpenditure.amount}
                  >
                    Record Expenditure
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalActive}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalOverdue}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${monthlyExpenditures.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalExpenditures.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Assignments and Expenditures */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="expenditures" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Expenditures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by asset or assignee..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Assignment Date</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.assetName}</TableCell>
                        <TableCell>{assignment.assignedTo}</TableCell>
                        <TableCell>{new Date(assignment.assignmentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {assignment.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={assignment.purpose}>
                          {assignment.purpose}
                        </TableCell>
                        <TableCell>
                          <Badge className={`gap-1 ${getStatusColor(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.status === "Active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs bg-transparent"
                              onClick={() => handleReturnAsset(assignment.id)}
                            >
                              Mark Returned
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredAssignments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No assignments found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenditures">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Expenditures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Approved By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userExpenditures.map((expenditure) => (
                      <TableRow key={expenditure.id}>
                        <TableCell className="font-medium">{expenditure.assetName}</TableCell>
                        <TableCell>
                          <Badge className={getExpenditureTypeColor(expenditure.type)}>{expenditure.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">${expenditure.amount.toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs truncate" title={expenditure.description}>
                          {expenditure.description}
                        </TableCell>
                        <TableCell>{new Date(expenditure.date).toLocaleDateString()}</TableCell>
                        <TableCell>{expenditure.approvedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {userExpenditures.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No expenditures recorded.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
