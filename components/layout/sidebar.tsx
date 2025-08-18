"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowRightLeft,
  ClipboardList,
  LogOut,
  Shield,
  Users,
  Package,
} from "lucide-react"
import { type User, hasPermission } from "@/lib/auth"

interface SidebarProps {
  user: User
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: null,
    },
    {
      id: "purchases",
      label: "Purchases",
      icon: ShoppingCart,
      permission: "create_purchase",
    },
    {
      id: "transfers",
      label: "Transfers",
      icon: ArrowRightLeft,
      permission: "request_transfer",
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: ClipboardList,
      permission: "view_assignments",
    },
    {
      id: "assets",
      label: "Assets",
      icon: Package,
      permission: null,
    },
  ]

  // Add admin-only items
  if (hasPermission(user, "system_admin")) {
    menuItems.push({
      id: "users",
      label: "User Management",
      icon: Users,
      permission: "manage_users",
    })
  }

  const filteredItems = menuItems.filter((item) => !item.permission || hasPermission(user, item.permission))

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">MAMS</h1>
            <p className="text-xs text-sidebar-foreground/70">Military Asset Management</p>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-sidebar-foreground">{user.username}</p>
          <p className="text-sidebar-foreground/70 capitalize">{user.role.replace("_", " ")}</p>
          {user.baseName && <p className="text-sidebar-foreground/70 text-xs">{user.baseName}</p>}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
