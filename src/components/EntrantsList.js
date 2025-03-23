"use client";
import { useEffect, useState } from "react";

const EntrantsList = () => {
  const [entrants, setEntrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEntrants = async () => {
      try {
        const res = await fetch("/api/tickets?today=true");
        const json = await res.json();
        console.log("🎟️ API Response:", json);

        if (json.success && Array.isArray(json.tickets)) {
          json.tickets.forEach((t, i) => {
            console.log(`🧾 Ticket ${i + 1}:`, {
              username: t.username,
              timestamp: t.timestamp,
              type: typeof t.timestamp,
              raw: t,
            });
          });
          setEntrants(json.tickets);
        } else {
          setEntrants([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setEntrants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrants();
  }, []);

  const filteredEntrants = entrants.filter((entry) =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        🎯 Confirmed Participants
      </h2>

      <div className="mb-4 flex justify-center">
        <input
          type="text"
          placeholder="Search by username..."
          className="border border-gray-300 rounded-md px-4 py-2 w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700">
              <th className="px-4 py-3 text-left font-semibold">👤 User</th>
              <th className="px-4 py-3 text-center font-semibold">No. of Tickets</th>
              <th className="px-4 py-3 text-center font-semibold">Ticket Numbers</th>
              <th className="px-4 py-3 text-center font-semibold">📝 Memo</th>
              <th className="px-4 py-3 text-center font-semibold">📌 Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  ⏳ Loading confirmed entries...
                </td>
              </tr>
            ) : filteredEntrants.length > 0 ? (
              filteredEntrants.map((entry, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">@{entry.username}</td>
                  <td className="px-4 py-3 text-center">
                    {entry.ticketsBought !== undefined
                      ? entry.ticketsBought
                      : Array.isArray(entry.tickets)
                      ? entry.tickets.length
                      : 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {entry.ticketNumbers !== undefined
                      ? entry.ticketNumbers
                      : Array.isArray(entry.tickets)
                      ? entry.tickets.join(", ")
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{entry.memo}</td>
                  <td className="px-4 py-3 text-center">
                    {entry.isValid ? (
                      <span className="text-green-600 font-bold">✅ Confirmed</span>
                    ) : (
                      <span className="text-yellow-500 font-semibold">⏳ Pending</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  😢 No confirmed entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntrantsList;
