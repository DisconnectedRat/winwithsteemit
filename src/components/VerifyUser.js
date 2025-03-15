"use client";
import { useState } from "react";
import { fetchSteemTransactions } from "@/utils/steemAPI";

const VerifyEntry = ({ onUserVerified }) => {
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
      const validEntries = await fetchSteemTransactions();
      const userEntry = validEntries.find((entry) => entry.username === `@${username}`);
      
      if (userEntry) {
        setMessage(`✅ Thank you @${username} for purchasing tickets for today's draw! Your participation is recorded.`);
        onUserVerified(userEntry); // Add user to Today's Entrants List
      } else {
        setMessage("❌ No valid transaction found for this username. Please check again!");
      }
    } catch (error) {
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
