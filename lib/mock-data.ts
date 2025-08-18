export interface Asset {
  id: string
  name: string
  category: "Vehicle" | "Equipment" | "Weapon" | "Communication" | "Medical"
  serialNumber: string
  baseId: string
  baseName: string
  status: "Active" | "Maintenance" | "Retired" | "In Transit"
  condition: "Excellent" | "Good" | "Fair" | "Poor"
  purchaseDate: string
  cost: number
  assignedTo?: string
}

export interface Purchase {
  id: string
  assetName: string
  category: Asset["category"]
  quantity: number
  unitCost: number
  totalCost: number
  vendor: string
  requestedBy: string
  baseId: string
  baseName: string
  status: "Pending" | "Approved" | "Ordered" | "Delivered"
  requestDate: string
  expectedDelivery?: string
}

export interface Transfer {
  id: string
  assetId: string
  assetName: string
  fromBaseId: string
  fromBaseName: string
  toBaseId: string
  toBaseName: string
  requestedBy: string
  approvedBy?: string
  status: "Pending" | "Approved" | "In Transit" | "Completed" | "Rejected"
  requestDate: string
  transferDate?: string
  reason: string
}

export interface Assignment {
  id: string
  assetId: string
  assetName: string
  assignedTo: string
  assignedBy: string
  baseId: string
  baseName: string
  assignmentDate: string
  returnDate?: string
  status: "Active" | "Returned" | "Overdue"
  purpose: string
}

export interface Base {
  id: string
  name: string
  location: string
  commanderId: string
  commanderName: string
}

// Mock data
export const mockBases: Base[] = [
  { id: "base1", name: "Fort Liberty", location: "North Carolina", commanderId: "2", commanderName: "Col. Johnson" },
  { id: "base2", name: "Camp Pendleton", location: "California", commanderId: "4", commanderName: "Col. Smith" },
  { id: "base3", name: "Fort Hood", location: "Texas", commanderId: "5", commanderName: "Col. Williams" },
]

export const mockAssets: Asset[] = [
  {
    id: "asset1",
    name: "M1A2 Abrams Tank",
    category: "Vehicle",
    serialNumber: "M1A2-001",
    baseId: "base1",
    baseName: "Fort Liberty",
    status: "Active",
    condition: "Excellent",
    purchaseDate: "2023-01-15",
    cost: 8500000,
    assignedTo: "Alpha Company",
  },
  {
    id: "asset2",
    name: "Night Vision Goggles",
    category: "Equipment",
    serialNumber: "NVG-2024-001",
    baseId: "base1",
    baseName: "Fort Liberty",
    status: "Active",
    condition: "Good",
    purchaseDate: "2024-03-10",
    cost: 3500,
    assignedTo: "Sgt. Martinez",
  },
  {
    id: "asset3",
    name: "Medical Supply Kit",
    category: "Medical",
    serialNumber: "MED-KIT-001",
    baseId: "base2",
    baseName: "Camp Pendleton",
    status: "Active",
    condition: "Excellent",
    purchaseDate: "2024-02-20",
    cost: 1200,
  },
]

export const mockPurchases: Purchase[] = [
  {
    id: "purchase1",
    assetName: "Tactical Radio Set",
    category: "Communication",
    quantity: 10,
    unitCost: 2500,
    totalCost: 25000,
    vendor: "Harris Corporation",
    requestedBy: "logistics1",
    baseId: "base1",
    baseName: "Fort Liberty",
    status: "Approved",
    requestDate: "2024-12-01",
    expectedDelivery: "2024-12-20",
  },
  {
    id: "purchase2",
    assetName: "Body Armor Vest",
    category: "Equipment",
    quantity: 50,
    unitCost: 800,
    totalCost: 40000,
    vendor: "Point Blank Enterprises",
    requestedBy: "logistics1",
    baseId: "base1",
    baseName: "Fort Liberty",
    status: "Pending",
    requestDate: "2024-12-15",
  },
]

export const mockTransfers: Transfer[] = [
  {
    id: "transfer1",
    assetId: "asset2",
    assetName: "Night Vision Goggles",
    fromBaseId: "base1",
    fromBaseName: "Fort Liberty",
    toBaseId: "base2",
    toBaseName: "Camp Pendleton",
    requestedBy: "logistics1",
    approvedBy: "commander1",
    status: "Approved",
    requestDate: "2024-12-10",
    transferDate: "2024-12-18",
    reason: "Operational requirement for training exercise",
  },
]

export const mockAssignments: Assignment[] = [
  {
    id: "assignment1",
    assetId: "asset1",
    assetName: "M1A2 Abrams Tank",
    assignedTo: "Alpha Company",
    assignedBy: "commander1",
    baseId: "base1",
    baseName: "Fort Liberty",
    assignmentDate: "2024-11-01",
    status: "Active",
    purpose: "Training Operations",
  },
  {
    id: "assignment2",
    assetId: "asset2",
    assetName: "Night Vision Goggles",
    assignedTo: "Sgt. Martinez",
    assignedBy: "logistics1",
    baseId: "base1",
    baseName: "Fort Liberty",
    assignmentDate: "2024-12-01",
    returnDate: "2024-12-31",
    status: "Active",
    purpose: "Night patrol duty",
  },
]
