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
    <div className="text-lg font-bold text-center text-gray-800">
      ⏳ Next Draw in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
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
