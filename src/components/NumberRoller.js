"use client";
import { useState } from "react";
import { useTicket } from "@/context/TicketContext";

const NumberRoller = () => {
  const { username, selectedTickets, setSelectedTickets, memo, setMemo } = useTicket();
  // Local state for selected numbers (roller values)
  const [selectedNumbers, setSelectedNumbers] = useState([0, 0, 0]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [copyMemoText, setCopyMemoText] = useState("Copy Memo");
  const [copyAccountText, setCopyAccountText] = useState("Copy Account");
  const lotteryAccount = "winwithsteemit"; // Steemit lottery account

  // Handle number selection
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

  // **Select Number & Add to Ticket List**
  const confirmSelection = () => {
    const newTicket = selectedNumbers.join("");
    if (!selectedTickets.includes(newTicket) && selectedTickets.length < 100) {
      setSelectedTickets([...selectedTickets, newTicket]);
    }
  };

  // **Encrypt Memo, Confirm Purchase & Store Ticket Data**
  const handleConfirmPurchase = async () => {
    if (selectedTickets.length === 0) return;

    // Generate memo using the existing logic
    const firstTicket = parseInt(selectedTickets[0], 10);
    const totalSTEEM = selectedTickets.length;
    const todayDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const encryptedNumber = firstTicket * totalSTEEM * parseInt(todayDate, 10);
    const finalMemo = `Lottery ${encryptedNumber}`;

    // Set memo in context and mark confirmation
    setMemo(finalMemo);
    setIsConfirmed(true);

    // Call the API endpoint to store ticket data with the dynamic username and ticket details
    try {
      await fetch("/api/storeTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,               // dynamic from context
          tickets: selectedTickets, // array of ticket numbers
          memo: finalMemo,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("❌ Error storing ticket data:", error);
    }
  };

  // **Copy Text to Clipboard Function**
  const copyToClipboard = (text, setButtonText) => {
    navigator.clipboard.writeText(text).then(() => {
      setButtonText("Copied! ✅");
      setTimeout(() => setButtonText("Copy"), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-5">Pick Your Numbers</h2>

      {/* Number Roller UI */}
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
              <span
                className={`font-bold ${
                  index === 0 ? "text-red-500 text-4xl" : "text-black text-4xl"
                }`}
              >
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

      {/* Payment Instructions - Only appear after Confirm & Purchase */}
      {isConfirmed && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-700 mb-2">💰 Payment Instructions:</h3>
          <p className="text-gray-600">
            Send <strong>{selectedTickets.length} STEEM</strong> to the <strong>{lotteryAccount}</strong> account via your wallet.
            Be sure to copy and paste your memo in the transfer. Once the payment is complete, verify your transaction on the{" "}
            <a
              href="https://winwithsteemit.com/entrants"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-bold hover:underline"
            >
              Today&apos;s Entrants
            </a>{" "}
            page.
          </p>
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
          <div className="mt-4">
            <p className="text-gray-600">Memo:</p>
            <div className="flex items-center">
              <input
                type="text"
                value={memo}
                readOnly
                className="border px-3 py-2 rounded-md w-full text-gray-700"
              />
              <button
                onClick={() => copyToClipboard(memo, setCopyMemoText)}
                className="ml-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                {copyMemoText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberRoller;
