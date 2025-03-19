"use client";
import { useState } from "react";
import { fetchSteemTransactions } from "@/utils/steemAPI";

const VerifyEntry = ({ onUserVerified = () => {} }) => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!username.trim()) {
      setMessage("❌ Please enter a valid Steemit username.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      // Fetch recent transactions from our custom API route
      const response = await fetchSteemTransactions();
      console.log("VerifyEntry received:", response);

      if (!response || !response.transactions) {
        throw new Error("Response does not contain transactions.");
      }

      const { transactions } = response;
      const cleanedUsername = username.replace(/^@/, "").toLowerCase();

      // Get current time and cutoff (24 hours ago)
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Filter transactions to include only those within the last 24 hours
      const recentTransactions = transactions.filter(tx => {
        const txTime = new Date(tx.timestamp);
        return txTime >= cutoff;
      });

      const userEntry = recentTransactions.find(
        (entry) => entry.username.toLowerCase() === cleanedUsername
      );

      if (userEntry) {
        setMessage(
          `✅ Thank you @${cleanedUsername} for purchasing tickets for today's draw! Your participation is recorded.`
        );

        // Prepare ticket data to store in Firestore
        // Here, we assume that ticket details (like ticket numbers) are generated
        // and stored by your NumberRoller component. Adjust as needed.
        const ticketData = {
          username: cleanedUsername,
          // Example: using the memo from the transaction to extract ticket number(s)
          tickets: [userEntry.memo.replace(/^Lottery\s/, "")],
          memo: userEntry.memo,
          timestamp: new Date().toISOString(),
        };

        // Call the /api/storeTicket endpoint to save the ticket
        const storeResponse = await fetch("/api/storeTicket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketData),
        });
        const storeResult = await storeResponse.json();
        if (storeResult.success) {
          console.log("Ticket stored successfully:", storeResult.message);
        } else {
          console.error("Failed to store ticket:", storeResult.error);
        }
        
        // Notify parent to update the Confirmed Participants table
        onUserVerified(userEntry);
      } else {
        setMessage("❌ No valid transaction found for this username in the last 24 hours. Please check again!");
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setMessage("⚠️ Error fetching transactions. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-xl font-bold mb-4">🔍 Verify Your Lottery Entry</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your Steemit username"
        className="border p-2 rounded w-64 text-center"
      />
      <button
        onClick={handleVerify}
        className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        disabled={loading}
      >
        {loading ? "Checking..." : "Verify Entry"}
      </button>
      {message && <p className="mt-4 text-lg">{message}</p>}
      <p className="mt-2 text-sm text-gray-600">
        Note: Very recent transactions might take up to 30 seconds to appear.
      </p>
    </div>
  );
};

export default VerifyEntry;
