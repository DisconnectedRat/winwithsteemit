"use client";
import { useState } from "react";

const VerifyUser = ({ onUserVerified = () => {} }) => {
  const [localUsername, setLocalUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tries, setTries] = useState(0);
  const [retrying, setRetrying] = useState(false);

  const verifyPayment = async (username) => {
    try {
      const response = await fetch("/api/verifyPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const result = await response.json();
      return result;
    } catch (err) {
      console.error("Verify error:", err);
      return { success: false, error: "Server error" };
    }
  };

  const handleVerify = async () => {
    if (!localUsername.trim()) {
      setMessage("❌ Please enter a valid Steemit username.");
      return;
    }

    const cleanUsername = localUsername.replace(/^@/, "").toLowerCase();
    setLoading(true);
    setMessage("⏳ Thank you! Your ticket has been submitted. We’re verifying your payment. It may take up to 5 minutes to confirm on the blockchain.");

    let attempts = 0;
    const maxTries = 10;
    const interval = 30000; // 30 seconds

    const pollVerification = async () => {
      const result = await verifyPayment(cleanUsername);
      if (result.success) {
        setMessage(`✅ Thank you @${cleanUsername}, your payment has been verified!`);
        onUserVerified({ username: cleanUsername });
        setLoading(false);
        return;
      } else {
        attempts++;
        if (attempts < maxTries) {
          setTimeout(pollVerification, interval);
        } else {
          setMessage("❌ Timed out. Please try again later.");
          setLoading(false);
        }
      }
    };

    pollVerification();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-2 text-white">🔍 Verify Your Lottery Entry</h2>
      <input
        type="text"
        value={localUsername}
        onChange={(e) => setLocalUsername(e.target.value)}
        placeholder="Enter your username"
        className="border px-3 py-2 rounded-md w-72 text-center mb-2 text-gray-200"
        disabled={loading}
      />
      <br />
      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Verifying..." : "Verify Entry"}
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default VerifyUser;
