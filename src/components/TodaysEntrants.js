"use client";
import { useEffect, useState } from "react";
import { fetchSteemTransactions } from "@/utils/steemAPI";

const TodaysEntrants = () => {
  const [entrants, setEntrants] = useState([]);

  useEffect(() => {
    async function loadEntrants() {
      const validEntries = await fetchSteemTransactions();
      setEntrants(validEntries);
    }
    loadEntrants();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        📜 Today&apos;s Entrants
      </h2>
      <table className="w-full mt-4 border border-gray-300 rounded-lg overflow-hidden shadow-md">
        <thead>
          <tr className="bg-gray-700 text-white text-lg">
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Tickets Bought</th>
            <th className="border px-4 py-2">Memo</th>
          </tr>
        </thead>
        <tbody>
          {entrants.length > 0 ? (
            entrants.map((entry, index) => (
              <tr
                key={index}
                className="text-center bg-gray-50 hover:bg-gray-200 transition-all"
              >
                <td className="border px-4 py-2">@{entry.username}</td>
                <td className="border px-4 py-2">{entry.tickets}</td>
                <td className="border px-4 py-2">{entry.memo}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="3"
                className="border px-4 py-2 text-center text-gray-500"
              >
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
