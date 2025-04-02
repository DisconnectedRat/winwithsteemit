"use client";
import { useState, useEffect } from "react";
import NumberRoller from "@/components/NumberRoller";
import TopBuys from "@/components/TopBuys";
import CountdownTimer from "@/components/CountdownTimer";
import GiftCodeGenerator from "@/components/GiftCodeGenerator";

export default function HomePage() {
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [countdown, setCountdown] = useState(86400); // 24-hour timer

  // Format countdown time
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Handle Number Selection from Roller
  const handleNumberSelection = (numbers) => {
    setSelectedTickets((prev) => [...prev, numbers.join("")]);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="max-w-2xl w-full mx-auto bg-white p-6 mt-6 rounded-lg shadow-md">

        {/* 🎟️ Pick Your Numbers */}
        <NumberRoller onSelect={handleNumberSelection} />


        {/* 🎁 Gift a Ticket */}
        <GiftCodeGenerator />

        {/* ⏳ Next Draw Countdown - Bigger & Eye-catching */}
        <p className="text-6xl font-bold text-blue-700 tracking-wide">
        </p>
        <CountdownTimer />

        {/* 👥 Top Buyers Section - Improved Styling */}
        <div className="mt-5">
          <div className="overflow-hidden rounded-lg shadow-lg">
            <TopBuys />
          </div>
        </div>

        {/* 🌍 Footer Links */}
        <div className="mt-6 text-center border-t pt-4">
          <a
            href="https://steemit.com/winwithsteemit/@winwithsteemit/how-to-play-steemit-lottery-your-guide-to-winning-big"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mx-2"
          >
            How to Play
          </a>
          |
          <a
            href="https://steemit.com/winwithsteemit/@winwithsteemit/about-steemit-lottery-ticket-pick-your-lucky-number-and-win-big-on-steemit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mx-2"
          >
            About Ticket
          </a>
          |
          <a
            href="https://steemit.com/winwithsteemit/@winwithsteemit/winning-conditions-and-payment-structures"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mx-2"
          >
            Winning Condition
          </a>
        </div>


          {/* 💙 Credit Line */}
          <p className="mt-4 text-center text-sm text-gray-500">
            A cheesy masterpiece of luck and numbers ❤ by{" "}
            <a
              href="https://steemit.com/@disconnect/posts"
              className="text-blue-600 font-bold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              disconnected rat
            </a>
          </p>
        </div>
      </div>
    );
  }
