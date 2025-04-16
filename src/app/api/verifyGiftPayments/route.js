// ✅ File: src/app/api/verifyGiftPayments/route.js

import { NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseAdmin";
import axios from "axios";

const STEEM_ACCOUNT = "winwithsteemit";
const MEMO_PREFIX = "Gift";
const GIFTCODE_COLLECTION = "giftCodes";

// 🔁 This API should be run every 6 hours via CRON
export async function GET() {
  try {
    console.log("🔍 Checking for unpaid gift codes...");

    // Step 1: Get unpaid gift codes
    const unpaidSnapshot = await firestore
      .collection(GIFTCODE_COLLECTION)
      .where("paid", "==", false)
      .get();

    if (unpaidSnapshot.empty) {
      console.log("✅ No unpaid gift codes found.");
      return NextResponse.json({ message: "No unpaid gift codes." });
    }

    const unpaidGiftCodes = [];
    unpaidSnapshot.forEach((doc) => {
      unpaidGiftCodes.push({ id: doc.id, ...doc.data() });
    });

    // Step 2: Fetch recent incoming transactions to @winwithsteemit
    const steemRes = await axios.get(
      `https://sds.steemworld.org/transfers_api/getTransfersByTypeTo/transfer/winwithsteemit`
    );

    const transactions = steemRes.data.result.rows || [];
    console.log(`🔁 Found ${transactions.length} recent transfers.`);

    let updatedCount = 0;

    // Step 3: Match each giftCode against incoming memos
    for (const gift of unpaidGiftCodes) {
      const expectedMemo = gift.code;

      const match = transactions.find(
        ([timestamp, from, to, amount, currency, memo]) =>
          memo === expectedMemo && parseFloat(amount) >= gift.ticketCount &&
          from.toLowerCase() === gift.giver.toLowerCase()
      );

      if (match) {
        // Step 4: Update Firestore giftCode doc
        await firestore.collection(GIFTCODE_COLLECTION).doc(gift.id).update({
          paid: true,
          paidAt: new Date().toISOString(),
          payer: match[1], // from
        });

        // 🔔 Notify the recipient via comment
        await postSteemitComment(gift.recipient, gift.code, gift.reason, gift.giver);

        updatedCount++;
        console.log(`✅ Verified payment for: ${gift.code}`);
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error) {
    console.error("❌ Error verifying gift payments:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
