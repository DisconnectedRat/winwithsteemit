"use client";
import { useEffect, useState } from "react";
import { fetchSteemTransactions } from "@/utils/steemAPI";

const TodaysEntrants = () => {
  const [entrants, setEntrants] = useState([]); // Stores confirmed participants
  const [username, setUsername] = useState(""); // Stores input username
  const [message, setMessage] = useState(""); // Stores verification message

  useEffect(() => {
    async function loadEntrants() {
      const validEntries = await fetchSteemTransactions();
      setEntrants(validEntries);
    }
    loadEntrants();
  }, []);

  // **Handles User Transaction Verification**
  const handleVerifyPurchase = async () => {
    if (!username) {
      setMessage("❌ Please enter your Steemit username.");
      return;
    }

    const validEntries = await fetchSteemTransactions(); // Fetch all transactions
    const userEntry = validEntries.find(entry => entry.username === username);

    if (userEntry) {
      setMessage(`✅ Thank you for purchasing a ticket for ${new Date().toISOString().split("T")[0]} draw. Your participation is recorded below with your ticket numbers.`);
      setEntrants(prev => [...prev, userEntry]); // Adds user to the table
    } else {
      setMessage("❌ No valid transaction found for this username. Please check your payment details and try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">

      {/* Verification Message */}
      {message && <p className="text-lg font-semibold my-2">{message}</p>}

      {/* Entrants Table */}
      <table className="table-auto w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Tickets Bought</th>
            <th className="border px-4 py-2">Memo</th>
          </tr>
        </thead>
        <tbody>
          {entrants.length > 0 ? (
            entrants.map((entry, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">@{entry.username}</td>
                <td className="border px-4 py-2">{entry.tickets}</td>
                <td className="border px-4 py-2">{entry.memo}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border px-4 py-2 text-center">
                No confirmed entries yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TodaysEntrants;
