"use client";
import { useState } from "react";
import { fetchSteemTransactions } from "@/utils/steemAPI";

const VerifyUser = ({ username, onUsernameChange, onUserVerified = () => {} }) => {
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
      const response = await fetchSteemTransactions();
      console.log("VerifyUser received:", response);

      if (!response || !response.transactions) {
        throw new Error("Response does not contain transactions.");
      }

      const { transactions } = response;
      const cleanedUsername = username.replace(/^@/, "").toLowerCase();

      // Filter transactions within the last 24 hours
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentTransactions = transactions.filter(tx => {
        const txTime = new Date(tx.timestamp);
        return txTime >= cutoff;
      });

      const userEntry = recentTransactions.find(
        (entry) => entry.username.toLowerCase() === cleanedUsername
      );

      if (userEntry) {
        setMessage(`✅ Thank you @${cleanedUsername} for purchasing tickets for today's draw! Your participation is recorded.`);
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
        onChange={(e) => onUsernameChange(e.target.value)}
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

export default VerifyUser;
