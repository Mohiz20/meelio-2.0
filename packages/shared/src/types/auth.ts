export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  autoStart: boolean;
  autoBlock: boolean;
  soundOn: boolean;
  notificationSoundId?: string;
  notificationSoundEnabled: boolean;
  dailyFocusLimit: number;
}

export interface UserSettings {
  pomodoro: PomodoroSettings;
  onboardingCompleted: boolean;
}

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  createdAt: number;
  settings?: UserSettings;
};
