import type { DawlancePortalData } from "../types/dawlance-portal.types";

interface ScrapeResult {
  type: "attendance_log" | "attendance" | "leaves";
  error?: string;
  message?: string;
  scraped?: boolean;
  timestamp?: number;

  // Attendance log fields
  checkinTime?: string | null;
  checkoutTime?: string | null;

  // Attendance fields
  mismatchCount?: number;
  mismatchApplied?: number;
  mismatchNotApplied?: number;

  // Leaves fields
  annualLeaves?: number | null;
  sickLeaves?: number | null;
  annualLeavesTotal?: number | null;
  sickLeavesTotal?: number | null;
  leavesRemaining?: number | null;
}

export class DawlancePortalService {
  private static readonly BASE_URL = "https://dawlancelive.intelliversal.net";
  private static readonly PAGES = {
    attendanceLog: "/my/attendance/log",
    attendance: "/my/attendance",
    leaves: "/my/leaves"
  } as const;

  /**
   * Fetch all data from the Dawlance portal
   */
  static async fetchAllData(): Promise<Partial<DawlancePortalData>> {
    try {
      console.log("Starting Dawlance Portal data fetch...");

      // Check if running in extension context
      if (!chrome?.tabs) {
        console.warn("Dawlance Portal: Not running in extension context. Chrome tabs API not available.");
        return {
          lastUpdated: Date.now(),
          error: "This feature is only available in the browser extension, not the web app."
        };
      }

      // Scrape data from all three pages with individual error handling
      console.log("Fetching attendance log...");
      const attendanceLogData = await this.scrapeAttendanceLog().catch(err => {
        console.error("Attendance log scrape failed:", err);
        return {
          type: "attendance_log" as const,
          error: err.message || "Failed to scrape attendance log"
        };
      });
      console.log("Attendance log result:", attendanceLogData);

      console.log("Fetching attendance data...");
      const attendanceData = await this.scrapeAttendance().catch(err => {
        console.error("Attendance scrape failed:", err);
        return {
          type: "attendance" as const,
          error: err.message || "Failed to scrape attendance"
        };
      });
      console.log("Attendance result:", attendanceData);

      console.log("Fetching leaves data...");
      const leavesData = await this.scrapeLeaves().catch(err => {
        console.error("Leaves scrape failed:", err);
        return {
          type: "leaves" as const,
          error: err.message || "Failed to scrape leaves"
        };
      });
      console.log("Leaves result:", leavesData);

      // Aggregate results
      const result: Partial<DawlancePortalData> = {
        lastUpdated: Date.now()
      };

      // Process attendance log data (check-in/checkout)
      if (attendanceLogData.error === "LOGIN_REQUIRED") {
        result.error = "LOGIN_REQUIRED";
        return result;
      }
      if (attendanceLogData.error) {
        console.warn("Attendance log had error:", attendanceLogData.error);
      }
      if (attendanceLogData.scraped) {
        result.checkinTime = attendanceLogData.checkinTime || null;
        result.checkoutTime = attendanceLogData.checkoutTime || null;
      }

      // Process attendance data (mismatches)
      if (attendanceData.error === "LOGIN_REQUIRED") {
        result.error = "LOGIN_REQUIRED";
        return result;
      }
      if (attendanceData.error) {
        console.warn("Attendance had error:", attendanceData.error);
      }
      if (attendanceData.scraped) {
        result.mismatchCount = attendanceData.mismatchCount || 0;
        result.mismatchApplied = attendanceData.mismatchApplied || 0;
        result.mismatchNotApplied = attendanceData.mismatchNotApplied || 0;
      }

      // Process leaves data
      if (leavesData.error === "LOGIN_REQUIRED") {
        result.error = "LOGIN_REQUIRED";
        return result;
      }
      if (leavesData.error) {
        console.warn("Leaves had error:", leavesData.error);
      }
      if (leavesData.scraped) {
        result.annualLeaves = leavesData.annualLeaves;
        result.annualLeavesTotal = leavesData.annualLeavesTotal;
        result.sickLeaves = leavesData.sickLeaves;
        result.sickLeavesTotal = leavesData.sickLeavesTotal;
        result.leavesRemaining = leavesData.leavesRemaining;
      }

      console.log("Dawlance Portal data fetch complete:", result);
      return result;
    } catch (error) {
      console.error("Failed to fetch Dawlance Portal data:", error);
      throw error;
    }
  }

  /**
   * Scrape attendance log page (check-in/checkout times)
   */
  private static async scrapeAttendanceLog(): Promise<ScrapeResult> {
    const url = `${this.BASE_URL}${this.PAGES.attendanceLog}`;
    return this.scrapePageWithTab(url);
  }

  /**
   * Scrape attendance page (mismatch data)
   */
  private static async scrapeAttendance(): Promise<ScrapeResult> {
    const url = `${this.BASE_URL}${this.PAGES.attendance}`;
    return this.scrapePageWithTab(url);
  }

  /**
   * Scrape leaves page (leave balances)
   */
  private static async scrapeLeaves(): Promise<ScrapeResult> {
    const url = `${this.BASE_URL}${this.PAGES.leaves}`;
    return this.scrapePageWithTab(url);
  }

  /**
   * Open a tab in the background, scrape data, and close it
   */
  private static async scrapePageWithTab(url: string): Promise<ScrapeResult> {
    console.log(`Opening tab for: ${url}`);
    return new Promise((resolve, reject) => {
      // Open tab in background
      chrome.tabs.create({ url, active: false }, (tab) => {
        if (!tab || !tab.id) {
          console.error("Failed to create tab");
          reject(new Error("Failed to create tab"));
          return;
        }

        const tabId = tab.id;
        console.log(`Tab created with ID: ${tabId}`);
        let resolved = false;

        // Set timeout for scraping
        const timeout = setTimeout(() => {
          if (!resolved) {
            console.error(`Scraping timeout for tab ${tabId}`);
            resolved = true;
            chrome.tabs.remove(tabId).catch(() => {});
            reject(new Error("Scraping timeout"));
          }
        }, 15000); // 15 second timeout

        // Listen for tab load completion
        const listener = (
          updatedTabId: number,
          changeInfo: chrome.tabs.TabChangeInfo
        ) => {
          if (updatedTabId === tabId && changeInfo.status === "complete") {
            console.log(`Tab ${tabId} loaded, waiting for page to render...`);
            // Wait a bit for page to fully render
            setTimeout(() => {
              console.log(`Sending scrape message to tab ${tabId}...`);
              // Send message to content script to scrape
              chrome.tabs
                .sendMessage(tabId, { action: "scrapeData" })
                .then((response: ScrapeResult) => {
                  if (!resolved) {
                    console.log(`Received response from tab ${tabId}:`, response);
                    resolved = true;
                    clearTimeout(timeout);
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.remove(tabId).catch(() => {});
                    resolve(response);
                  }
                })
                .catch((error) => {
                  if (!resolved) {
                    console.error(`Error sending message to tab ${tabId}:`, error);
                    resolved = true;
                    clearTimeout(timeout);
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.remove(tabId).catch(() => {});
                    reject(error);
                  }
                });
            }, 3000); // Wait 3 seconds for page to fully render
          }
        };

        chrome.tabs.onUpdated.addListener(listener);
      });
    });
  }

  /**
   * Check if user is logged into the portal
   */
  static async checkLoginStatus(): Promise<boolean> {
    try {
      const data = await this.scrapeAttendanceLog();
      return data.error !== "LOGIN_REQUIRED";
    } catch (error) {
      return false;
    }
  }
}
