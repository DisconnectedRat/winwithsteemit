"use client";
import { useState } from "react";

const VerifyUser = ({ onUserVerified = () => {} }) => {
  const [localUsername, setLocalUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!localUsername.trim()) {
      setMessage("❌ Please enter a valid Steemit username.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const cleanUsername = localUsername.replace(/^@/, "").toLowerCase();
      const response = await fetch("/api/verifyPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage(`✅ Thank you @${cleanUsername}, your payment has been verified!`);
        onUserVerified({ username: cleanUsername });
      } else {
        setMessage(`❌ ${result.error || "No payment found with that username."}`);
      }
    } catch (err) {
      console.error("Verify error:", err);
      setMessage("⚠️ Server error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-2">🔍 Verify Your Lottery Entry</h2>
      <input
        type="text"
        value={localUsername}
        onChange={(e) => setLocalUsername(e.target.value)}
        placeholder="@yourusername"
        className="border px-3 py-2 rounded-md w-72 text-center mb-2"
      />
      <br />
      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Verifying..." : "Verify Entry"}
      </button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
};

export default VerifyUser;
