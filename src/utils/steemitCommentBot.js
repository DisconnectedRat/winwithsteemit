// /utils/steemitCommentBot.js
import * as dsteem from "dsteem";

const BOT_USERNAME = process.env.BOT_USERNAME; // e.g. winwithsteemit
const POSTING_KEY = process.env.STEEM_POSTING_KEY; // private posting key

// dsteem client - points to main Steem network
const client = new dsteem.Client("https://api.steemit.com");

// We create a key object from your private posting key
const key = dsteem.PrivateKey.fromString(POSTING_KEY);

/**
 * 🎁 Gift Notification
 * @param {string} recipient - e.g. "someone"
 * @param {string} giftCode - e.g. "GIFT_ABC123"
 * @param {string} reason - e.g. "Happy Birthday 🎂"
 * @param {string} giver - e.g. "disconnect"
 */
export async function postSteemitComment(recipient, giftCode, reason = "", giver = "") {
  const author = BOT_USERNAME;
  const permlink = "gift-" + Math.random().toString(36).substr(2, 6);

  let parentAuthor = "";
  let parentPermlink = "gift-lottery"; // fallback

  try {
    const [latestPost] = await client.database.getDiscussions("blog", {
      tag: recipient,
      limit: 1
    });

    if (latestPost && latestPost.author && latestPost.permlink) {
      parentAuthor = latestPost.author;
      parentPermlink = latestPost.permlink;
    }
  } catch (err) {
    console.warn("⚠️ Could not fetch latest post for:", recipient);
  }

  const title = `You've Been Gifted a Ticket! 🎁`;
  const reasonText = reason ? `🎁 *@${giver} says:* ${reason}\n\n` : "";

  const body = `Hey @${recipient},\n\nYou have been gifted a lottery ticket from @${giver}!  
Use code: \`${giftCode}\` to redeem it.\n\n${reasonText}To redeem go to: https://winwithsteemit.com/`;

  const commentOp = [
    "comment",
    {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author: author,
      permlink: permlink,
      title: title,
      body: body,
      json_metadata: JSON.stringify({ app: "winwithsteemit/1.0", tags: ["lottery", "gift"] })
    }
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
 * @param {string} username - the buyer
 * @param {string[]} tickets - array of ticket numbers
 */
export async function postPurchaseComment(username, tickets = []) {
  const author = BOT_USERNAME;
  const permlink = "ticket-" + Math.random().toString(36).substr(2, 6);

  const parentAuthor = "";
  const parentPermlink = "lottery-tickets";

  const title = `Thanks for Your Lottery Purchase! 🎉`;
  const ticketList = tickets.map(t => `\`${t}\``).join(", ");

  const body = `Hi @${username},\n\n` +
    `You’ve successfully entered the Steemit Lottery with the following tickets: ${ticketList}.\n\n` +
    `Wishing you the best of luck in tomorrow’s draw! 🍀\n` +
    `Check results here 👉 https://winwithsteemit.com/results\n\n` +
    `– The WinWithSteemit Team `;

  const commentOp = [
    "comment",
    {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author: author,
      permlink: permlink,
      title: title,
      body: body,
      json_metadata: JSON.stringify({ app: "winwithsteemit/1.0", tags: ["lottery", "thanks"] })
    }
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
