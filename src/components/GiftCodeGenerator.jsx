"use client";
import { useState } from "react";

const GiftCodeGenerator = () => {
  // Form fields
  const [giverUsername, setGiverUsername] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [reason, setReason] = useState("");
  const [ticketCount, setTicketCount] = useState("");

  // Once code is generated
  const [giftCode, setGiftCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [error, setError] = useState("");

  const reasons = [
    "Happy Birthday 🎂",
    "Happy Anniversary 💖",
    "Keep Creating – You're Awesome!🌟",
    "Congrats on Becoming a Dolphin 🐬",
    "Thank You for Supporting Me 🙏",
    "Supporting a Fellow Steemian 🤝",
    "Keep Going Strong 💪",
    "I felt you are lucky today 😄",
  ];

  async function handleGenerateGiftCode() {
    setLoading(true);
    setError("");
    try {
      const giver = giverUsername.trim().replace(/^@/, "");
      const recipient = recipientUsername.trim().replace(/^@/, "");
      const count = parseInt(ticketCount, 10);

      if (!giver || !recipient || !count || count <= 0) {
        setError("Please fill in all fields (and ensure ticket count is valid).");
        setLoading(false);
        return;
      }

      // 2) Send POST to /api/createGiftCode
      const res = await fetch("/api/createGiftCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giver,
          recipient,
          reason,
          ticketCount: count, // pass number of tickets
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // 3) Store the newly generated code
      setGiftCode(data.code);
    } catch (err) {
      console.error("❌ Error generating gift code:", err);
      setError("Something went wrong. Please try again later.");
    }
    setLoading(false);
  }

  function handleCopyCode() {
    if (!giftCode) return;
    navigator.clipboard.writeText(giftCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleCopyMemo() {
    if (!giftCode) return;
    const memo = `Gift ${giftCode}`;
    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  }

  return (
    <div className="mt-10 flex justify-center">
      <div className="bg-white/80 backdrop-blur-md border border-purple-200 p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h3 className="text-2xl font-bold text-purple-700 mb-4 text-center">
          🎁 Gift a Ticket
        </h3>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded-xl text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* Giver Username */}
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Your Steemit Username:
        </label>
        <input
          type="text"
          value={giverUsername}
          onChange={(e) => setGiverUsername(e.target.value)}
          className="w-full px-4 py-2 mt-1 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all mb-4"
          placeholder=""
        />

        {/* Recipient Username */}
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Recipient Username:
        </label>
        <input
          type="text"
          value={recipientUsername}
          onChange={(e) => setRecipientUsername(e.target.value)}
          className="w-full px-4 py-2 mt-1 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all mb-4"
          placeholder=""
        />

        {/* Reason Dropdown */}
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Reason for Gift:
        </label>

        <div className="relative mb-4">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="appearance-none w-full px-4 py-2 pr-10 mt-1 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">You're an Amazing Friend! 🎉</option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* ▼ Custom Dropdown Arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>


        {/* Ticket Count */}
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          How Many Tickets? (1 STEEM per ticket)
        </label>
        <input
          type="number"
          value={ticketCount}
          onChange={(e) => setTicketCount(e.target.value)}
          className="w-full px-4 py-2 mt-1 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all mb-4"
          placeholder="e.g. 5"
        />

        {/* Button to Generate Gift Code */}
        {!giftCode && (
          <button
            onClick={handleGenerateGiftCode}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg font-semibold tracking-wide transition-all w-full"
          >
            {loading ? "Generating..." : "Generate Gift Code & Payment Instructions"}
          </button>
        )}

        {/* If Gift Code is generated, display it + Payment instructions */}
        {giftCode && (
          <div className="animate-fade-in mt-4 text-center">

            {/* Updated Payment Instruction Box */}
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl shadow-sm text-left text-sm">
              <p className="text-base text-gray-700 mb-2 font-semibold">
                Now send <span className="text-purple-700">{ticketCount} STEEM</span> to <span className="font-bold">@winwithsteemit</span> and <span className="font-bold text-purple-700">copy the code as your memo</span>:
              </p>

              <p className="mb-2 text-gray-700">
                Memo: <span className="font-mono text-purple-700">Gift {giftCode}</span>
              </p>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow transition-all"
              >
                📋 {copiedCode ? "Code Copied!" : "Copy Code"}
              </button>

              <a
                href={`https://steemitwallet.com/@${giverUsername.trim().replace(/^@/, "")}/transfers`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 ml-3 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md shadow transition-all"
              >
                💰 Go to My Wallet
              </a>

              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Once we verify your payment, this code will be activated for <strong>{ticketCount}</strong> ticket(s).<br />
                We’ll also notify <strong>{recipientUsername.trim()}</strong> about this gift.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCodeGenerator;
