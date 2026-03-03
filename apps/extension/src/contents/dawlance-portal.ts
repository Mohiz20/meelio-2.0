import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://dawlancelive.intelliversal.net/*"],
  run_at: "document_idle"
};

console.log("Dawlance Portal content script loaded on:", window.location.href);

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

// Listen for messages from background/service
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Dawlance Portal: Received message:", request);
  if (request.action === "scrapeData") {
    const data = scrapeCurrentPage();
    console.log("Dawlance Portal: Scraped data:", data);
    sendResponse(data);
  }
  return true;
});

function scrapeCurrentPage(): ScrapeResult {
  const url = window.location.href;
  console.log("Dawlance Portal: Scraping page:", url);

  if (url.includes("/my/attendance/log")) {
    console.log("Dawlance Portal: Detected attendance log page");
    return scrapeAttendanceLog();
  } else if (url.includes("/my/attendance")) {
    console.log("Dawlance Portal: Detected attendance page");
    return scrapeAttendance();
  } else if (url.includes("/my/leaves")) {
    console.log("Dawlance Portal: Detected leaves page");
    return scrapeLeaves();
  }

  console.log("Dawlance Portal: Unknown page type");
  return { type: "attendance_log", error: "Unknown page" };
}

function scrapeAttendanceLog(): ScrapeResult {
  try {
    // Check if login is required
    const bodyTextLower = document.body.textContent?.toLowerCase() || "";
    const bodyHTML = document.body.innerHTML.toLowerCase();

    if (
      bodyTextLower.includes("you need to log in") ||
      bodyTextLower.includes("please log in") ||
      bodyTextLower.includes("login required") ||
      bodyTextLower.includes("session expired") ||
      bodyHTML.includes('type="password"') ||
      bodyHTML.includes('name="password"') ||
      bodyHTML.includes('id="password"') ||
      bodyHTML.includes('class="login') ||
      bodyHTML.includes('id="login')
    ) {
      console.log("Login required detected in attendance log");
      return {
        type: "attendance_log",
        error: "LOGIN_REQUIRED",
        message: "Please log in to the portal first"
      };
    }

    // Look for today's attendance entry
    const today = new Date();
    const todayStr = formatDateForPortal(today);

    let checkinTime: string | null = null;
    let checkoutTime: string | null = null;

    // Method 1: Look for the specific format: "Wed-28-Jan-2026 09:12:58"
    const bodyText = document.body.textContent || "";
    const dateTimePattern = new RegExp(todayStr + "\\s+(\\d{2}):(\\d{2}):(\\d{2})", "g");
    const matches = [...bodyText.matchAll(dateTimePattern)];

    if (matches.length > 0) {
      checkinTime = `${matches[0][1]}:${matches[0][2]}`;
      if (matches.length > 1) {
        checkoutTime = `${matches[1][1]}:${matches[1][2]}`;
      }
    }

    // Method 2: Look in tables for today's date
    if (!checkinTime) {
      const tables = document.querySelectorAll("table");
      for (const table of tables) {
        const rows = table.querySelectorAll("tr");
        for (const row of rows) {
          const rowText = row.textContent || "";

          if (rowText.includes(todayStr) || isToday(rowText)) {
            const timeMatches = rowText.match(/(\d{2}):(\d{2}):(\d{2})/g);
            if (timeMatches && timeMatches.length > 0) {
              const [h, m] = timeMatches[0].split(":");
              checkinTime = `${h}:${m}`;
              if (timeMatches.length > 1) {
                const [h2, m2] = timeMatches[1].split(":");
                checkoutTime = `${h2}:${m2}`;
              }
            }
          }
        }
      }
    }

    return {
      type: "attendance_log",
      checkinTime,
      checkoutTime,
      scraped: true,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      type: "attendance_log",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function scrapeAttendance(): ScrapeResult {
  try {
    // Check if login is required
    const bodyText = document.body.textContent?.toLowerCase() || "";
    const bodyHTML = document.body.innerHTML.toLowerCase();

    if (
      bodyText.includes("you need to log in") ||
      bodyText.includes("please log in") ||
      bodyText.includes("login required") ||
      bodyText.includes("session expired") ||
      bodyHTML.includes('type="password"') ||
      bodyHTML.includes('name="password"') ||
      bodyHTML.includes('id="password"') ||
      bodyHTML.includes('class="login') ||
      bodyHTML.includes('id="login')
    ) {
      console.log("Login required detected in attendance page");
      return {
        type: "attendance",
        error: "LOGIN_REQUIRED",
        message: "Please log in to the portal first"
      };
    }

    let totalMismatch = 0;
    let mismatchRequested = 0;
    let mismatchNotRequested = 0;

    const tables = document.querySelectorAll("table");

    for (const table of tables) {
      const rows = table.querySelectorAll("tbody tr, tr");

      for (const row of rows) {
        const rowText = row.textContent?.toLowerCase() || "";

        if (
          rowText.includes("mismatch") ||
          rowText.includes("early out") ||
          rowText.includes("late in")
        ) {
          if (row.querySelector("th")) continue;

          totalMismatch++;

          const buttons = row.querySelectorAll("button, a, [class*='btn']");
          let foundButton = false;

          for (const btn of buttons) {
            const btnText = (btn.textContent || "").toLowerCase();
            if (btnText.includes("change request") || btnText.includes("request")) {
              foundButton = true;

              const computedStyle = window.getComputedStyle(btn);
              const bgColor = computedStyle.backgroundColor;
              const btnClass = (btn.className || "").toLowerCase();

              if (
                bgColor.includes("23, 162, 184") ||
                bgColor.includes("rgb(23") ||
                btnClass.includes("info") ||
                btnClass.includes("cyan") ||
                btnClass.includes("blue")
              ) {
                mismatchRequested++;
              } else {
                mismatchNotRequested++;
              }
              break;
            }
          }

          if (!foundButton) {
            mismatchNotRequested++;
          }
        }
      }

      if (totalMismatch > 0) break;
    }

    console.log("Mismatch scraping result:", {
      total: totalMismatch,
      requested: mismatchRequested,
      notRequested: mismatchNotRequested
    });

    return {
      type: "attendance",
      mismatchCount: totalMismatch,
      mismatchApplied: mismatchRequested,
      mismatchNotApplied: mismatchNotRequested,
      scraped: true,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Mismatch scraping error:", error);
    return {
      type: "attendance",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function scrapeLeaves(): ScrapeResult {
  try {
    console.log("Dawlance Portal: Starting scrapeLeaves");

    // Check if login is required
    const bodyText = document.body.textContent?.toLowerCase() || "";
    const bodyHTML = document.body.innerHTML.toLowerCase();

    if (
      bodyText.includes("you need to log in") ||
      bodyText.includes("please log in") ||
      bodyText.includes("login required") ||
      bodyText.includes("session expired") ||
      bodyHTML.includes('type="password"') ||
      bodyHTML.includes('name="password"') ||
      bodyHTML.includes('id="password"') ||
      bodyHTML.includes('class="login') ||
      bodyHTML.includes('id="login')
    ) {
      console.log("Login required detected in leaves page");
      return {
        type: "leaves",
        error: "LOGIN_REQUIRED",
        message: "Please log in to the portal first"
      };
    }

    let annualLeaves: number | null = null;
    let sickLeaves: number | null = null;
    let annualTotal: number | null = null;
    let sickTotal: number | null = null;

    // Method 1: Look for select dropdown with leave options
    // Format: "Annual Leaves (29 remaining out of 32 days)"
    const selects = document.querySelectorAll("select");
    console.log("Dawlance Portal: Found", selects.length, "select elements");

    for (const select of selects) {
      const options = select.querySelectorAll("option");
      console.log("Dawlance Portal: Checking select with", options.length, "options");

      for (const option of options) {
        const optionText = option.textContent || "";
        console.log("Dawlance Portal: Option text:", optionText);

        // Extract annual leaves - Format: "Annual Leaves (29 remaining out of 32 days)"
        const annualMatch = optionText.match(
          /Annual\s+Leaves\s*\((\d+(?:\.\d+)?)\s+remaining\s+out\s+of\s+(\d+(?:\.\d+)?)/i
        );
        if (annualMatch) {
          annualLeaves = parseFloat(annualMatch[1]);
          annualTotal = parseFloat(annualMatch[2]);
          console.log("Dawlance Portal: Found annual leaves:", annualLeaves, "/", annualTotal);
        }

        // Extract sick leaves - Format: "Sick Leaves (10 remaining out of 10 days)"
        const sickMatch = optionText.match(
          /Sick\s+Leaves\s*\((\d+(?:\.\d+)?)\s+remaining\s+out\s+of\s+(\d+(?:\.\d+)?)/i
        );
        if (sickMatch) {
          sickLeaves = parseFloat(sickMatch[1]);
          sickTotal = parseFloat(sickMatch[2]);
          console.log("Dawlance Portal: Found sick leaves:", sickLeaves, "/", sickTotal);
        }
      }
    }

    // Calculate total leaves
    const totalLeaves =
      annualLeaves !== null && sickLeaves !== null ? annualLeaves + sickLeaves : null;

    console.log("Dawlance Portal: Final leaves data:", {
      annualLeaves,
      annualTotal,
      sickLeaves,
      sickTotal,
      totalLeaves
    });

    return {
      type: "leaves",
      annualLeaves,
      sickLeaves,
      annualLeavesTotal: annualTotal,
      sickLeavesTotal: sickTotal,
      leavesRemaining: totalLeaves,
      scraped: true,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Dawlance Portal: Error in scrapeLeaves:", error);
    return {
      type: "leaves",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Helper functions
function formatDateForPortal(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}-${day}-${month}-${year}`;
}

function isToday(text: string): boolean {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const todayStr2 = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const todayStr3 = today.toISOString().split("T")[0];

  return text.includes(todayStr) || text.includes(todayStr2) || text.includes(todayStr3);
}

// Auto-store data when page loads
setTimeout(() => {
  const data = scrapeCurrentPage();
  if (data.scraped) {
    chrome.storage.local.get(["meelio:local:dawlance-portal"], (result) => {
      const stored = result["meelio:local:dawlance-portal"];
      if (stored) {
        const parsed = JSON.parse(stored);

        if (data.type === "attendance_log") {
          parsed.state.data.checkinTime = data.checkinTime;
          parsed.state.data.checkoutTime = data.checkoutTime;
        } else if (data.type === "attendance") {
          parsed.state.data.mismatchCount = data.mismatchCount;
          parsed.state.data.mismatchApplied = data.mismatchApplied;
          parsed.state.data.mismatchNotApplied = data.mismatchNotApplied;
        } else if (data.type === "leaves") {
          parsed.state.data.annualLeaves = data.annualLeaves;
          parsed.state.data.sickLeaves = data.sickLeaves;
          parsed.state.data.annualLeavesTotal = data.annualLeavesTotal;
          parsed.state.data.sickLeavesTotal = data.sickLeavesTotal;
          parsed.state.data.leavesRemaining = data.leavesRemaining;
        }

        parsed.state.data.lastUpdated = Date.now();

        chrome.storage.local.set({
          "meelio:local:dawlance-portal": JSON.stringify(parsed)
        });

        // Notify background that data was updated
        chrome.runtime.sendMessage({ action: "dataUpdated" }).catch(() => {});
      }
    });
  }
}, 3000);
