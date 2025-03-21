"use client";
import React, { useEffect, useState } from "react";

export default function WinnersPage() {
  const [entrants, setEntrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEntrants() {
      try {
        const response = await fetch("/api/fetchConfirmedEntrants");
        if (!response.ok) {
          throw new Error("Failed to fetch confirmed entrants");
        }
        const data = await response.json();
        // Assuming the API returns { confirmedEntrants: [...] }
        setEntrants(data.confirmedEntrants || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEntrants();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Confirmed Entrants (Yesterday`&apos;s Winners)</h1>
      {entrants.length === 0 ? (
        <p>No entrants found for yesterday.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">User</th>
              <th className="border border-gray-300 p-2">Memo</th>
              <th className="border border-gray-300 p-2">Tickets Bought</th>
              <th className="border border-gray-300 p-2">Ticket Numbers</th>
              <th className="border border-gray-300 p-2">Winning Prize (STEEM)</th>
            </tr>
          </thead>
          <tbody>
            {entrants.map((entrant, index) => (
              <tr key={entrant.id || index} className="text-center hover:bg-gray-100 transition">
                <td className="border border-gray-300 p-2">{entrant.username}</td>
                <td className="border border-gray-300 p-2">{entrant.memo}</td>
                <td className="border border-gray-300 p-2">{entrant.tickets ? entrant.tickets.length : 0}</td>
                <td className="border border-gray-300 p-2">
                  {entrant.tickets ? entrant.tickets.join(", ") : "N/A"}
                </td>
                <td className="border border-gray-300 p-2">{entrant.winningPrize || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
