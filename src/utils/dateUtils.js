export function getTodayDateUTC() {
    const now = new Date();
  
    // Converts to ISO string like "2025-04-02T00:00:00.000Z", then extracts the date part
    return now.toISOString().split("T")[0]; // returns: "2025-04-02"
  }
  