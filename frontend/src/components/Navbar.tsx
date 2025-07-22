import type React from "react"
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bus, User, Settings, LogOut, Menu, MapPin, BarChart3, Users, Shield } from "lucide-react"

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "driver":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNavLinks = () => {
    if (!user) return []

    const baseLinks = [
      { to: "/routes", label: "Routes", icon: Bus },
    ]

    switch (user.role) {
      case "admin":
        return [
          { to: "/admin", label: "Dashboard", icon: BarChart3 },
          { to: "/admin/buses", label: "Bus Management", icon: Bus },
          { to: "/admin/users", label: "User Management", icon: Users },
          { to: "/admin/map", label: "Live Map", icon: MapPin },
          { to: "/admin/reports", label: "Reports", icon: BarChart3 },
        ]
      case "driver":
        return [
          { to: "/driver", label: "Dashboard", icon: BarChart3 },
          { to: "/driver/tracker", label: "Location Tracker", icon: MapPin },
          ...baseLinks,
        ]
      default:
        return baseLinks
    }
  }

  const navLinks = getNavLinks()

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Bus className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BusTracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated &&
              navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          <Badge className={`w-fit mt-1 ${getRoleBadgeColor(user.role)}`}>
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem> */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <div className="flex flex-col h-full">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 p-4 border-b">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <Badge className={`w-fit mt-1 ${getRoleBadgeColor(user.role)}`}>
                              <Shield className="h-3 w-3 mr-1" />
                              {user.role}
                            </Badge>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 py-4">
                          <div className="space-y-1">
                            {navLinks.map((link) => {
                              const Icon = link.icon
                              const isActive = location.pathname === link.to

                              return (
                                <Link
                                  key={link.to}
                                  to={link.to}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                      ? "text-blue-600 bg-blue-50"
                                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                    }`}
                                >
                                  <Icon className="h-5 w-5" />
                                  <span>{link.label}</span>
                                </Link>
                              )
                            })}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="border-t p-4 space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              navigate("/profile")
                              setIsMobileMenuOpen(false)
                            }}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
