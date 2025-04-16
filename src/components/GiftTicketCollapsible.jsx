import { useState } from "react";
import GiftCodeGenerator from "./GiftCodeGenerator";

export default function GiftTicketCollapsible() {
  const [hasClicked, setHasClicked] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      {/* Show the Gift Card only before click */}
      {!hasClicked ? (
        <div className="bg-white border border-purple-200 shadow-lg rounded-2xl px-6 py-6 text-center animate-fade-in">
          <h3 className="text-2xl font-bold text-purple-700 mb-2">🎁 Gift a Ticket</h3>
          <p className="text-gray-600 mb-4">
            Send a surprise ticket to your beloved friends. Just one click away!
          </p>

          <button
            onClick={() => setHasClicked(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-md font-semibold transition-all"
          >
            Generate Gift Code
          </button>
        </div>
      ) : (
        // Show the actual gift form (only after clicking)
        <div className="animate-fade-in">
          <GiftCodeGenerator />
        </div>
      )}
    </div>
  );
}
