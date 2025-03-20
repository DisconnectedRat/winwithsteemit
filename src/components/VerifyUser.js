"use client";
import { useState, useEffect } from "react";
import { fetchSteemTransactions } from "@/utils/steemAPI";

const VerifyUser = ({
  username = "",
  onUsernameChange = () => {},
  selectedTickets = [],
  memo = "",
  onUserVerified = () => {},
}) => {
  // Manage the username locally so the input is editable.
  const [localUsername, setLocalUsername] = useState(username);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // When the parent-provided username changes, update the local state.
  useEffect(() => {
    setLocalUsername(username);
  }, [username]);

  const handleVerify = async () => {
    if (!localUsername.trim()) {
      setMessage("❌ Please enter a valid Steemit username.");
      return;
    }
    if (selectedTickets.length === 0 || !memo) {
      setMessage("❌ Ticket details are missing. Please complete ticket selection.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      // In this revised flow, we immediately combine the data and store it,
      // without waiting for the Steemit transaction check.
      const ticketsBought = selectedTickets.length;
      const ticketNumbers = selectedTickets.join(", ");
      const payload = {
        username: localUsername.replace(/^@/, "").toLowerCase(),
        tickets: selectedTickets,
        ticketsBought,
        ticketNumbers,
        memo,
        timestamp: new Date().toISOString(),
        isValid: false, // Initially false; can be updated later if transaction is validated
      };

      const storeResponse = await fetch("/api/storeTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const storeResult = await storeResponse.json();
      if (storeResult.success) {
        setMessage(`✅ Thank you @${localUsername} for purchasing tickets. Your entry is recorded.`);
        onUserVerified(payload);
      } else {
        setMessage("❌ Failed to store your entry. Please try again.");
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setMessage("⚠️ Error storing your entry. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-xl font-bold mb-4">🔍 Verify Your Lottery Entry</h2>
      <input
        type="text"
        value={localUsername}
        onChange={(e) => {
          setLocalUsername(e.target.value);
          onUsernameChange(e.target.value);
        }}
        placeholder="Enter your Steemit username"
        className="border p-2 rounded w-64 text-center"
      />
      <button
        onClick={handleVerify}
        className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        disabled={loading}
      >
        {loading ? "Processing..." : "Verify Entry"}
      </button>
      {message && <p className="mt-4 text-lg">{message}</p>}
      <p className="mt-2 text-sm text-gray-600">
        Note: Very recent transactions might take up to 30 seconds to appear.
      </p>
    </div>
  );
};

export default VerifyUser;
