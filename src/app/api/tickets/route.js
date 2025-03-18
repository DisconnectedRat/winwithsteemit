import fs from "fs/promises";
import path from "path";

const PURCHASED_TICKETS_FILE = path.join(process.cwd(), "src/data/purchasedTickets.json");

// Ensure the file exists (same as before)
async function ensureFileExists() {
  try {
    await fs.access(PURCHASED_TICKETS_FILE);
  } catch {
    console.warn("⚠️ Ticket file missing. Creating new file...");
    await fs.mkdir(path.dirname(PURCHASED_TICKETS_FILE), { recursive: true });
    await fs.writeFile(PURCHASED_TICKETS_FILE, JSON.stringify([]));
  }
}

export async function GET(request) {
  try {
    await ensureFileExists();
    const data = await fs.readFile(PURCHASED_TICKETS_FILE, "utf8");
    const tickets = JSON.parse(data);

    const now = new Date();

    // Define the current UTC day's start and end:
    const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfTodayUTC = new Date(startOfTodayUTC.getTime() + 24 * 60 * 60 * 1000);

    // Filter tickets for the current 24-hour window:
    const todaysTickets = tickets.filter(ticket => {
      const ticketTime = new Date(ticket.timestamp);
      return ticketTime >= startOfTodayUTC && ticketTime < endOfTodayUTC;
    });

    // Cleanup: Remove tickets older than 3 days
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const cleanedTickets = tickets.filter(ticket => {
      const ticketTime = new Date(ticket.timestamp);
      return ticketTime >= threeDaysAgo;
    });

    // Persist the cleaned tickets back to the JSON file.
    await fs.writeFile(PURCHASED_TICKETS_FILE, JSON.stringify(cleanedTickets, null, 2));

    return new Response(JSON.stringify(todaysTickets), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching stored tickets:", error);
    return new Response(JSON.stringify({ error: "Error fetching stored tickets" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
