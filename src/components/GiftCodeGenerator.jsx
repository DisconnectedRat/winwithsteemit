"use client";
import { useState } from "react";

const GiftCodeGenerator = () => {
  const [giftCode, setGiftCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    setLoading(true);
    const code = `gift_${Date.now().toString().slice(-6)}`;
    setGiftCode(code);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(giftCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-10 flex justify-center">
      <div className="bg-white/80 backdrop-blur-md border border-purple-200 p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h3 className="text-2xl font-bold text-purple-700 mb-2">🎁 Gift a Ticket</h3>
        <p className="text-gray-600 mb-4">
          Coming Soon – This feature is currently in development
        </p>

        {giftCode ? (
          <div className="animate-fade-in flex flex-col items-center gap-3">
            <p className="text-lg font-mono bg-gray-900 text-white px-4 py-2 rounded-lg shadow-inner">
              {giftCode}
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
              onClick={handleCopy}
            >
              📋 {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
        ) : (
          <button
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg font-semibold tracking-wide transition-all"
            onClick={handleGenerateCode}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Gift Code"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GiftCodeGenerator;
