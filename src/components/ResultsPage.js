"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchSteemTransactions } from "@/utils/steemAPI";

const ResultsPage = () => {
  const [winningNumber, setWinningNumber] = useState(null);
  const [jackpot, setJackpot] = useState(50);
  const [winners, setWinners] = useState([]);
  const [pastResults, setPastResults] = useState([]);

  // ✅ Wrapped in useCallback to avoid unnecessary re-renders
  const generateWinningNumber = useCallback(async () => {
    const randomNumber = Math.floor(100 + Math.random() * 900).toString(); 
    setWinningNumber(randomNumber);
    await verifyWinners(randomNumber);
  }, [verifyWinners]); // 🔥 Ensures dependency tracking

  useEffect(() => {
    generateWinningNumber();
    fetchPastResults();
  }, [generateWinningNumber]); // ✅ useEffect listens for changes

  const verifyWinners = useCallback(async (winningNumber) => {
    const entrants = await fetchSteemTransactions(); // Fetch confirmed participants
    let jackpotWinners = [];
    let prizeDistribution = [];
    let newJackpot = jackpot;

    entrants.forEach((entry) => {
      const { username, tickets } = entry;
      tickets.forEach((ticket) => {
        let prize = 0;
        if (ticket === winningNumber) {
          prize = newJackpot;
          jackpotWinners.push(username);
        } else if (
          ticket[0] === winningNumber[0] && ticket[1] === winningNumber[1]
        ) {
          prize = 10;
        } else if (ticket[0] === winningNumber[0]) {
          prize = 5;
        } else if (winningNumber.includes(ticket[0])) {
          prize = 1;
        }
        if (prize > 0) {
          prizeDistribution.push({ username, ticket, prize });
        }
      });
    });

    // Handle Jackpot Split
    if (jackpotWinners.length > 0) {
      const splitPrize = newJackpot / jackpotWinners.length;
      prizeDistribution = prizeDistribution.map((entry) =>
        jackpotWinners.includes(entry.username)
          ? { ...entry, prize: splitPrize }
          : entry
      );
      newJackpot = 50; // Reset Jackpot if won
    } else if (newJackpot < 100) {
      newJackpot = Math.min(newJackpot * 1.1, 100); // Increase by 10% daily
    }
    
    setJackpot(newJackpot);
    setWinners(prizeDistribution);
  }, [jackpot]); // ✅ `jackpot` added as dependency

  const fetchPastResults = async () => {
    // Simulate fetching past results (Replace with backend logic)
    const mockResults = [
      { date: "Mar 10", number: "547", winner: "@alice", amount: "100 STEEM" },
      { date: "Mar 09", number: "362", winner: "@bob", amount: "50 STEEM" },
      { date: "Mar 08", number: "918", winner: "@charlie", amount: "40 STEEM" },
    ];
    setPastResults(mockResults);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center">🏆 Results Page</h2>
      <div className="text-center text-2xl my-4">
        <p>Winning Number: <span className="text-red-500 font-bold">{winningNumber}</span></p>
        <p>Total Jackpot: <span className="text-yellow-500 font-bold">{jackpot} STEEM</span></p>
      </div>
      <h3 className="text-xl font-semibold">🎉 Yesterday&apos; Winners</h3>
      <table className="table-auto w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Winner</th>
            <th className="border px-4 py-2">Winning #</th>
            <th className="border px-4 py-2">Amount Won</th>
          </tr>
        </thead>
        <tbody>
          {winners.length > 0 ? (
            winners.map((entry, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">@{entry.username}</td>
                <td className="border px-4 py-2">{entry.ticket}</td>
                <td className="border px-4 py-2">{entry.prize} STEEM</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border px-4 py-2 text-center">
                No winners today.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <h3 className="text-xl font-semibold mt-6">📜 Past Winning Numbers</h3>
      <table className="table-auto w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Winning #</th>
            <th className="border px-4 py-2">Top Winner</th>
            <th className="border px-4 py-2">Amount Won</th>
          </tr>
        </thead>
        <tbody>
          {pastResults.map((result, index) => (
            <tr key={index} className="text-center">
              <td className="border px-4 py-2">{result.date}</td>
              <td className="border px-4 py-2">{result.number}</td>
              <td className="border px-4 py-2">{result.winner}</td>
              <td className="border px-4 py-2">{result.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsPage;
