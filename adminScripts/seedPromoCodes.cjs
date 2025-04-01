// seedPromoCodes.cjs

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// 1) Double-check the path here to your actual JSON file.
//    On Windows, you often need double backslashes, for example:
//    "C:\\Users\\DigiTecz\\win\\adminScripts\\firebase-admin-key.json"

const serviceAccountPath = "C:\\Users\\DigiTecz\\win\\adminScripts\\firebase-admin-key.json";

// 2) Verify the file exists before proceeding
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account file not found at: ${serviceAccountPath}`);
  process.exit(1);
}

// 3) Load the JSON credentials
const serviceAccount = require(serviceAccountPath);

// 4) Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// 5) Here's the promo data we want to seed
const promoCodes = [
  { username: "willeusz", memo: "win_willeusz" },
  { username: "adeljose", memo: "win_adeljose" },
  { username: "alfazmalek", memo: "win_alfazmalek" },
  { username: "damithudaya", memo: "win_damithudaya" },
  { username: "bonaventure24", memo: "win_bonaventure24" },
  { username: "fantvwiki", memo: "win_fantvwiki" },
  { username: "fannyescobar", memo: "win_fannyescobar" },
  { username: "abi24", memo: "win_abi24" },
  { username: "natz04", memo: "win_natz04" },
  { username: "crismenia", memo: "win_crismenia" },
  { username: "jyoti-thelight", memo: "win_jyoti-thelight" },
  { username: "dexsyluz", memo: "win_dexsyluz" },
  { username: "senehasa", memo: "win_senehasa" },
  { username: "hive-171433", memo: "win_Steem4Entrepreneurs" },
  { username: "m-fdo", memo: "win_m-fdo" },
  { username: "ngoenyi", memo: "win_ngoenyi" },
  { username: "ruthjoe", memo: "win_ruthjoe" },
  { username: "alexanderpeace", memo: "win_alexanderpeace" },
  { username: "edgargonzalez", memo: "win_edgargonzalez" },
  { username: "ternuritajessi", memo: "win_ternuritajessi" },
  { username: "benoitblanc", memo: "win_benoitblanc" },
  { username: "pandora2010", memo: "win_pandora2010" },
  { username: "vivigibelis", memo: "win_vivigibelis" },
  { username: "dequeen", memo: "win_dequeen" },
  { username: "eveetim", memo: "win_eveetim" },
  { username: "nsijoro", memo: "win_nsijoro" },
];

// 6) A function to seed them
async function seedPromoCodes() {
  try {
    for (const promo of promoCodes) {
      await db.collection("promoCode").add({
        username: promo.username.toLowerCase(),
        memo: promo.memo,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Seeded promo for ${promo.username}`);
    }
    console.log("🌱 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed seeding promo codes:", err);
    process.exit(1);
  }
}

seedPromoCodes();
