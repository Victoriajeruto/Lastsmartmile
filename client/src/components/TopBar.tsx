import { Button } from "@/components/ui/button";
import { Bell, QrCode } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle: string;
  onOpenUnlockModal: () => void;
}

export default function TopBar({ title, subtitle, onOpenUnlockModal }: TopBarProps) {
  return (
    <header className="bg-gradient-to-r from-card via-card to-primary/5 border-b-2 border-primary/20 sticky top-0 z-10 backdrop-blur-sm shadow-md" data-testid="topbar">
      <div className="px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight" data-testid="page-title">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2" data-testid="page-subtitle">
            <span className="inline-block w-1 h-1 rounded-full bg-primary animate-pulse"></span>
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="relative p-3 hover:bg-primary/10 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-primary/30"
            data-testid="button-notifications"
          >
            <Bell className="text-xl text-foreground" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-destructive to-warning rounded-full animate-pulse shadow-lg"></span>
          </Button>
          <Button
            onClick={onOpenUnlockModal}
            className="px-5 py-2.5 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
            data-testid="button-quick-unlock"
          >
            <QrCode className="w-5 h-5" />
            <span>Quick Unlock</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
