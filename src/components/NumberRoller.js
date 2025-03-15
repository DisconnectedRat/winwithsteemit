"use client";
import { useState } from "react";

const NumberRoller = ({ onSelect }) => {
  const numbers = [...Array(10).keys()];
  const [selectedNumbers, setSelectedNumbers] = useState([0, 0, 0]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);
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

// **Encrypt Memo & Calculate STEEM**
const handleConfirmPurchase = () => {
  if (selectedTickets.length === 0) return;

  const firstTicket = parseInt(selectedTickets[0]); // Convert to number
  const totalSTEEM = selectedTickets.length; // Total STEEM required
  const todayDate = new Date().toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD format

  // **Encrypt Memo using multiplication**
  const encryptedNumber = firstTicket * totalSTEEM * parseInt(todayDate);

  // **Ensure memo starts with "Lottery" for API tracking**
  const finalMemo = `Lottery ${encryptedNumber}`;

  setMemo(finalMemo); // Store updated memo
  setIsConfirmed(true);
};

  // **Copy Memo to Clipboard**
  const copyMemoToClipboard = () => {
    const memo = generateMemo();
    if (!memo) return;
    navigator.clipboard.writeText(memo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };  

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4">Pick Your Numbers</h2>

      {/* **Number Roller** */}
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
                  index === 0
                    ? "text-red-500 text-4xl"
                    : "text-black text-4xl"
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

      {/* **SELECT Button** */}
      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        onClick={confirmSelection}
      >
        SELECT
      </button>

      {/* **Selected Tickets** */}
      <p className="mt-4 font-bold">🎟️ Selected Ticket Numbers:</p>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {selectedTickets.map((ticket, index) => (
          <span key={index} className="bg-gray-800 text-white px-2 py-1 rounded">
            {ticket}
          </span>
        ))}
      </div>

      {/* **Confirm & Purchase Button** */}
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

      {/* **Payment Instructions** */}
      {isConfirmed && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <p className="font-bold">💰 Payment Instructions:</p>
          <p>
            Send <strong>{selectedTickets.length} STEEM</strong> to{" "}
            <strong>@{lotteryAccount}</strong> with the memo: 
            Once your payment is completed, check the 
            <strong>“Today’s Entrants”</strong> page to ensure your 
            transaction and ticket numbers are recorded.
          </p>
          <div className="flex mt-2">
            <input
              type="text"
              value={memo}
              readOnly
              className="border px-2 py-1 flex-1"
            />
            <button
              className="bg-blue-500 text-white px-2 py-1 ml-2 rounded"
              onClick={copyMemoToClipboard}
            >
              {copied ? "Copied!" : "Copy Memo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberRoller;
