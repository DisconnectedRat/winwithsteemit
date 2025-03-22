"use client";
import { useState } from "react";
import { useTicket } from "@/context/TicketContext";

const NumberRoller = () => {
  const { setSelectedTickets, selectedTickets, setMemo } = useTicket();

  const [selectedNumbers, setSelectedNumbers] = useState([0, 0, 0]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [copyMemoText, setCopyMemoText] = useState("Copy Memo");
  const [copyAccountText, setCopyAccountText] = useState("Copy Account");
  const [memoGenerated, setMemoGenerated] = useState("");
  const [username, setUsername] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // ✅ prevent multiple submissions

  const lotteryAccount = "winwithsteemit";

  const handleNumberChange = (index, direction) => {
    setSelectedNumbers((prev) => {
      const newNumbers = [...prev];
      if (direction === "up") {
        newNumbers[index] = (newNumbers[index] - 1 + 10) % 10;
      } else {
        newNumbers[index] = (newNumbers[index] + 1) % 10;
      }
      return newNumbers;
    });
  };

  const confirmSelection = () => {
    const newTicket = selectedNumbers.join("");
    if (!selectedTickets.includes(newTicket) && selectedTickets.length < 100) {
      setSelectedTickets([...selectedTickets, newTicket]);
    }
  };

  const handleConfirmPurchase = () => {
    if (selectedTickets.length === 0) return;

    const firstTicket = parseInt(selectedTickets[0], 10);
    const totalSTEEM = selectedTickets.length;
    const todayDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const encryptedNumber = firstTicket * totalSTEEM * parseInt(todayDate, 10);
    const finalMemo = `Lottery ${encryptedNumber}`;

    setMemo(finalMemo);
    setMemoGenerated(finalMemo);
    setIsConfirmed(true);
  };

  const handleFinalSubmit = async () => {
    const cleanUsername = username.replace(/^@/, "").toLowerCase().trim();

    if (!cleanUsername) {
      setSubmitMessage("❌ Please enter a valid Steemit username.");
      return;
    }

    if (isSubmitted) {
      setSubmitMessage("✅ Your entry has already been submitted.");
      return;
    }

    try {
      const response = await fetch("/api/storeTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          tickets: selectedTickets,
          memo: memoGenerated,
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitMessage("success"); // Set flag instead of message
        setIsSubmitted(true);
      } else {
        setSubmitMessage("❌ Failed to store your entry. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error submitting ticket:", error);
      setSubmitMessage("⚠️ Error submitting your entry. Try again later.");
    }
  };

  const copyToClipboard = (text, setButtonText) => {
    navigator.clipboard.writeText(text).then(() => {
      setButtonText("Copied! ✅");
      setTimeout(() => setButtonText("Copy"), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-5">Pick Your Numbers</h2>

      {/* Number Roller */}
      <div className="flex space-x-6">
        {selectedNumbers.map((num, index) => (
          <div key={index} className="flex flex-col items-center space-y-1">
            <button
              className="px-2 py-1 bg-gray-300 rounded-full hover:bg-gray-400"
              onClick={() => handleNumberChange(index, "up")}
            >
              ▲
            </button>
            <div className="flex flex-col items-center w-16 h-24">
              <span className="text-gray-400 text-lg">{(num + 9) % 10}</span>
              <span className={`font-bold ${index === 0 ? "text-red-500 text-4xl" : "text-black text-4xl"}`}>
                {num}
              </span>
              <span className="text-gray-400 text-lg">{(num + 1) % 10}</span>
            </div>
            <button
              className="px-2 py-1 bg-gray-300 rounded-full hover:bg-gray-400"
              onClick={() => handleNumberChange(index, "down")}
            >
              ▼
            </button>
          </div>
        ))}
      </div>

      {/* SELECT Button */}
      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        onClick={confirmSelection}
      >
        SELECT
      </button>

      {/* Display Selected Tickets */}
      <p className="mt-4 font-bold">🎟️ Selected Ticket Numbers:</p>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {selectedTickets.map((ticket, index) => (
          <span key={index} className="bg-gray-800 text-white px-2 py-1 rounded">
            {ticket}
          </span>
        ))}
      </div>

      {/* Confirm & Purchase Button */}
      <button
        className={`mt-4 px-4 py-2 rounded-lg ${
          selectedTickets.length > 0
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
        onClick={handleConfirmPurchase}
        disabled={selectedTickets.length === 0}
      >
        Confirm & Purchase
      </button>

      {/* Payment Instructions */}
      {isConfirmed && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md w-full max-w-lg">
          <h3 className="text-lg font-bold text-gray-700 mb-2">💰 Payment Instructions:</h3>
          <p className="text-gray-600">
            Send <strong>{selectedTickets.length} STEEM</strong> to the <strong>{lotteryAccount}</strong> account via your wallet.
            Be sure to copy and paste your memo in the transfer.
          </p>

          {/* STEEM Account */}
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={lotteryAccount}
              readOnly
              className="border px-3 py-2 rounded-md w-full text-gray-700"
            />
            <button
              onClick={() => copyToClipboard(lotteryAccount, setCopyAccountText)}
              className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              {copyAccountText}
            </button>
          </div>

          {/* Memo */}
          <div className="mt-4">
            <p className="text-gray-600">Memo:</p>
            <div className="flex items-center">
              <input
                type="text"
                value={memoGenerated}
                readOnly
                className="border px-3 py-2 rounded-md w-full text-gray-700"
              />
              <button
                onClick={() => copyToClipboard(memoGenerated, setCopyMemoText)}
                className="ml-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                {copyMemoText}
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div className="mt-4">
            <label className="block text-gray-600 mb-1">Enter your Steemit username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@yourusername"
              className="w-full border px-3 py-2 rounded-md text-gray-700"
              disabled={isSubmitted}
            />
          </div>

          {/* Final Submit Button */}
          <button
            className={`mt-4 w-full py-2 rounded-md transition font-semibold ${
              isSubmitted
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
            onClick={handleFinalSubmit}
            disabled={isSubmitted}
          >
            {isSubmitted ? "✅ Submitted" : "Submit Entry"}
          </button>

          {/* Submission Message / Success */}
          {submitMessage === "success" ? (
            <div className="mt-4 text-center">
              <p className="text-green-700 font-semibold mb-2">
                 Thank you @{username.trim().replace(/^@/, "")}, your entry is recorded!
              </p>
              <a
                href="https://winwithsteemit.com/entrants"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                🔎 View My Entry on Today&apos;s Entrants Page
              </a>
            </div>
          ) : (
            submitMessage && (
              <p className="mt-3 text-center text-sm text-red-600">{submitMessage}</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default NumberRoller;
