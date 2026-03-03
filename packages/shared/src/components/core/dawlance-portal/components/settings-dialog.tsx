import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import { useState } from "react";
import { useDawlancePortalStore } from "../../../../stores/dawlance-portal.store";
import { useShallow } from "zustand/shallow";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings, resetSettings } = useDawlancePortalStore(
    useShallow((state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
      resetSettings: state.resetSettings,
    }))
  );

  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    resetSettings();
    setLocalSettings({
      workHours: 9,
      breakStart: "13:00",
      breakEnd: "14:00",
      showBreak: true,
      autoRefresh: false,
      refreshInterval: 30,
      timeFormat: '12h',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dawlance Portal Settings</DialogTitle>
          <DialogDescription>
            Configure your work hours, break times, and auto-refresh preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Work Hours */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workHours" className="text-right">
              Work Hours
            </Label>
            <Input
              id="workHours"
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={localSettings.workHours}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  workHours: parseFloat(e.target.value) || 9,
                })
              }
              className="col-span-3"
            />
          </div>

          {/* Break Start */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breakStart" className="text-right">
              Break Start
            </Label>
            <Input
              id="breakStart"
              type="time"
              value={localSettings.breakStart}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  breakStart: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>

          {/* Break End */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breakEnd" className="text-right">
              Break End
            </Label>
            <Input
              id="breakEnd"
              type="time"
              value={localSettings.breakEnd}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  breakEnd: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>

          {/* Show Break */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="showBreak" className="text-right">
              Show Break
            </Label>
            <div className="col-span-3">
              <Switch
                id="showBreak"
                checked={localSettings.showBreak}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    showBreak: checked,
                  })
                }
              />
            </div>
          </div>

          {/* Time Format */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeFormat" className="text-right">
              Time Format
            </Label>
            <div className="col-span-3 flex gap-2">
              <Button
                type="button"
                variant={localSettings.timeFormat === '12h' ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setLocalSettings({
                    ...localSettings,
                    timeFormat: '12h',
                  })
                }
                className="flex-1"
              >
                12 Hour
              </Button>
              <Button
                type="button"
                variant={localSettings.timeFormat === '24h' ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setLocalSettings({
                    ...localSettings,
                    timeFormat: '24h',
                  })
                }
                className="flex-1"
              >
                24 Hour
              </Button>
            </div>
          </div>

          {/* Auto Refresh */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="autoRefresh" className="text-right">
              Auto Refresh
            </Label>
            <div className="col-span-3">
              <Switch
                id="autoRefresh"
                checked={localSettings.autoRefresh}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    autoRefresh: checked,
                  })
                }
              />
            </div>
          </div>

          {/* Refresh Interval */}
          {localSettings.autoRefresh && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="refreshInterval" className="text-right">
                Interval (min)
              </Label>
              <Input
                id="refreshInterval"
                type="number"
                min={5}
                max={120}
                value={localSettings.refreshInterval}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    refreshInterval: parseInt(e.target.value) || 30,
                  })
                }
                className="col-span-3"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
