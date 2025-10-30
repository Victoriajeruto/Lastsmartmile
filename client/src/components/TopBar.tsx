import { Button } from "@/components/ui/button";
import { Bell, QrCode } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle: string;
  onOpenUnlockModal: () => void;
}

export default function TopBar({ title, subtitle, onOpenUnlockModal }: TopBarProps) {
  return (
    <header className="bg-card border-b-2 border-primary/20 sticky top-0 z-10 shadow-md" data-testid="topbar">
      <div className="px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight" data-testid="page-title">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2" data-testid="page-subtitle">
            <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="relative p-3 hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/30"
            data-testid="button-notifications"
          >
            <Bell className="text-xl text-foreground" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full shadow-lg"></span>
          </Button>
          <Button
            onClick={onOpenUnlockModal}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg"
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
