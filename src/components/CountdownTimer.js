"use client";
import { useState, useEffect } from "react";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextUTC());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextUTC());
    }, 1000);

    return () => clearInterval(timer); // ✅ Cleanup on unmount
  }, []); // ✅ No missing dependencies

  return (
    <div className="p-4 mt-6 text-lg font-bold text-center text-white bg-gradient-to-r from-blue-500 to-indigo-700 shadow-lg rounded-lg animate-pulse transition-all duration-500">
      <span className="inline-block animate-bounce">⏳</span> Next Draw in: 
      <span className="ml-2 text-yellow-300">{timeLeft.hours}h</span>
      <span className="ml-2 text-green-300">{timeLeft.minutes}m</span>
       <span className="ml-2 text-red-300">{timeLeft.seconds}s</span>
    </div>
  );
};

// ✅ Ensure function is defined
function getTimeUntilNextUTC() {
  const now = new Date();
  const nextDraw = new Date(now);
  nextDraw.setUTCHours(24, 0, 0, 0); // Set to next UTC 00:00
  const timeDiff = nextDraw - now;

  return {
    hours: Math.floor((timeDiff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((timeDiff / (1000 * 60)) % 60),
    seconds: Math.floor((timeDiff / 1000) % 60),
  };
}

function refreshEntrants() {
  console.log("Refreshing Today's Entrants list...");
  // Here, you can trigger a backend request to reload today's data
}

export default CountdownTimer;
