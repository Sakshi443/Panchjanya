import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Globe, Map, Moon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-primary">Settings</h1>

      <div className="space-y-6">
        {/* Language Settings */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Language</h3>
                <p className="text-sm text-muted-foreground">Choose your preferred language</p>
              </div>
              <Select defaultValue="marathi">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                  <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Manage notification preferences</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-3 pl-0">
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Temple festivals</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">New temples added</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Updates and announcements</Label>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Settings */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Map Preferences</h3>
              <p className="text-sm text-muted-foreground mb-4">Customize map display</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Show temple names</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Auto-center on location</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Moon className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-accent hover:bg-accent/90">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
