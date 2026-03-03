import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import { useShallow } from "zustand/shallow";
import { useDockStore } from "../../../stores/dock.store";
import { useDawlancePortalStore } from "../../../stores/dawlance-portal.store";
import { RefreshCw, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingsDialog, WorkHoursProgress } from "./components";

export function DawlancePortalSheet() {
  const { isDawlancePortalVisible, setDawlancePortalVisible } = useDockStore(
    useShallow((state) => ({
      isDawlancePortalVisible: state.isDawlancePortalVisible,
      setDawlancePortalVisible: state.setDawlancePortalVisible,
    }))
  );

  const { data, isLoading, isFetching, fetchData, settings } = useDawlancePortalStore(
    useShallow((state) => ({
      data: state.data,
      isLoading: state.isLoading,
      isFetching: state.isFetching,
      fetchData: state.fetchData,
      settings: state.settings,
    }))
  );

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Listen for auto-refresh messages from background script
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === 'refreshDawlancePortal') {
        console.log('Auto-refresh triggered by background script');
        fetchData();
      }
    };

    chrome?.runtime?.onMessage.addListener(handleMessage);

    return () => {
      chrome?.runtime?.onMessage.removeListener(handleMessage);
    };
  }, [fetchData]);

  const formatTime = (time: string | null) => {
    if (!time) return "N/A";

    if (settings.timeFormat === '12h') {
      // Convert 24h to 12h format
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${hour12}:${minutes} ${period}`;
    }

    return time; // 24h format
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const hasData = data.lastUpdated !== null || data.checkinTime !== null || data.error;

  return (
    <Sheet open={isDawlancePortalVisible} onOpenChange={setDawlancePortalVisible}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-black/40 backdrop-blur-xl border-white/10">
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10 pointer-events-none" />

        {/* Content with relative positioning */}
        <div className="relative z-10">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle>Dawlance Portal Dashboard</SheetTitle>
                <SheetDescription>
                  Track your attendance, work hours, and leave balance
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="h-8 w-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

        {!hasData ? (
          // Show login prompt when no data
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-orange-500/10 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-12 w-12 text-orange-500"
              >
                <path
                  opacity=".5"
                  d="M3 10a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-9Z"
                />
                <path d="M8 21a1 1 0 0 1-1-1v-9a1 1 0 0 1 2 0v9a1 1 0 0 1-1 1Zm8 0a1 1 0 0 1-1-1v-9a1 1 0 0 1 2 0v9a1 1 0 0 1-1 1Z" />
                <path
                  opacity=".75"
                  d="M13.488 3.43a1.5 1.5 0 0 0-2.976 0l-.429 3h3.834l-.429-3Z"
                />
                <path d="M4 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">
              {chrome?.tabs ? "Login Required" : "Extension Only Feature"}
            </h3>
            <p className="text-center text-sm text-white/60 max-w-sm">
              {chrome?.tabs
                ? "Please log in to the Dawlance Portal to view your attendance and leave information."
                : "This feature is only available in the Meelio browser extension. Please use the extension version to access Dawlance Portal integration."
              }
            </p>
            {chrome?.tabs && (
              <>
                <a
                  href="https://dawlancelive.intelliversal.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  Open Dawlance Portal
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <p className="text-xs text-white/40 text-center max-w-sm">
                  After logging in, click the refresh button to fetch your data.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {/* Check-in Status Section */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-sm font-semibold">Check-in Status</h3>
              {data.error ? (
                <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-500">
                  {data.error === "LOGIN_REQUIRED" ? (
                    <>
                      <p className="font-medium">Login Required</p>
                      <p className="mt-1 text-xs">
                        Please log in to the{" "}
                        <a
                          href="https://dawlancelive.intelliversal.net"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Dawlance Portal
                        </a>
                      </p>
                    </>
                  ) : data.error.includes("browser extension") ? (
                    <>
                      <p className="font-medium">Extension Only</p>
                      <p className="mt-1 text-xs">
                        {data.error}
                      </p>
                    </>
                  ) : (
                    <p>{data.error}</p>
                  )}
                </div>
              ) : data.checkinTime ? (
                <div className="rounded-md bg-green-500/10 p-3">
                  <p className="text-sm font-medium text-green-500">Checked In</p>
                  <p className="mt-1 text-2xl font-bold">{formatTime(data.checkinTime)}</p>
                  {data.checkoutTime && (
                    <p className="mt-2 text-sm text-white/60">
                      Checkout: {formatTime(data.checkoutTime)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                  <p className="font-medium">Not Checked In</p>
                </div>
              )}
            </div>

            {/* Work Hours Progress */}
            <WorkHoursProgress data={data} />

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Attendance Mismatch</p>
                <p className="mt-2 text-2xl font-bold">{data.mismatchCount}</p>
                <div className="mt-2 text-xs text-white/40">
                  <p>Applied: {data.mismatchApplied}</p>
                  <p>Not Applied: {data.mismatchNotApplied}</p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Annual Leaves</p>
                <p className="mt-2 text-2xl font-bold">
                  {data.annualLeaves !== null ? `${data.annualLeaves}/${data.annualLeavesTotal}` : "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Sick Leaves</p>
                <p className="mt-2 text-2xl font-bold">
                  {data.sickLeaves !== null ? `${data.sickLeaves}/${data.sickLeavesTotal}` : "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Total Leaves</p>
                <p className="mt-2 text-2xl font-bold">
                  {data.leavesRemaining !== null ? data.leavesRemaining : "N/A"}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-xs text-white/40">
              Last updated: {formatDate(data.lastUpdated)}
            </div>
          </div>
        )}

        <SheetFooter className="flex-row gap-2">
          <Button
            onClick={fetchData}
            disabled={isFetching}
            className="flex-1"
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </SheetFooter>
        </div>
      </SheetContent>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </Sheet>
  );
}
