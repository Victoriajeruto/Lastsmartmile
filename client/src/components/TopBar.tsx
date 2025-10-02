import { Button } from "@/components/ui/button";
import { Bell, QrCode } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle: string;
  onOpenUnlockModal: () => void;
}

export default function TopBar({ title, subtitle, onOpenUnlockModal }: TopBarProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10" data-testid="topbar">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1" data-testid="page-subtitle">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-muted rounded-lg"
            data-testid="button-notifications"
          >
            <Bell className="text-xl text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          <Button
            onClick={onOpenUnlockModal}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2"
            data-testid="button-quick-unlock"
          >
            <QrCode className="w-4 h-4" />
            <span>Quick Unlock</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
