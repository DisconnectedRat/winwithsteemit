"use client";
import { useEffect, useState } from "react";

const EntrantsList = () => {
  const [entrants, setEntrants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const today = new Date().toISOString().split("T")[0];

          const filtered = data.filter((entry) => {
            const isToday = entry.timestamp && entry.timestamp.startsWith(today);
            const isValid = entry.isValid === true;
            return isToday && isValid;
          });

          setEntrants(filtered);
        } else {
          setEntrants([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stored tickets:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <table className="table-auto w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Tickets Bought</th>
            <th className="border px-4 py-2">Ticket Numbers</th>
            <th className="border px-4 py-2">Memo</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="border px-4 py-2 text-center">Loading...</td>
            </tr>
          ) : entrants.length > 0 ? (
            entrants.map((entry, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">@{entry.username}</td>
                <td className="border px-4 py-2">
                  {entry.ticketsBought !== undefined
                    ? entry.ticketsBought
                    : Array.isArray(entry.tickets)
                    ? entry.tickets.length
                    : 0}
                </td>
                <td className="border px-4 py-2">
                  {entry.ticketNumbers !== undefined
                    ? entry.ticketNumbers
                    : Array.isArray(entry.tickets)
                    ? entry.tickets.join(", ")
                    : "N/A"}
                </td>
                <td className="border px-4 py-2">{entry.memo}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border px-4 py-2 text-center">
                No confirmed entries yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EntrantsList;
