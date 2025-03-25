"use server";
import { firestore } from "@/utils/firebaseAdmin";

/**
 * 🔹 Fetch confirmed lottery entrants from "purchasedTickets" for yesterday.
 *   Ensures each document has a `tickets` array and that each ticket is a 3-digit string.
 */
export async function fetchConfirmedEntrants() {
  try {
    // Calculate yesterday's date range in UTC.
    const now = new Date();
    // Get today's UTC midnight.
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    // Get yesterday's date by subtracting one day.
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(todayUTC.getUTCDate() - 1);
    
    // Define start and end of yesterday in UTC.
    const startOfYesterday = new Date(Date.UTC(
      yesterdayUTC.getUTCFullYear(),
      yesterdayUTC.getUTCMonth(),
      yesterdayUTC.getUTCDate(), 0, 0, 0
    ));
    const endOfYesterday = new Date(Date.UTC(
      yesterdayUTC.getUTCFullYear(),
      yesterdayUTC.getUTCMonth(),
      yesterdayUTC.getUTCDate(), 23, 59, 59, 999
    ));
    
    // Convert date boundaries to ISO strings if your timestamp field is stored as a string.
    const startISO = startOfYesterday.toISOString();
    const endISO = endOfYesterday.toISOString();
    
    // Query "purchasedTickets" for documents with a timestamp within yesterday.
    const snapshot = await firestore.collection('purchasedTickets')
      .where('timestamp', '>=', startISO)
      .where('timestamp', '<=', endISO)
      .get();
    
    const entrants = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Ensure that 'tickets' is an array. Normalize each ticket to a 3-digit string.
      let tickets = [];
      if (Array.isArray(data.tickets)) {
        tickets = data.tickets.map(ticket => {
          if (typeof ticket === 'number') {
            return ticket.toString().padStart(3, '0');
          } else if (typeof ticket === 'string') {
            return ticket.padStart(3, '0');
          } else {
            return "";
          }
        });
      }
      
      entrants.push({ id: doc.id, ...data, tickets });
    });
    
    return entrants;
  } catch (error) {
    console.error("Error fetching confirmed entrants:", error);
    return [];
  }
}
