"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const TopBuys = () => {
  const [topBuyers, setTopBuyers] = useState([]);

  useEffect(() => {
    async function loadTopBuyers() {
      try {
        const res = await axios.get("/api/fetchTopBuyers");
        setTopBuyers(res.data.topBuyers || []);
      } catch (error) {
        console.error("Failed to load top buyers:", error);
      }
    }
    loadTopBuyers();
  }, []);

  return (
    <div className="mt-6 text-center">
      <h2 className="text-xl font-bold mb-2 text-gray-800">👥 Top Buys</h2>
      <table className="w-full border-collapse border border-gray-300 mx-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-800 px-4 py-2">User</th>
            <th className="border border-gray-800 px-4 py-2">Tickets Bought</th>
          </tr>
        </thead>
        <tbody>
          {topBuyers.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-gray-500 py-4">No data available</td>
            </tr>
          ) : (
            topBuyers.map((buyer, index) => (
              <tr key={index} className="border-b">
                <td className="border border-gray-800 px-4 py-2">@{buyer.username}</td>
                <td className="border border-gray-800 px-4 py-2">{buyer.tickets}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopBuys;
