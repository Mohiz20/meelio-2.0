import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/shallow";
import { useDockStore } from "../../../stores/dock.store";
import { useCalendarStore } from "../../../stores/calendar.store";
import type { CalendarEvent } from "../../../types/calendar.types";
import { getCalendarColor } from "../../../utils/calendar-colors";
import {
  getEventStartDate,
  getEventEndDate,
  isEventHappening,
  isAllDayEvent,
  isEventToday,
} from "../../../utils/calendar-date.utils";
import {
  Copy,
  Bell,
  Share,
  ChevronDown,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const GoogleCalendarIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z" />
  </svg>
);
import { toast } from "sonner";

export const CalendarSheet = () => {
  const { t } = useTranslation();
  const [urlInput, setUrlInput] = useState("");
  const { isCalendarVisible, setCalendarVisible } = useDockStore(
    useShallow((state) => ({
      isCalendarVisible: state.isCalendarVisible,
      setCalendarVisible: state.setCalendarVisible,
    })),
  );
  const {
    icsUrl,
    events,
    loading,
    error,
    setIcsUrl,
    clearCalendar,
    loadEvents,
  } = useCalendarStore(
    useShallow((state) => ({
      icsUrl: state.icsUrl,
      events: state.events,
      loading: state.loading,
      error: state.error,
      setIcsUrl: state.setIcsUrl,
      clearCalendar: state.clearCalendar,
      loadEvents: state.loadEvents,
    })),
  );

  const isConnected = !!icsUrl;

  useEffect(() => {
    if (isCalendarVisible && icsUrl) {
      loadEvents(true);
    }
  }, [isCalendarVisible, icsUrl, loadEvents]);

  const formatTimeRemaining = (event: CalendarEvent): string => {
    try {
      const now = new Date();
      const eventStart = getEventStartDate(event);
      const eventEnd = getEventEndDate(event);

      if (isAllDayEvent(event)) {
        if (isEventHappening(event, now)) {
          return "All day";
        }
        const startDiffMs = eventStart.getTime() - now.getTime();
        const days = Math.floor(startDiffMs / (1000 * 60 * 60 * 24));
        if (days === 0) return "Today";
        if (days === 1) return "Tomorrow";
        return `${days} days remaining`;
      }

      if (isEventHappening(event, now)) {
        const endDiffMs = eventEnd.getTime() - now.getTime();
        const endMinutes = Math.floor(endDiffMs / (1000 * 60));

        if (endMinutes <= 0) return "Ending now";
        if (endMinutes < 60) return `${endMinutes} minutes left`;

        const endHours = Math.floor(endMinutes / 60);
        return `${endHours} hours left`;
      }

      const startDiffMs = eventStart.getTime() - now.getTime();

      if (startDiffMs <= 0) return "Now";

      const minutes = Math.floor(startDiffMs / (1000 * 60));
      if (minutes < 60) return `${minutes} minutes remaining`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hours remaining`;

      const days = Math.floor(hours / 24);
      return `${days} days remaining`;
    } catch (error) {
      console.error("Error formatting time remaining:", error);
      return "Time unknown";
    }
  };

  const formatEventTime = (event: CalendarEvent): string => {
    try {
      const start = getEventStartDate(event);
      const end = getEventEndDate(event);

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      };

      const formatDate = (date: Date) => {
        return date.toLocaleDateString([], {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
      };

      if (isAllDayEvent(event)) {
        const startDate = formatDate(start);
        const endDate = formatDate(end);

        if (start.toDateString() === end.toDateString()) {
          return `${startDate} • All day`;
        }

        return `${startDate} – ${endDate}`;
      }

      if (start.toDateString() === end.toDateString()) {
        return `${formatDate(start)} • ${formatTime(start)} – ${formatTime(end)}`;
      }

      return `${formatDate(start)} ${formatTime(start)} – ${formatDate(end)} ${formatTime(end)}`;
    } catch (error) {
      console.error("Error formatting event time:", error);
      return "Time unavailable";
    }
  };

  const copyMeetingLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    toast.success(
      t("calendar.sheet.meetingLinkCopied", {
        defaultValue: "Meeting link copied",
      }),
    );
  };

  const getMeetingLink = (event: CalendarEvent): string | null => {
    if (event.hangoutLink) {
      return event.hangoutLink;
    }

    if (event.conferenceData?.entryPoints?.length) {
      const videoEntry = event.conferenceData.entryPoints.find(
        (entry) => entry.entryPointType === "video",
      );
      if (videoEntry?.uri) {
        return videoEntry.uri;
      }
      return event.conferenceData.entryPoints[0].uri;
    }

    return null;
  };

  const categorizeEvents = () => {
    const now = new Date();
    const happeningNow: CalendarEvent[] = [];
    const today: CalendarEvent[] = [];
    const upcoming: CalendarEvent[] = [];

    events.forEach((event) => {
      try {
        const eventEnd = getEventEndDate(event);

        if (eventEnd <= now) return;

        if (isEventHappening(event, now)) {
          happeningNow.push(event);
        } else if (isEventToday(event, now)) {
          today.push(event);
        } else {
          upcoming.push(event);
        }
      } catch (error) {
        console.error("Error categorizing event:", error);
      }
    });

    const sortByStart = (a: CalendarEvent, b: CalendarEvent) => {
      try {
        return getEventStartDate(a).getTime() - getEventStartDate(b).getTime();
      } catch {
        return 0;
      }
    };

    return {
      happeningNow: happeningNow.sort(sortByStart),
      today: today.sort(sortByStart),
      upcoming: upcoming.sort(sortByStart).slice(0, 10),
    };
  };

  const handleConnect = async () => {
    if (!urlInput.trim()) return;
    await setIcsUrl(urlInput.trim());
    setUrlInput("");
  };

  const handleDisconnect = () => {
    clearCalendar();
  };

  const handleRefresh = () => {
    loadEvents(true);
  };

  return (
    <Sheet open={isCalendarVisible} onOpenChange={setCalendarVisible}>
      <SheetContent
        side="right"
        className="flex flex-col gap-4 p-6 sm:max-w-sm"
      >
        <SheetHeader>
          <SheetTitle>
            {t("calendar.sheet.title", { defaultValue: "Calendar" })}
          </SheetTitle>
        </SheetHeader>

        {isConnected ? (
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground flex-1">
                {t("calendar.sheet.connected", { defaultValue: "Connected" })}
              </span>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                tabIndex={-1}
                onClick={handleDisconnect}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("calendar.sheet.disconnect", { defaultValue: "Disconnect" })}
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-500 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <EventsList
              categorizeEvents={categorizeEvents}
              formatEventTime={formatEventTime}
              formatTimeRemaining={formatTimeRemaining}
              getMeetingLink={getMeetingLink}
              copyMeetingLink={copyMeetingLink}
              getCalendarColor={getCalendarColor}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center py-4">
              <GoogleCalendarIcon className="size-12 mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                {t("calendar.sheet.connectTitle", {
                  defaultValue: "Connect Your Calendar",
                })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("calendar.sheet.connectSubtitle", {
                  defaultValue: "View your events right from your new tab",
                })}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("calendar.sheet.howToConnect", {
                  defaultValue: "How to get your ICS URL",
                })}
              </p>
              <div className="space-y-2">
                <div className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className="flex-shrink-0 size-5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold flex items-center justify-center">
                    1
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {t("calendar.sheet.step1", {
                      defaultValue: "Open Google Calendar settings",
                    })}
                  </p>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className="flex-shrink-0 size-5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold flex items-center justify-center">
                    2
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {t("calendar.sheet.step2", {
                      defaultValue: "Select your calendar → Integrate calendar",
                    })}
                  </p>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className="flex-shrink-0 size-5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold flex items-center justify-center">
                    3
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {t("calendar.sheet.step3", {
                      defaultValue: 'Copy "Secret address in iCal format"',
                    })}
                  </p>
                </div>
              </div>
              <a
                href="https://calendar.google.com/calendar/r/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="size-3" />
                {t("calendar.sheet.openSettings", {
                  defaultValue: "Open Google Calendar Settings",
                })}
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <Input
                placeholder="https://calendar.google.com/calendar/ical/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="text-sm"
              />
              <Button
                onClick={handleConnect}
                disabled={loading || !urlInput.trim()}
              >
                {loading
                  ? t("common.loading", { defaultValue: "Loading..." })
                  : t("calendar.sheet.connect", {
                      defaultValue: "Connect Calendar",
                    })}
              </Button>
            </div>

            {error && (
              <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                {error}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

interface EventsListProps {
  categorizeEvents: () => {
    happeningNow: CalendarEvent[];
    today: CalendarEvent[];
    upcoming: CalendarEvent[];
  };
  formatEventTime: (event: CalendarEvent) => string;
  formatTimeRemaining: (event: CalendarEvent) => string;
  getMeetingLink: (event: CalendarEvent) => string | null;
  copyMeetingLink: (link: string) => Promise<void>;
  getCalendarColor: (colorId?: string) => string;
}

const EventsList: React.FC<EventsListProps> = ({
  categorizeEvents,
  formatEventTime,
  formatTimeRemaining,
  getMeetingLink,
  copyMeetingLink,
  getCalendarColor,
}) => {
  const { t } = useTranslation();
  const { happeningNow, today, upcoming } = categorizeEvents();
  const [happeningNowOpen, setHappeningNowOpen] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(false);

  const totalEvents = happeningNow.length + today.length + upcoming.length;

  if (totalEvents === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <GoogleCalendarIcon className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          {t("calendar.sheet.noEvents", { defaultValue: "No upcoming events" })}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {t("calendar.sheet.noEventsHint", {
            defaultValue: "Your schedule is clear",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
      {happeningNow.length > 0 && (
        <Collapsible open={happeningNowOpen} onOpenChange={setHappeningNowOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <span className="text-sm font-semibold text-card-foreground">
              {t("calendar.sheet.happeningNow", {
                defaultValue: "Happening Now",
              })}{" "}
              ({happeningNow.length})
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                happeningNowOpen ? "transform rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-3 mt-2">
            {happeningNow.map((event) => (
              <CompactEventCard
                key={event.id}
                event={event}
                formatTimeRemaining={formatTimeRemaining}
                getMeetingLink={getMeetingLink}
                getCalendarColor={getCalendarColor}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {today.length > 0 && (
        <div>
          <div className="flex items-center justify-between w-full p-2">
            <span className="text-sm font-semibold text-card-foreground">
              {t("calendar.sheet.today", { defaultValue: "Today" })} (
              {today.length})
            </span>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            {today.map((event) => (
              <FullEventCard
                key={event.id}
                event={event}
                formatEventTime={formatEventTime}
                formatTimeRemaining={formatTimeRemaining}
                getMeetingLink={getMeetingLink}
                copyMeetingLink={copyMeetingLink}
                getCalendarColor={getCalendarColor}
              />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <Collapsible open={upcomingOpen} onOpenChange={setUpcomingOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <span className="text-sm font-semibold text-card-foreground">
              {t("calendar.sheet.upcoming", { defaultValue: "Upcoming" })} (
              {upcoming.length})
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                upcomingOpen ? "transform rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-4 mt-2">
            {upcoming.map((event) => (
              <FullEventCard
                key={event.id}
                event={event}
                formatEventTime={formatEventTime}
                formatTimeRemaining={formatTimeRemaining}
                getMeetingLink={getMeetingLink}
                copyMeetingLink={copyMeetingLink}
                getCalendarColor={getCalendarColor}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

interface CompactEventCardProps {
  event: CalendarEvent;
  formatTimeRemaining: (event: CalendarEvent) => string;
  getMeetingLink: (event: CalendarEvent) => string | null;
  getCalendarColor: (colorId?: string) => string;
}

const CompactEventCard: React.FC<CompactEventCardProps> = ({
  event,
  formatTimeRemaining,
  getMeetingLink,
  getCalendarColor,
}) => {
  const eventColor = getCalendarColor(event.colorId);
  const meetingLink = getMeetingLink(event);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="size-2.5 rounded-full flex-shrink-0 animate-pulse"
          style={{ backgroundColor: eventColor }}
        />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h4 className="text-sm font-medium text-card-foreground truncate">
            {event.summary || "Untitled Event"}
          </h4>
          <span className="text-xs text-muted-foreground">
            {formatTimeRemaining(event)}
          </span>
        </div>
      </div>
      {meetingLink && (
        <Button
          size="sm"
          className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full flex-shrink-0"
          onClick={() => window.open(meetingLink, "_blank")}
        >
          <Share className="w-3 h-3 mr-1" />
          Join
        </Button>
      )}
    </div>
  );
};

interface FullEventCardProps {
  event: CalendarEvent;
  formatEventTime: (event: CalendarEvent) => string;
  formatTimeRemaining: (event: CalendarEvent) => string;
  getMeetingLink: (event: CalendarEvent) => string | null;
  copyMeetingLink: (link: string) => Promise<void>;
  getCalendarColor: (colorId?: string) => string;
}

const FullEventCard: React.FC<FullEventCardProps> = ({
  event,
  formatEventTime,
  formatTimeRemaining,
  getMeetingLink,
  copyMeetingLink,
  getCalendarColor,
}) => {
  const eventColor = getCalendarColor(event.colorId);
  const meetingLink = getMeetingLink(event);

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-card border border-border/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="size-3 rounded-md flex-shrink-0"
            style={{ backgroundColor: eventColor }}
          />
          <h4 className="text-sm font-semibold text-card-foreground truncate">
            {event.summary || "Untitled Event"}
          </h4>
        </div>
        {meetingLink && (
          <Button
            size="sm"
            className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            onClick={() => window.open(meetingLink, "_blank")}
          >
            <Share className="w-3 h-3 mr-1" />
            Join
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{formatEventTime(event)}</p>

      {meetingLink && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground font-mono truncate flex-1">
            {meetingLink.replace("https://", "")}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={() => copyMeetingLink(meetingLink)}
            title="Copy meeting link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Bell className="w-4 h-4" />
        <span>{formatTimeRemaining(event)}</span>
      </div>
    </div>
  );
};
