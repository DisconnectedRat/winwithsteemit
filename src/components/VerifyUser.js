"use client";
import { useState, useEffect } from "react";
import { useTicket } from "@/context/TicketContext";

const VerifyUser = ({ onUserVerified = () => {} }) => {
  const { memo } = useTicket(); // Only get memo now
  const [localUsername, setLocalUsername] = useState(""); // Use only local state
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const cleanUsername = localUsername.replace(/^@/, "").toLowerCase().trim();
    if (!cleanUsername) {
      setMessage("❌ Please enter a valid Steemit username.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await fetch("/api/verifyPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername }), // ✅ This is the real user input
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ Thank you @${cleanUsername}, your payment was verified!`);
        onUserVerified(result); // optional callback
      } else {
        setMessage("❌ No payment found with that memo and username.");
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setMessage("⚠️ Server error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-xl font-bold mb-4">🔍 Verify Your Lottery Entry</h2>
      <input
        type="text"
        value={localUsername}
        onChange={(e) => setLocalUsername(e.target.value)}
        placeholder="@yourusername"
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

export default VerifyUser;
