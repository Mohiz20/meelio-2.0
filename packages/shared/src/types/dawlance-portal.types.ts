export interface DawlancePortalData {
  checkinTime: string | null;
  checkoutTime: string | null;
  mismatchCount: number;
  mismatchApplied: number;
  mismatchNotApplied: number;
  annualLeaves: number | null;
  annualLeavesTotal: number | null;
  sickLeaves: number | null;
  sickLeavesTotal: number | null;
  leavesRemaining: number | null;
  lastUpdated: number | null;
  error?: 'LOGIN_REQUIRED' | string;
}

export interface DawlancePortalSettings {
  workHours: number;
  breakStart: string;
  breakEnd: string;
  showBreak: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  timeFormat: '12h' | '24h';
}

export interface DawlancePortalStore {
  data: DawlancePortalData;
  settings: DawlancePortalSettings;
  isLoading: boolean;
  isFetching: boolean;

  // Actions
  fetchData: () => Promise<void>;
  updateSettings: (settings: Partial<DawlancePortalSettings>) => void;
  resetSettings: () => void;
  clearData: () => void;
}

export const DEFAULT_DAWLANCE_PORTAL_DATA: DawlancePortalData = {
  checkinTime: null,
  checkoutTime: null,
  mismatchCount: 0,
  mismatchApplied: 0,
  mismatchNotApplied: 0,
  annualLeaves: null,
  annualLeavesTotal: null,
  sickLeaves: null,
  sickLeavesTotal: null,
  leavesRemaining: null,
  lastUpdated: null,
};

export const DEFAULT_DAWLANCE_PORTAL_SETTINGS: DawlancePortalSettings = {
  workHours: 9,
  breakStart: '13:00',
  breakEnd: '14:00',
  showBreak: true,
  autoRefresh: true,
  refreshInterval: 30,
  timeFormat: '12h',
};
