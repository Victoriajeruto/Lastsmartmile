import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ResidentDashboard from "./dashboards/ResidentDashboard";
import CourierDashboard from "./dashboards/CourierDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import UnlockBoxModal from "./modals/UnlockBoxModal";
import PaymentGate from "./PaymentGate";

export default function Layout() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<"resident" | "courier" | "admin">(user?.role || "resident");
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const renderDashboard = () => {
    switch (currentView) {
      case "courier":
        return <CourierDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return (
          <PaymentGate>
            <ResidentDashboard onOpenUnlockModal={() => setIsUnlockModalOpen(true)} />
          </PaymentGate>
        );
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case "courier":
        return "Courier Dashboard";
      case "admin":
        return "Admin Analytics";
      default:
        return "Dashboard";
    }
  };

  const getPageSubtitle = () => {
    switch (currentView) {
      case "courier":
        return "Manage your deliveries and routes";
      case "admin":
        return "System overview and management";
      default:
        return "Welcome back! Here's your delivery overview";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" data-testid="layout-container">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto">
        <TopBar
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        />
        <div className="p-8">
          {renderDashboard()}
        </div>
      </main>
      
      <UnlockBoxModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
      />
    </div>
  );
}
