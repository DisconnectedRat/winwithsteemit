"use client";
import React, { useEffect, useState } from "react";

const ResultsPage = () => {
  const [winningNumber, setWinningNumber] = useState(null);
  const [jackpot, setJackpot] = useState(50);
  const [latestWinner, setLatestWinner] = useState(null);
  const [totalPrize, setTotalPrize] = useState(0);
  const [todaysWinnerData, setTodaysWinnerData] = useState(null);

const fetchTodaysWinner = async () => {
    try {
      const response = await fetch("/api/todaysWinner");
      const data = await response.json();
      setTodaysWinnerData(data?.winner || null);
    } catch (error) {
      console.error("Error fetching today's winner:", error);
    }
  };

  // 'todaysWinners' is used to display “today’s/yesterday’s winners” in the "Other Winners" section
  const [todaysWinners, setTodaysWinners] = useState([]);

  // Past winning numbers (separate data set)
  const [pastWinningNumbers, setPastWinningNumbers] = useState([]);

  // The main array of "pastWinners" from Firestore
  const [pastWinnerList, setPastWinnerList] = useState([]);

  // For searching, if needed
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination for Past Winner List
  const [currentWinnerPage, setCurrentWinnerPage] = useState(1);
  const winnersPerPage = 10;

  // ------------------------
  //  FETCH FUNCTIONS
  // ------------------------

  // 1) Overall winning results (number, totalPrize, jackpot, etc.)
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

      // Fetch “yesterday’s winners”
      const winnersResponse = await fetch("/api/fetchYesterdaysWinners");
      const winnersData = await winnersResponse.json();
      const sorted =
        winnersData?.yesterdayWinners?.sort((a, b) => b.prize - a.prize) || [];
      setTodaysWinners(sorted);

      console.log("🔥 Winners returned from API (Today/Yesterday):", sorted);
      
      // ✅ Fetch current jackpot from Firestore config
      const configRes = await fetch("/api/fetchDailyConfig");
      const configData = await configRes.json();
      if (configData?.jackpot !== undefined) setJackpot(configData.jackpot);
    } catch (error) {
      console.error("❌ Error fetching results:", error);
    }
  };

  // 2) Past winning numbers (if you want to show historical winningNumber docs)

  const fetchTopWinnersLast10Days = async () => {
    try {
      const response = await fetch("/api/topWinnersLast10Days");
      const data = await response.json();
  
      const sorted = (data?.topWinners || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
  
      setPastWinningNumbers(sorted);
    } catch (error) {
      console.error("Error fetching top winners:", error);
    }
  };
  
  

  // 3) Full past winners from Firestore
  const fetchPastWinnerList = async () => {
    try {
      const response = await fetch("/api/fetchPastWinnerList");
      const data = await response.json();
      setPastWinnerList(data?.pastWinnerList || []);
    } catch (error) {
      console.error("Error fetching past winner list:", error);
    }
  };

  // ------------------------
  //  USE EFFECTS
  // ------------------------
  useEffect(() => {
    fetchWinningResults();
    fetchTopWinnersLast10Days(); 
    fetchPastWinnerList();
    fetchTodaysWinner();
  }, []);

  useEffect(() => {
    console.log("🔥 Winners from API (UI):", todaysWinners);
  }, [todaysWinners]);

  // ------------------------
  //  DERIVED VALUES
  // ------------------------

  //
  // A) Sort 'pastWinnerList' to get Top 5 by 'amount'
  //
  const top5PastWinners = [...pastWinnerList]
    .filter((w) => w.winningTickets?.length > 0 && (w.amount || 0) > 0)
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 5);

  //
  // B) For today's/yesterday’s winners logic (already in your code):
  //
  const filteredWinners = [...todaysWinners].sort((a, b) => b.amount - a.amount);
  const todaysTop5Winners = filteredWinners.slice(0, 5);
  const todaysOtherWinners = filteredWinners.slice(5);

  //
  // C) Pagination for the entire 'pastWinnerList'
  //
  const indexOfLastWinner = currentWinnerPage * winnersPerPage;
  const indexOfFirstWinner = indexOfLastWinner - winnersPerPage;
  const currentWinners = pastWinnerList.slice(
    indexOfFirstWinner,
    indexOfLastWinner
  );
  const totalWinnerPages = Math.ceil(pastWinnerList.length / winnersPerPage);

  // ------------------------
  //  RENDER
  // ------------------------
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
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:gap-10 justify-center items-center">
        {/* Card #1 */}
        <div className="p-4 bg-gray-100 rounded-lg shadow-md text-center w-72">
          <p className="text-lg font-semibold text-black">Total Prize Distributed</p>
          <p className="text-xl font-bold text-blue-500">{totalPrize} STEEM</p>
        </div>

        {/* Card #2 (Jackpot) */}
        <div className="p-4 bg-yellow-100 rounded-lg shadow-md text-center w-72">
          <p className="text-lg font-semibold text-yellow-900">🎯 Current Jackpot</p>
          <p className="text-2xl font-extrabold text-red-600">{jackpot} STEEM</p>
        </div>

        {/* Card #3 (Latest Jackpot Winner) */}
        <div className="p-4 bg-gray-100 rounded-lg shadow-md text-center w-72">
          <p className="text-lg font-semibold text-black">Latest Jackpot Winner</p>
          {latestWinner ? (
            <p className="text-xl font-bold text-blue-500">
              {latestWinner.username} – {latestWinner.amount} STEEM
            </p>
          ) : (
            <p className="text-gray-500">No Jackpot Winner Yet</p>
          )}
        </div>
      </div>

      {/* 🔍 Search Bar (if needed) */}
      <div className="mt-10 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by username (e.g., john)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      {/* 
        🎖️ Top 5 Winners (ALL TIME from pastWinnerList) 
        using 'top5PastWinners'
      */}
      {top5PastWinners.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">🥇 Top 5 Winners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {top5PastWinners
            .map((winner, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 p-4 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xl text-blue-700">
                    @{winner.username}
                  </span>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    +{winner.amount || 0} STEEM
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">Winning Tickets:</p>
                <div className="flex flex-wrap gap-2">
                  {winner.winningTickets && winner.winningTickets.length > 0 ? (
                    winner.winningTickets.map((ticket, i) => (
                      <span
                        key={i}
                        className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                      >
                        {ticket}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No Winning Tickets</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎟️ Other Winners (from your 'todaysWinners') */}
      {todaysOtherWinners.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">🎟️ Other Winners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {todaysOtherWinners.map((winner, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-600 font-semibold">
                    @{winner.username}
                  </span>
                  <span className="text-green-600 font-medium text-sm">
                    +{winner.prize} STEEM
                  </span>
                </div>
                <p className="text-sm text-gray-600">🎯 Numbers:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {winner.numbers?.length > 0 ? (
                    winner.numbers.map((num, i) => (
                      <span
                        key={i}
                        className="bg-gray-200 text-sm text-gray-800 px-2 py-1 rounded"
                      >
                        {num}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-red-400">No Winning Tickets</span>
                  )}
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

      {/* 🏅 Past Winner List with Pagination */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">🏅 Today&apos;s Winner List</h2>
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-gray-700 text-white text-lg">
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Ticket Number</th>
              <th className="border px-4 py-2">Amount Won</th>
            </tr>
          </thead>
          <tbody>
            {currentWinners && currentWinners.length > 0 ? (
              [...currentWinners]
              .sort((a, b) => (b.amount || 0) - (a.amount || 0))
              .map((winner, index) => (
                <tr
                  key={index}
                  className="text-center bg-gray-50 hover:bg-gray-200 transition-all"
                >
                  <td className="border px-4 py-2 text-gray-800">
                    {winner?.username || "No Username"}
                  </td>
                  <td className="border px-4 py-2 text-gray-800">
                    {Array.isArray(winner?.purchasedTickets) &&
                    winner.purchasedTickets.length > 0
                      ? winner.purchasedTickets.join(", ")
                      : "No Ticket"}
                  </td>
                  <td className="border px-4 py-2 font-bold">
                    {winner?.amount > 0 ? (
                      <span className="text-green-600">
                        {winner.amount} STEEM
                      </span>
                    ) : (
                      <span className="text-red-500">Better Luck for Today!</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="border px-4 py-2 text-center text-gray-500"
                >
                  No past winner records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentWinnerPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentWinnerPage === 1}
            className="mx-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-2">
            Page {currentWinnerPage} of {totalWinnerPages}
          </span>
          <button
            onClick={() =>
              setCurrentWinnerPage((prev) => Math.min(prev + 1, totalWinnerPages))
            }
            disabled={currentWinnerPage === totalWinnerPages}
            className="mx-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* 📜 Past Winning Numbers */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">📜 Past Winning Numbers</h2>
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-gray-700 text-white text-lg">
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Winning Number</th>
              <th className="border px-4 py-2">Winner of the Day</th>
              <th className="border px-4 py-2">Amount Won</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(pastWinningNumbers) && pastWinningNumbers.length > 0 ? (
              pastWinningNumbers.map((entry, index) => (
                <tr
                  key={index}
                  className="text-center bg-gray-50 hover:bg-gray-200 transition-all"
                >
                  <td className="border px-4 py-2 text-gray-800">{entry.date}</td>
                  <td className="border px-4 py-2 font-bold text-blue-600">
                    {entry.winningNumber}
                  </td>
                  <td className="border px-4 py-2 text-gray-800">@{entry.winner}</td>
                  <td className="border px-4 py-2 font-bold text-green-600">
                    {entry.amount} STEEM
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border px-4 py-2 text-center text-gray-500">
                  No winning results available.
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
