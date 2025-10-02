import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Cog, Bell, Shield, Database, Mail } from "lucide-react";

export default function SystemSettings() {
  return (
    <div className="space-y-6" data-testid="system-settings-page">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="w-5 h-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure system-wide preferences and options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="system-name">System Name</Label>
              <Input
                id="system-name"
                defaultValue="Last Mile Postal System"
                data-testid="input-system-name"
              />
            </div>
            <div>
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                defaultValue="support@lastmilepostal.co.ke"
                data-testid="input-support-email"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage notification preferences and channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send delivery updates via SMS
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-sms-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send delivery updates via email
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-email-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications within the application
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-inapp-notifications" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and authentication options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for admin accounts
              </p>
            </div>
            <Switch data-testid="switch-2fa" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Auto-logout after 24 hours of inactivity
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-session-timeout" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Maintenance
          </CardTitle>
          <CardDescription>
            Database and system maintenance tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Database Backup</Label>
              <p className="text-sm text-muted-foreground">
                Last backup: 2 hours ago
              </p>
            </div>
            <Button variant="outline" data-testid="button-backup-now">
              Backup Now
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clear Cache</Label>
              <p className="text-sm text-muted-foreground">
                Clear system cache to improve performance
              </p>
            </div>
            <Button variant="outline" data-testid="button-clear-cache">
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
        <Button data-testid="button-save-settings">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
