# Military Asset Management System - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Data Models / Schema](#data-models--schema)
4. [RBAC Explanation](#rbac-explanation)
5. [API Logging](#api-logging)
6. [Setup Instructions](#setup-instructions)
7. [API Endpoints](#api-endpoints)

---

## 1. Project Overview

### Description
The Military Asset Management System is a comprehensive web application designed to manage military assets, personnel assignments, procurement processes, and inter-base transfers. The system provides role-based access control to ensure appropriate security levels for different military personnel.

### Key Features
- **Dashboard**: Real-time metrics and system overview
- **Asset Management**: Complete inventory tracking and management
- **Purchase Management**: Procurement request workflow with approval system
- **Transfer Management**: Inter-base asset transfer coordination
- **Assignment Management**: Personnel asset assignments and expenditure tracking
- **User Management**: Administrative user and role management
- **Role-Based Access Control**: Three-tier permission system

### Assumptions
- The system operates in a controlled military network environment
- Users have appropriate security clearances for their assigned roles
- Asset data is maintained in real-time by authorized personnel
- All transactions require proper approval workflows
- The system handles sensitive military asset information

### Limitations
- **No Database Integration**: Currently uses mock data and local storage
- **No Real-time Sync**: Changes are not synchronized across multiple sessions
- **Limited Offline Capability**: Requires internet connection for full functionality
- **No Advanced Reporting**: Basic reporting features only
- **No Integration**: No connection to existing military systems or APIs
- **Mock Authentication**: Uses simplified authentication for demonstration

### Target Users
- **System Administrators**: Full system access and user management
- **Base Commanders**: Base-level asset oversight and approval authority
- **Logistics Officers**: Day-to-day asset management and operations

---

## 2. Tech Stack & Architecture

### Frontend Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom military theme
- **UI Components**: shadcn/ui component library
- **State Management**: React Context API with local storage persistence
- **Icons**: Lucide React icon library

### Architecture Pattern
- **Client-Side Rendering**: React-based SPA with Next.js
- **Component Architecture**: Modular, reusable components
- **Page-Based Routing**: Next.js App Router for navigation
- **Context-Based State**: Global authentication and user state management

### Why This Stack Was Chosen

#### Next.js 14
- **Server-Side Capabilities**: Built-in API routes for future backend integration
- **Performance**: Automatic code splitting and optimization
- **Developer Experience**: Hot reloading and TypeScript support
- **Deployment**: Seamless Vercel deployment integration

#### TypeScript
- **Type Safety**: Reduces runtime errors in critical military applications
- **Developer Productivity**: Better IDE support and code completion
- **Maintainability**: Self-documenting code with type definitions
- **Scalability**: Easier refactoring and team collaboration

#### Tailwind CSS
- **Rapid Development**: Utility-first approach for quick styling
- **Consistency**: Design system tokens ensure uniform appearance
- **Responsive Design**: Built-in responsive utilities
- **Customization**: Easy theming for military-specific color schemes

#### shadcn/ui
- **Professional Components**: High-quality, accessible UI components
- **Customizable**: Easy to modify for military aesthetic requirements
- **Consistent**: Unified design language across the application
- **Accessible**: WCAG compliance for government applications

---

## 3. Data Models / Schema

### Core Entities

#### User Entity
\`\`\`typescript
interface User {
  id: string;
  username: string;
  password: string; // In production: hashed
  name: string;
  email: string;
  role: 'admin' | 'base_commander' | 'logistics_officer';
  base: string;
  createdAt: Date;
  lastLogin?: Date;
}
\`\`\`

#### Asset Entity
\`\`\`typescript
interface Asset {
  id: string;
  name: string;
  category: 'Vehicle' | 'Equipment' | 'Weapon' | 'Communication' | 'Medical';
  serialNumber: string;
  status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  location: string; // Base location
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  assignedTo?: string; // Personnel ID
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}
\`\`\`

#### Purchase Entity
\`\`\`typescript
interface Purchase {
  id: string;
  requestedBy: string; // User ID
  assetName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  vendor: string;
  justification: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestDate: Date;
  approvedBy?: string; // User ID
  approvalDate?: Date;
  expectedDelivery?: Date;
}
\`\`\`

#### Transfer Entity
\`\`\`typescript
interface Transfer {
  id: string;
  assetId: string;
  fromBase: string;
  toBase: string;
  requestedBy: string; // User ID
  approvedBy?: string; // User ID
  reason: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Approved' | 'In Transit' | 'Completed' | 'Rejected';
  requestDate: Date;
  approvalDate?: Date;
  transferDate?: Date;
  completionDate?: Date;
  transportMethod?: string;
  estimatedArrival?: Date;
}
\`\`\`

#### Assignment Entity
\`\`\`typescript
interface Assignment {
  id: string;
  assetId: string;
  assignedTo: string; // Personnel name/ID
  assignedBy: string; // User ID
  purpose: string;
  assignmentDate: Date;
  expectedReturn?: Date;
  actualReturn?: Date;
  status: 'Active' | 'Returned' | 'Overdue' | 'Lost';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  notes?: string;
}
\`\`\`

#### Expenditure Entity
\`\`\`typescript
interface Expenditure {
  id: string;
  assetId?: string;
  category: 'Maintenance' | 'Fuel' | 'Supplies' | 'Training' | 'Other';
  description: string;
  amount: number;
  date: Date;
  approvedBy: string; // User ID
  vendor?: string;
  receiptNumber?: string;
  notes?: string;
}
\`\`\`

### Entity Relationships

\`\`\`
User (1) -----> (N) Purchase [requestedBy]
User (1) -----> (N) Transfer [requestedBy]
User (1) -----> (N) Assignment [assignedBy]
User (1) -----> (N) Expenditure [approvedBy]

Asset (1) -----> (N) Transfer [assetId]
Asset (1) -----> (N) Assignment [assetId]
Asset (1) -----> (N) Expenditure [assetId]

Purchase (1) -----> (1) Asset [creates]
Transfer (N) -----> (1) Asset [moves]
Assignment (N) -----> (1) Asset [assigns]
\`\`\`

---

## 4. RBAC Explanation

### Role Hierarchy

#### 1. System Administrator (admin)
**Access Level**: Full System Access
- **User Management**: Create, modify, delete users
- **System Configuration**: Modify system settings and parameters
- **All Operations**: Complete access to all features and data
- **Audit Access**: View all system logs and audit trails
- **Override Authority**: Can override lower-level restrictions

#### 2. Base Commander (base_commander)
**Access Level**: Base-Level Management
- **Asset Oversight**: View and manage assets within their base
- **Approval Authority**: Approve purchases and transfers
- **Personnel Management**: Assign assets to personnel
- **Reporting Access**: Generate base-level reports
- **Limited User Management**: Manage logistics officers under their command

#### 3. Logistics Officer (logistics_officer)
**Access Level**: Operational Management
- **Asset Operations**: Day-to-day asset management and tracking
- **Request Submission**: Submit purchase and transfer requests
- **Assignment Management**: Create and manage asset assignments
- **Expenditure Tracking**: Record and track asset-related expenses
- **Read-Only Reporting**: View operational reports and metrics

### Permission Matrix

| Feature | Admin | Base Commander | Logistics Officer |
|---------|-------|----------------|-------------------|
| Dashboard View | ✅ Full | ✅ Base-Level | ✅ Limited |
| Asset Management | ✅ All Bases | ✅ Own Base | ✅ View/Edit |
| Purchase Requests | ✅ All | ✅ Approve/View | ✅ Create/View |
| Transfer Management | ✅ All | ✅ Approve/View | ✅ Create/View |
| Assignment Management | ✅ All | ✅ Base-Level | ✅ Create/Manage |
| User Management | ✅ Full | ✅ Limited | ❌ None |
| System Settings | ✅ Full | ❌ None | ❌ None |
| Audit Logs | ✅ Full | ✅ Base-Level | ❌ None |

### Enforcement Method

#### Frontend Enforcement
\`\`\`typescript
// Role-based component rendering
const hasPermission = (requiredRole: Role, userRole: Role): boolean => {
  const roleHierarchy = {
    'logistics_officer': 1,
    'base_commander': 2,
    'admin': 3
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Usage in components
{hasPermission('base_commander', user.role) && (
  <ApprovalButton />
)}
\`\`\`

#### Route Protection
\`\`\`typescript
// Page-level access control
const ProtectedRoute = ({ children, requiredRole }: {
  children: React.ReactNode;
  requiredRole: Role;
}) => {
  const { user } = useAuth();
  
  if (!user || !hasPermission(requiredRole, user.role)) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
};
\`\`\`

#### Data Filtering
\`\`\`typescript
// Base-level data filtering for Base Commanders
const getFilteredAssets = (assets: Asset[], user: User): Asset[] => {
  if (user.role === 'admin') return assets;
  if (user.role === 'base_commander') {
    return assets.filter(asset => asset.location === user.base);
  }
  return assets; // Logistics officers see all for operational needs
};
\`\`\`

---

## 5. API Logging

### Current Implementation
The current system uses client-side logging for demonstration purposes. In a production environment, comprehensive API logging would be implemented.

### Logging Strategy

#### Transaction Logging
\`\`\`typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  previousValue?: any;
  newValue?: any;
}
\`\`\`

#### Logged Actions
- **Authentication Events**: Login, logout, failed attempts
- **Asset Operations**: Create, update, delete, transfer
- **Purchase Activities**: Request, approval, rejection
- **Assignment Changes**: Create, modify, return
- **User Management**: User creation, role changes, deactivation
- **System Access**: Page views, feature usage, permission denials

#### Implementation Example
\`\`\`typescript
const logTransaction = async (
  action: string,
  resource: string,
  resourceId: string,
  previousValue?: any,
  newValue?: any
) => {
  const logEntry: AuditLog = {
    id: generateId(),
    userId: getCurrentUser().id,
    action,
    resource,
    resourceId,
    timestamp: new Date(),
    ipAddress: getClientIP(),
    userAgent: navigator.userAgent,
    success: true,
    previousValue,
    newValue
  };
  
  // In production: Send to secure logging service
  await sendToAuditService(logEntry);
};
\`\`\`

### Security Considerations
- **Immutable Logs**: Audit logs cannot be modified or deleted
- **Encrypted Storage**: Sensitive data in logs is encrypted
- **Access Control**: Only administrators can view audit logs
- **Retention Policy**: Logs retained according to military regulations
- **Real-time Monitoring**: Critical actions trigger immediate alerts

---

## 6. Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Git for version control
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

#### 1. Clone the Repository
\`\`\`bash
git clone [repository-url]
cd military-asset-management
\`\`\`

#### 2. Install Dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

#### 3. Environment Setup
Create a `.env.local` file in the root directory:
\`\`\`env
# Application Configuration
NEXT_PUBLIC_APP_NAME="Military Asset Management System"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# In production, add database and authentication configurations
# DATABASE_URL="your-database-connection-string"
# NEXTAUTH_SECRET="your-nextauth-secret"
# NEXTAUTH_URL="http://localhost:3000"
\`\`\`

#### 4. Development Server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The application will be available at `http://localhost:3000`

#### 5. Production Build
\`\`\`bash
npm run build
npm start
# or
yarn build
yarn start
\`\`\`

### Demo Accounts
Use these accounts to test different role functionalities:

| Username | Password | Role | Base |
|----------|----------|------|------|
| admin | admin123 | System Administrator | HQ |
| commander1 | cmd123 | Base Commander | Fort Liberty |
| logistics1 | log123 | Logistics Officer | Fort Liberty |

### File Structure
\`\`\`
military-asset-management/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and theme
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── pages/            # Page components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── mock-data.ts      # Mock data for demonstration
│   └── utils.ts          # Utility functions
└── public/               # Static assets
\`\`\`

### Troubleshooting

#### Common Issues
1. **Port Already in Use**: Change port with `npm run dev -- -p 3001`
2. **Node Version**: Ensure Node.js 18+ is installed
3. **Dependencies**: Clear node_modules and reinstall if issues persist
4. **Browser Cache**: Clear browser cache if styles don't load properly

#### Development Tips
- Use browser developer tools to inspect authentication state
- Check console for any JavaScript errors
- Verify mock data is loading correctly in the Network tab

---

## 7. API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
**Description**: Authenticate user credentials
\`\`\`typescript
// Request
{
  "username": "admin",
  "password": "admin123"
}

// Response (Success)
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin",
    "name": "System Administrator",
    "role": "admin",
    "base": "HQ"
  },
  "token": "jwt-token-here"
}

// Response (Error)
{
  "success": false,
  "error": "Invalid credentials"
}
\`\`\`

#### POST /api/auth/logout
**Description**: Logout current user
\`\`\`typescript
// Response
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

### Asset Management Endpoints

#### GET /api/assets
**Description**: Retrieve assets with optional filtering
\`\`\`typescript
// Query Parameters
?base=Fort+Liberty&category=Vehicle&status=Available

// Response
{
  "success": true,
  "data": [
    {
      "id": "asset-1",
      "name": "M1A2 Abrams Tank",
      "category": "Vehicle",
      "serialNumber": "M1A2-001",
      "status": "Available",
      "condition": "Excellent",
      "location": "Fort Liberty",
      "purchaseDate": "2023-01-15",
      "currentValue": 8500000
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
\`\`\`

#### POST /api/assets
**Description**: Create new asset
\`\`\`typescript
// Request
{
  "name": "Humvee M1151",
  "category": "Vehicle",
  "serialNumber": "HMV-2024-001",
  "location": "Fort Liberty",
  "purchasePrice": 220000,
  "condition": "Excellent"
}

// Response
{
  "success": true,
  "data": {
    "id": "asset-new",
    "name": "Humvee M1151",
    // ... other fields
  }
}
\`\`\`

#### PUT /api/assets/:id
**Description**: Update existing asset
\`\`\`typescript
// Request
{
  "status": "Maintenance",
  "condition": "Good",
  "notes": "Scheduled maintenance"
}

// Response
{
  "success": true,
  "data": {
    "id": "asset-1",
    // ... updated fields
  }
}
\`\`\`

### Purchase Management Endpoints

#### GET /api/purchases
**Description**: Retrieve purchase requests
\`\`\`typescript
// Query Parameters
?status=Pending&priority=High&requestedBy=user-1

// Response
{
  "success": true,
  "data": [
    {
      "id": "purchase-1",
      "assetName": "Night Vision Goggles",
      "category": "Equipment",
      "quantity": 50,
      "unitPrice": 3500,
      "totalCost": 175000,
      "status": "Pending",
      "priority": "High",
      "requestDate": "2024-01-15T10:00:00Z"
    }
  ]
}
\`\`\`

#### POST /api/purchases
**Description**: Create purchase request
\`\`\`typescript
// Request
{
  "assetName": "Combat Helmets",
  "category": "Equipment",
  "quantity": 100,
  "unitPrice": 450,
  "vendor": "Defense Solutions Inc",
  "justification": "Replacement for damaged equipment",
  "priority": "Medium"
}

// Response
{
  "success": true,
  "data": {
    "id": "purchase-new",
    "status": "Pending",
    // ... other fields
  }
}
\`\`\`

#### PUT /api/purchases/:id/approve
**Description**: Approve purchase request (Base Commander+ only)
\`\`\`typescript
// Request
{
  "approved": true,
  "notes": "Approved for immediate procurement"
}

// Response
{
  "success": true,
  "data": {
    "id": "purchase-1",
    "status": "Approved",
    "approvedBy": "commander-1",
    "approvalDate": "2024-01-16T14:30:00Z"
  }
}
\`\`\`

### Transfer Management Endpoints

#### GET /api/transfers
**Description**: Retrieve transfer requests
\`\`\`typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": "transfer-1",
      "assetId": "asset-1",
      "fromBase": "Fort Liberty",
      "toBase": "Fort Bragg",
      "status": "Pending",
      "priority": "Medium",
      "requestDate": "2024-01-15T09:00:00Z"
    }
  ]
}
\`\`\`

#### POST /api/transfers
**Description**: Create transfer request
\`\`\`typescript
// Request
{
  "assetId": "asset-1",
  "toBase": "Fort Bragg",
  "reason": "Operational requirement",
  "priority": "High",
  "transportMethod": "Military Transport"
}

// Response
{
  "success": true,
  "data": {
    "id": "transfer-new",
    "status": "Pending",
    // ... other fields
  }
}
\`\`\`

### Assignment Management Endpoints

#### GET /api/assignments
**Description**: Retrieve asset assignments
\`\`\`typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": "assignment-1",
      "assetId": "asset-1",
      "assignedTo": "Sgt. Johnson",
      "purpose": "Training Exercise",
      "assignmentDate": "2024-01-10T08:00:00Z",
      "expectedReturn": "2024-01-20T17:00:00Z",
      "status": "Active"
    }
  ]
}
\`\`\`

#### POST /api/assignments
**Description**: Create new assignment
\`\`\`typescript
// Request
{
  "assetId": "asset-1",
  "assignedTo": "Cpl. Smith",
  "purpose": "Field Operations",
  "expectedReturn": "2024-02-01T17:00:00Z"
}

// Response
{
  "success": true,
  "data": {
    "id": "assignment-new",
    "status": "Active",
    // ... other fields
  }
}
\`\`\`

### User Management Endpoints

#### GET /api/users
**Description**: Retrieve users (Admin only)
\`\`\`typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "username": "commander1",
      "name": "Col. Sarah Mitchell",
      "role": "base_commander",
      "base": "Fort Liberty",
      "email": "s.mitchell@military.gov",
      "lastLogin": "2024-01-15T14:30:00Z"
    }
  ]
}
\`\`\`

#### POST /api/users
**Description**: Create new user (Admin only)
\`\`\`typescript
// Request
{
  "username": "newuser",
  "password": "secure123",
  "name": "Lt. John Doe",
  "email": "j.doe@military.gov",
  "role": "logistics_officer",
  "base": "Fort Liberty"
}

// Response
{
  "success": true,
  "data": {
    "id": "user-new",
    "username": "newuser",
    // ... other fields (password excluded)
  }
}
\`\`\`

### Error Responses

All endpoints return consistent error responses:
\`\`\`typescript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
\`\`\`

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Conclusion

This Military Asset Management System provides a comprehensive foundation for managing military assets with appropriate security controls and role-based access. The system is designed to be scalable and can be extended with additional features such as real database integration, advanced reporting, and external system integrations.

For production deployment, additional security measures, database integration, and compliance with military standards would be required.

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Prepared By**: v0 AI Assistant  
**Classification**: Unclassified//For Official Use Only
