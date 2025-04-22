// /utils/steemitCommentBot.js
import fetch from "node-fetch";
global.fetch = fetch;           

// /utils/steemitCommentBot.js
import dsteem from "./dsteem-browser.js"; 

const BOT_USERNAME = process.env.BOT_USERNAME; // e.g. winwithsteemit
const POSTING_KEY = process.env.STEEM_POSTING_KEY; // private posting key

// Use browser-safe version of dsteem client
const client = new dsteem.Client("https://api.steemit.com", {
  addressPrefix: "STM",
  chainId: "0000000000000000000000000000000000000000000000000000000000000000"
});

// Create key object
const key = dsteem.PrivateKey.fromString(POSTING_KEY);

/**
 * 🎁 Gift Notification
 */
export async function postSteemitComment(recipient, giftCode, reason = "", giver = "", ticketCount = 1) {
  const author = BOT_USERNAME;
  const permlink = "gift-" + Math.random().toString(36).substr(2, 6);

  let parentAuthor = "";
  let parentPermlink = "gift-lottery";
  let discussions = [];

  try {
    discussions = await client.database.getDiscussions("blog", {
      tag: recipient,
      limit: 10,
    });

  } catch (err) {
    console.warn("⚠️ Could not fetch latest post for:", recipient);
  }

  const latestOriginal = discussions.find(post => post.parent_author === "");

  if (latestOriginal) {
    parentAuthor   = latestOriginal.author;
    parentPermlink = latestOriginal.permlink;
  } else {
    // Fallback if user has only resteemed
    console.warn("No original post found—skipping comment for", recipient);
    return { success: false, skipped: true };
  }

  const title = `You've Been Gifted a Ticket! 🎁`;
  const reasonText = reason ? `🎁 *@${giver} says:* ${reason}\n\n` : "";
  const plural = ticketCount > 1 ? "tickets" : "ticket";
  const body = `Hey @${recipient},\n\nYou have been gifted **${ticketCount} lottery ${plural}** from @${giver}!  \nUse code: \`${giftCode}\` to redeem ${ticketCount > 1 ? "them" : "it"}. \n\n${reasonText}To redeem go to: https://winwithsteemit.com`;

  const commentOp = [
    "comment",
    {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author,
      permlink,
      title,
      body,
      json_metadata: JSON.stringify({ app: "winwithsteemit/1.0", tags: ["lottery", "gift"] }),
    },
  ];

  try {
    const result = await client.broadcast.sendOperations([commentOp], key);
    console.log("✅ Successfully posted comment:", result.id);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("❌ Failed to post comment:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 🎟️ Purchase Notification
 */
export async function postPurchaseComment(username, tickets = []) {
  const author = BOT_USERNAME;
  const permlink = "ticket-" + Math.random().toString(36).substr(2, 6);

  let discussions = [];
  try {
    discussions = await client.database.getDiscussions("blog", {
      tag: username,
      limit: 10,
    });

  } catch (err) {
    console.warn("⚠️ Could not fetch blog feed for:", username, err);
  }

  // Pick first with no parent_author → that’s an original post
  const latestOriginal = discussions.find(post => post.parent_author === "");
    
  let parentAuthor, parentPermlink;
    if (latestOriginal) {
      parentAuthor   = latestOriginal.author;
      parentPermlink = latestOriginal.permlink;
    } else {

  // fallback if they’ve only resteemed
      console.warn("No original post found—skipping comment for", recipient);
      return { success: false, skipped: true };
    }

  const count      = tickets.length;
  const ticketWord = count > 1 ? "tickets are" : "ticket is";
  const ticketList = tickets.map(t => `\`${t}\``).join(", ");

  const title = `Thanks for Your Lottery Entry! 🎉`;
  const body = `Hi @${username},\n\n` +
    `Your Steemit Lottery ${ticketWord} confirmed: ${ticketList}.\n\n` +
    `Wishing you the best of luck in tomorrow’s draw! 🍀\n` +
    `Check results 👉 https://winwithsteemit.com/results\n\n` +
    `– The WinWithSteemit Team 🎯`;

  const commentOp = [
    "comment",
    {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author,
      permlink,
      title,
      body,
      json_metadata: JSON.stringify({ app: "winwithsteemit/1.0", tags: ["lottery", "thanks"] }),
    },
  ];

  try {
    const result = await client.broadcast.sendOperations([commentOp], key);
    console.log("✅ Posted ticket purchase comment:", result.id);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("❌ Failed to post purchase comment:", error);
    return { success: false, error: error.message };
  }
}
