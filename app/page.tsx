"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Sidebar } from "@/components/layout/sidebar"
import { Dashboard } from "@/components/pages/dashboard"
import { Purchases } from "@/components/pages/purchases"
import { Transfers } from "@/components/pages/transfers"
import { Assignments } from "@/components/pages/assignments"
import { Assets } from "@/components/pages/assets"
import { UserManagement } from "@/components/pages/user-management"
import type { User } from "@/lib/auth"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
    setActiveTab("dashboard")
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard user={user} />
      case "purchases":
        return <Purchases user={user} />
      case "transfers":
        return <Transfers user={user} />
      case "assignments":
        return <Assignments user={user} />
      case "assets":
        return <Assets user={user} />
      case "users":
        return <UserManagement user={user} />
      default:
        return <Dashboard user={user} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
