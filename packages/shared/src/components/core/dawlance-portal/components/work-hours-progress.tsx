import { useEffect, useState } from "react";
import { useDawlancePortalStore } from "../../../../stores/dawlance-portal.store";
import { useShallow } from "zustand/shallow";
import type { DawlancePortalData } from "../../../../types/dawlance-portal.types";

interface WorkHoursProgressProps {
  data: DawlancePortalData;
}

export function WorkHoursProgress({ data }: WorkHoursProgressProps) {
  const { settings } = useDawlancePortalStore(
    useShallow((state) => ({
      settings: state.settings,
    }))
  );

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!data.checkinTime) {
    return null;
  }

  // Parse check-in time
  const [checkinHour, checkinMinute] = data.checkinTime.split(":").map(Number);
  const checkinDate = new Date();
  checkinDate.setHours(checkinHour, checkinMinute, 0, 0);

  // Calculate expected checkout time (handles decimal hours like 6.5)
  const expectedCheckoutDate = new Date(checkinDate);
  const workHoursInMs = settings.workHours * 60 * 60 * 1000;
  expectedCheckoutDate.setTime(checkinDate.getTime() + workHoursInMs);

  // Calculate break times
  const [breakStartHour, breakStartMinute] = settings.breakStart.split(":").map(Number);
  const [breakEndHour, breakEndMinute] = settings.breakEnd.split(":").map(Number);
  const breakStartDate = new Date();
  breakStartDate.setHours(breakStartHour, breakStartMinute, 0, 0);
  const breakEndDate = new Date();
  breakEndDate.setHours(breakEndHour, breakEndMinute, 0, 0);

  // Calculate elapsed time
  const elapsedMs = currentTime.getTime() - checkinDate.getTime();
  const elapsedHours = Math.floor(elapsedMs / 1000 / 60 / 60);
  const elapsedMinutes = Math.floor((elapsedMs / 1000 / 60) % 60);

  // Calculate remaining time
  const remainingMs = expectedCheckoutDate.getTime() - currentTime.getTime();
  const remainingHours = Math.floor(remainingMs / 1000 / 60 / 60);
  const remainingMinutes = Math.floor((remainingMs / 1000 / 60) % 60);

  // Calculate progress percentage
  const totalWorkMs = settings.workHours * 60 * 60 * 1000;
  const progressPercentage = Math.min((elapsedMs / totalWorkMs) * 100, 100);

  // Calculate break position and width
  const breakStartMs = breakStartDate.getTime() - checkinDate.getTime();
  const breakEndMs = breakEndDate.getTime() - checkinDate.getTime();
  const breakStartPercentage = Math.max(0, (breakStartMs / totalWorkMs) * 100);
  const breakWidthPercentage = Math.max(0, ((breakEndMs - breakStartMs) / totalWorkMs) * 100);

  // Calculate current time pointer position
  const currentTimePercentage = Math.min((elapsedMs / totalWorkMs) * 100, 100);

  // Check if overtime
  const isOvertime = remainingMs < 0;

  const formatDuration = (hours: number, minutes: number) => {
    return `${Math.abs(hours)}h ${Math.abs(minutes)}m`;
  };

  const formatTime = (time: string) => {
    if (settings.timeFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${hour12}:${minutes} ${period}`;
    }

    return time; // 24h format
  };

  const formatTimeOfDay = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (settings.timeFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-semibold">Work Hours Progress</h3>

      {/* Time Info */}
      <div className="mb-3 flex items-center justify-between text-xs text-white/60">
        <div>
          <span className="font-medium">Elapsed:</span> {formatDuration(elapsedHours, elapsedMinutes)}
        </div>
        <div>
          {isOvertime ? (
            <span className="font-medium text-red-400">
              Overtime: {formatDuration(Math.abs(remainingHours), Math.abs(remainingMinutes))}
            </span>
          ) : (
            <span>
              <span className="font-medium">Remaining:</span>{" "}
              {formatDuration(remainingHours, remainingMinutes)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-8 w-full overflow-hidden rounded-lg bg-white/5">
        {/* Progress Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Break Indicator */}
        {settings.showBreak && breakStartPercentage >= 0 && breakWidthPercentage > 0 && (
          <div
            className="absolute inset-y-0 bg-red-500/30"
            style={{
              left: `${breakStartPercentage}%`,
              width: `${breakWidthPercentage}%`,
            }}
          />
        )}

        {/* Current Time Pointer */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-lg transition-all duration-300"
          style={{ left: `${currentTimePercentage}%` }}
        />
      </div>

      {/* Time Labels */}
      <div className="mt-2 flex items-center justify-between text-xs text-white/40">
        <span>{formatTime(data.checkinTime)}</span>
        <span>{formatTimeOfDay(expectedCheckoutDate)}</span>
      </div>
    </div>
  );
}
