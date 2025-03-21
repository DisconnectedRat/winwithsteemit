"use client";
import React, { useEffect, useState } from "react";

const ResultsPage = () => {
  const [winningNumber, setWinningNumber] = useState(null);
  const [jackpot, setJackpot] = useState(50); // Default 50 STEEM
  const [latestWinner, setLatestWinner] = useState(null);
  const [totalPrize, setTotalPrize] = useState(0);
  const [todaysWinners, setTodaysWinners] = useState([]);
  const [pastResults, setPastResults] = useState([]); // Ensures state is initialized

  // ✅ Fetch Winning Results
  const fetchWinningResults = async () => {
    try {
      // Fetch winning number
      const response = await fetch("/api/fetchWinningNumber");
      const data = await response.json();
      setWinningNumber(data?.winningNumber || null);

      // Fetch total prize distributed
      const prizeResponse = await fetch("/api/fetchTotalPrize");
      const prizeData = await prizeResponse.json();
      setTotalPrize(prizeData?.totalPrize || 0);

      // Fetch latest jackpot winner
      const jackpotResponse = await fetch("/api/fetchJackpotWinner");
      const jackpotData = await jackpotResponse.json();
      setLatestWinner(jackpotData?.jackpotWinner || null);

      // Fetch yesterday's winners
      const winnersResponse = await fetch("/api/fetchYesterdaysWinners");
      const winnersData = await winnersResponse.json();
      setTodaysWinners(winnersData?.yesterdayWinners || []);

      // Fetch past winning numbers and sort descending by date
      const pastResultsResponse = await fetch("/api/fetchPastWinningNumbers");
      const pastResultsData = await pastResultsResponse.json();
      const pastWinningNumbers = pastResultsData?.pastWinningNumbers || [];
      pastWinningNumbers.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPastResults(pastWinningNumbers);
    } catch (error) {
      console.error("❌ Error fetching results:", error);
    }
  };

  // ✅ Runs the function once when page loads
  useEffect(() => {
    fetchWinningResults();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center">🏆 Latest Lottery Results</h1>

      {/* Winning Number */}
      <div className="mt-6 flex justify-center">
        {winningNumber ? (
          <div className="bg-yellow-100 p-4 rounded-lg shadow-lg text-center">
            <h2 className="text-5xl font-extrabold text-blue-600 tracking-widest flex gap-2 justify-center">
              <span className="text-red-500 text-6xl">{winningNumber[0]}</span>
              {winningNumber.slice(1)}
            </h2>
            <p className="text-gray-700 font-medium mt-2">Winning Number</p>
          </div>
        ) : (
          <p className="text-gray-500 text-lg">No Winning Number Available</p>
        )}
      </div>

      {/* Total Prize Distributed & Latest Jackpot Winner */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-10">
        <div className="p-4 bg-gray-100 rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold">Total Prize Distributed</p>
          <p className="text-xl font-bold text-blue-500">{totalPrize} STEEM</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold">Latest Jackpot Winner</p>
          {latestWinner ? (
            <p className="text-xl font-bold text-blue-500">
              {latestWinner.username} - {latestWinner.amount} STEEM
            </p>
          ) : (
            <p className="text-gray-500">No Jackpot Winner Yet</p>
          )}
        </div>
      </div>

      {/* Yesterday's Winners */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">🎟️ Yesterday&apos;s Winners</h2>
        <table className="w-full mt-4 border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-gray-700 text-white text-lg">
              <th className="border px-4 py-2">Winner</th>
              <th className="border px-4 py-2">Winning Numbers</th>
              <th className="border px-4 py-2">Prize (STEEM)</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(todaysWinners) && todaysWinners.length > 0 ? (
              todaysWinners.map((winner, index) => (
                <tr key={index} className="text-center bg-gray-50 hover:bg-gray-200 transition-all">
                  <td className="border px-4 py-2">{winner?.username || "Unknown"}</td>
                  <td className="border px-4 py-2">{winner?.numbers?.join(", ") || "N/A"}</td>
                  <td className="border px-4 py-2 font-bold text-green-600">{winner?.prize || "0"} STEEM</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="border px-4 py-2 text-center text-gray-500">
                  No winners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Past Winning Numbers */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">📜 Past Winning Numbers</h2>
        <table className="w-full mt-4 border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-gray-700 text-white text-lg">
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Winning #</th>
              <th className="border px-4 py-2">Winner</th>
              <th className="border px-4 py-2">Amount Won</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(pastResults) && pastResults.length > 0 ? (
              pastResults.map((result, index) => (
                <tr key={index} className="text-center bg-gray-50 hover:bg-gray-200 transition-all">
                  <td className="border px-4 py-2">{result?.date || "N/A"}</td>
                  <td className="border px-4 py-2 font-bold text-blue-600">{result?.number || "000"}</td>
                  <td className="border px-4 py-2">{result?.winner || "No Winner"}</td>
                  <td className="border px-4 py-2 font-bold text-green-600">{result?.amount || "0 STEEM"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border px-4 py-2 text-center text-gray-500">
                  No past results available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsPage;
