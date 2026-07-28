import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ResidentDashboard from "./dashboards/ResidentDashboard";
import CourierDashboard from "./dashboards/CourierDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import SuperAdminDashboard from "./dashboards/SuperAdminDashboard";
import UnlockBoxModal from "./modals/UnlockBoxModal";
import PaymentGate from "./PaymentGate";

import UserManagement from "./pages/admin/UserManagement";
import DeliveryTracking from "./pages/admin/DeliveryTracking";
import AlertsAndIssues from "./pages/admin/AlertsAndIssues";
import SystemSettings from "./pages/admin/SystemSettings";
import BoxManagement from "./pages/admin/BoxManagement";

import ActiveDeliveries from "./pages/courier/ActiveDeliveries";
import AssignDelivery from "./pages/courier/AssignDelivery";
import BoxLocations from "./pages/courier/BoxLocations";
import CourierDeliveryHistory from "./pages/courier/CourierDeliveryHistory";

import ResidentNotifications from "./pages/resident/ResidentNotifications";
import ResidentDeliveryHistory from "./pages/resident/ResidentDeliveryHistory";
import ResidentSettings from "./pages/resident/ResidentSettings";

import RevenueManagement from "./pages/superadmin/RevenueManagement";
import InstallationsManager from "./pages/superadmin/InstallationsManager";
import TamperEventsPage from "./pages/superadmin/TamperEventsPage";
import PlatformSettings from "./pages/superadmin/PlatformSettings";

export type PageType = 
  // Resident pages
  | "dashboard" 
  | "notifications" 
  | "delivery-history" 
  | "settings"
  // Courier pages  
  | "active-deliveries"
  | "assign-delivery"
  | "box-locations"
  | "courier-delivery-history"
  // Admin pages
  | "analytics"
  | "box-management"
  | "user-management"
  | "delivery-tracking"
  | "alerts-issues"
  | "system-settings"
  // Super Admin pages
  | "sa-overview"
  | "sa-revenue"
  | "sa-installations"
  | "sa-tamper-events"
  | "sa-platform-settings";

type ViewType = "resident" | "courier" | "admin" | "super-admin";

export default function Layout() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>(user?.role || "resident");
  const [currentPage, setCurrentPage] = useState<PageType>(
    currentView === "admin" ? "analytics" : 
    currentView === "courier" ? "active-deliveries" : 
    "dashboard"
  );
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view === "super-admin") {
      setCurrentPage("sa-overview");
    } else if (view === "admin") {
      setCurrentPage("analytics");
    } else if (view === "courier") {
      setCurrentPage("active-deliveries");
    } else {
      setCurrentPage("dashboard");
    }
  };

  // Listen for unlock modal events from sidebar
  useEffect(() => {
    const handleUnlockEvent = () => {
      setIsUnlockModalOpen(true);
    };
    
    window.addEventListener("open-unlock-modal", handleUnlockEvent);
    
    return () => {
      window.removeEventListener("open-unlock-modal", handleUnlockEvent);
    };
  }, []);

  const renderContent = () => {
    // Resident pages
    if (currentView === "resident") {
      switch (currentPage) {
        case "dashboard":
          return (
            <PaymentGate>
              <ResidentDashboard onOpenUnlockModal={() => setIsUnlockModalOpen(true)} />
            </PaymentGate>
          );
        case "notifications":
          return <ResidentNotifications />;
        case "delivery-history":
          return <ResidentDeliveryHistory />;
        case "settings":
          return <ResidentSettings />;
        default:
          return (
            <PaymentGate>
              <ResidentDashboard onOpenUnlockModal={() => setIsUnlockModalOpen(true)} />
            </PaymentGate>
          );
      }
    }

    // Courier pages
    if (currentView === "courier") {
      switch (currentPage) {
        case "active-deliveries":
          return <ActiveDeliveries />;
        case "assign-delivery":
          return <AssignDelivery />;
        case "box-locations":
          return <BoxLocations />;
        case "courier-delivery-history":
          return <CourierDeliveryHistory />;
        default:
          return <CourierDashboard />;
      }
    }

    // Admin pages
    if (currentView === "admin") {
      switch (currentPage) {
        case "analytics":
          return <AdminDashboard />;
        case "box-management":
          return <BoxManagement />;
        case "user-management":
          return <UserManagement />;
        case "delivery-tracking":
          return <DeliveryTracking />;
        case "alerts-issues":
          return <AlertsAndIssues />;
        case "system-settings":
          return <SystemSettings />;
        default:
          return <AdminDashboard />;
      }
    }

    // Super Admin pages
    if (currentView === "super-admin") {
      switch (currentPage) {
        case "sa-overview":
          return <SuperAdminDashboard />;
        case "sa-revenue":
          return <RevenueManagement />;
        case "sa-installations":
          return <InstallationsManager />;
        case "sa-tamper-events":
          return <TamperEventsPage />;
        case "sa-platform-settings":
          return <PlatformSettings />;
        default:
          return <SuperAdminDashboard />;
      }
    }

    return <ResidentDashboard onOpenUnlockModal={() => setIsUnlockModalOpen(true)} />;
  };

  const getPageTitle = () => {
    const titles: Record<PageType, string> = {
      // Resident
      "dashboard": "Dashboard",
      "notifications": "Notifications",
      "delivery-history": "Delivery History",
      "settings": "Settings",
      // Courier
      "active-deliveries": "Active Deliveries",
      "assign-delivery": "Assign Delivery",
      "box-locations": "Box Locations",
      "courier-delivery-history": "Delivery History",
      // Admin
      "analytics": "Analytics Dashboard",
      "box-management": "Box Management",
      "user-management": "User Management",
      "delivery-tracking": "Delivery Tracking",
      "alerts-issues": "Alerts & Issues",
      "system-settings": "System Settings",
      // Super Admin
      "sa-overview": "Super Admin Overview",
      "sa-revenue": "Revenue & Payments",
      "sa-installations": "Installation Requests",
      "sa-tamper-events": "Tamper Events",
      "sa-platform-settings": "Platform Settings",
    };
    return titles[currentPage] || "Dashboard";
  };

  const getPageSubtitle = () => {
    const subtitles: Record<PageType, string> = {
      // Resident
      "dashboard": "Welcome back! Here's your delivery overview",
      "notifications": "Stay updated with your delivery notifications",
      "delivery-history": "View all your past deliveries",
      "settings": "Manage your account preferences",
      // Courier
      "active-deliveries": "Manage your ongoing deliveries",
      "assign-delivery": "Assign packages to delivery routes",
      "box-locations": "View all smart box locations",
      "courier-delivery-history": "View your completed deliveries",
      // Admin
      "analytics": "System overview and key metrics",
      "box-management": "Monitor and manage smart boxes",
      "user-management": "Manage system users and permissions",
      "delivery-tracking": "Track all deliveries in real-time",
      "alerts-issues": "View and resolve system issues",
      "system-settings": "Configure system preferences",
      // Super Admin
      "sa-overview": "Platform-wide control panel",
      "sa-revenue": "All transactions and revenue breakdown",
      "sa-installations": "Manage hardware installation requests",
      "sa-tamper-events": "Security alerts across all smart boxes",
      "sa-platform-settings": "Service pricing and system configuration",
    };
    return subtitles[currentPage] || "Welcome back!";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="layout-container">
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <main className="flex-1 overflow-auto">
        <TopBar
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        />
        <div className="p-8 max-w-[1800px] mx-auto">
          <div className="animate-slide-in">
            {renderContent()}
          </div>
        </div>
      </main>
      
      <UnlockBoxModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
      />
    </div>
  );
}
