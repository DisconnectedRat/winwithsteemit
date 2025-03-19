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
      // Destructure transactions array from the API response
      const { transactions } = await fetchSteemTransactions();
      console.log("VerifyEntry received:", { transactions });
      
      // Clean the username (remove leading '@' if present) and compare in lower case
      const cleanedUsername = username.replace(/^@/, "").toLowerCase();
      
      const userEntry = transactions.find(
        (entry) => entry.username.toLowerCase() === cleanedUsername
      );
      
      if (userEntry) {
        setMessage(
          `✅ Thank you @${cleanedUsername} for purchasing tickets for today's draw! Your participation is recorded.`
        );
        onUserVerified(userEntry); // Call the provided function (default is no-op)
      } else {
        setMessage("❌ No valid transaction found for this username. Please check again!");
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
    </div>
  );
};

export default VerifyEntry;
