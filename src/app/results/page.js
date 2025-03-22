"use client";
import React, { useEffect, useState } from "react";

const ResultsPage = () => {
  const [winningNumber, setWinningNumber] = useState(null);
  const [jackpot, setJackpot] = useState(50);
  const [latestWinner, setLatestWinner] = useState(null);
  const [totalPrize, setTotalPrize] = useState(0);
  const [todaysWinners, setTodaysWinners] = useState([]);
  const [pastResults, setPastResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWinningResults = async () => {
    try {
      const response = await fetch("/api/fetchWinningNumber");
      const data = await response.json();
      setWinningNumber(data?.winningNumber || null);

      const prizeResponse = await fetch("/api/fetchTotalPrize");
      const prizeData = await prizeResponse.json();
      setTotalPrize(prizeData?.totalPrize || 0);

      const jackpotResponse = await fetch("/api/fetchJackpotWinner");
      const jackpotData = await jackpotResponse.json();
      setLatestWinner(jackpotData?.jackpotWinner || null);

      const winnersResponse = await fetch("/api/fetchYesterdaysWinners");
      const winnersData = await winnersResponse.json();
      const sorted = winnersData?.yesterdayWinners?.sort((a, b) => b.prize - a.prize) || [];
      setTodaysWinners(sorted);
      console.log("🔥 Winners returned from API:", sorted);


      const pastResultsResponse = await fetch("/api/fetchPastWinningNumbers");
      const pastResultsData = await pastResultsResponse.json();
      const pastWinningNumbers = pastResultsData?.pastWinningNumbers || [];
      pastWinningNumbers.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPastResults(pastWinningNumbers);
    } catch (error) {
      console.error("❌ Error fetching results:", error);
    }
  };

  useEffect(() => {
    fetchWinningResults();
  }, []);

  useEffect(() => {
    console.log("🔥 Winners from API (UI):", todaysWinners);
  }, [todaysWinners]);

  // 🔍 Filter winners by search term
  const filteredWinners = todaysWinners; // 🔥 Show all winners (skip search filter for now) 

  const top5Winners = filteredWinners.slice(0, 5);
  const otherWinners = filteredWinners.slice(5);

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

      {/* Prize & Jackpot */}
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

      {/* 🔍 Search Bar */}
      <div className="mt-10 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by username (e.g., john)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      {/* 🎖️ Top 5 Leaderboard */}
      {top5Winners.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">🥇 Top 5 Winners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {top5Winners.map((winner, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 p-4 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xl text-blue-700">@{winner.username}</span>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    +{winner.prize} STEEM
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">Winning Numbers:</p>
                <div className="flex flex-wrap gap-2">
                  {winner.numbers?.map((num, i) => (
                    <span
                      key={i}
                      className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎟️ Other Winners */}
      {otherWinners.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">🎟️ Other Winners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherWinners.map((winner, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-600 font-semibold">@{winner.username}</span>
                  <span className="text-green-600 font-medium text-sm">+{winner.prize} STEEM</span>
                </div>
                <p className="text-sm text-gray-600">🎯 Numbers:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {winner.numbers?.map((num, i) => (
                    <span
                      key={i}
                      className="bg-gray-200 text-sm text-gray-800 px-2 py-1 rounded"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredWinners.length === 0 && (
        <div className="text-center text-gray-500 mt-6">
          No winners found with that username.
        </div>
      )}

      {/* 📜 Past Results */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">📜 Past Winning Numbers</h2>
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
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
                  <td className="border px-4 py-2 font-bold text-green-600">{result?.amount || "0"} STEEM</td>
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
