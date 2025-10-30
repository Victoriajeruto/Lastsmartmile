import { useAuth } from "@/hooks/useAuth";
import { Package, Home, Bell, Unlock, History, Settings, Truck, PackageOpen, MapPin, Clock, BarChart, Users, AlertTriangle, Cog } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageType } from "./Layout";

interface SidebarProps {
  currentView: "resident" | "courier" | "admin";
  onViewChange: (view: "resident" | "courier" | "admin") => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export default function Sidebar({ currentView, onViewChange, currentPage, onPageChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const residentNavItems = [
    { icon: Home, label: "Dashboard", page: "dashboard" as PageType },
    { icon: Bell, label: "Notifications", page: "notifications" as PageType, badge: "3" },
    { icon: Unlock, label: "Unlock Box", action: "unlock" },
    { icon: History, label: "Delivery History", page: "delivery-history" as PageType },
    { icon: Settings, label: "Settings", page: "settings" as PageType },
  ];

  const courierNavItems = [
    { icon: Home, label: "Dashboard", page: "active-deliveries" as PageType },
    { icon: Truck, label: "Active Deliveries", page: "active-deliveries" as PageType, badge: "5" },
    { icon: PackageOpen, label: "Assign Delivery", page: "assign-delivery" as PageType },
    { icon: MapPin, label: "Box Locations", page: "box-locations" as PageType },
    { icon: Clock, label: "Delivery History", page: "courier-delivery-history" as PageType },
  ];

  const adminNavItems = [
    { icon: BarChart, label: "Analytics", page: "analytics" as PageType },
    { icon: Package, label: "Box Management", page: "box-management" as PageType },
    { icon: Users, label: "User Management", page: "user-management" as PageType },
    { icon: Truck, label: "Delivery Tracking", page: "delivery-tracking" as PageType },
    { icon: AlertTriangle, label: "Alerts & Issues", page: "alerts-issues" as PageType, badge: "2" },
    { icon: Cog, label: "System Settings", page: "system-settings" as PageType },
  ];

  const getNavItems = () => {
    switch (currentView) {
      case "courier":
        return courierNavItems;
      case "admin":
        return adminNavItems;
      default:
        return residentNavItems;
    }
  };

  const getUserInitials = () => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  const handleNavClick = (item: any) => {
    if (item.action === "unlock") {
      // Trigger unlock modal through TopBar
      const event = new CustomEvent("open-unlock-modal");
      window.dispatchEvent(event);
    } else if (item.page) {
      onPageChange(item.page);
    }
  };

  const isActive = (item: any) => {
    if (item.page) {
      return currentPage === item.page;
    }
    return false;
  };

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border flex-shrink-0 shadow-xl" data-testid="sidebar">
      <div className="h-full flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-sidebar-border bg-sidebar">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-sidebar-primary-foreground text-2xl" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-sidebar-foreground">Smart P.O Box</h1>
              <p className="text-xs text-sidebar-foreground/70">Last Mile Postal System</p>
            </div>
          </div>
        </div>

        {/* Role Switcher (Demo) */}
        <div className="p-4 border-b border-sidebar-border bg-sidebar-border/30">
          <label className="text-xs font-semibold text-sidebar-foreground/70 mb-2 block uppercase tracking-wider">View As:</label>
          <Select value={currentView} onValueChange={onViewChange}>
            <SelectTrigger className="w-full bg-sidebar-border/50 border-sidebar-primary/30 text-sidebar-foreground hover:border-sidebar-primary transition-colors" data-testid="role-switcher">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resident">Resident</SelectItem>
              <SelectItem value="courier">Courier</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {getNavItems().map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item)}
                className={`nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${
                  isActive(item)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-lg"
                    : "hover:bg-sidebar-border/50 text-sidebar-foreground/90 hover:text-sidebar-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-border/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sidebar-primary rounded-full flex items-center justify-center text-sidebar-primary-foreground font-bold text-base shadow-lg ring-2 ring-sidebar-primary/30">
              <span data-testid="user-initials">{getUserInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-sidebar-foreground truncate" data-testid="user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate" data-testid="user-email">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-border/50 p-2 rounded-lg transition-all"
              data-testid="button-logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
