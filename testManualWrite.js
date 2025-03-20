import fs from 'fs/promises';
import path from 'path';

const PURCHASED_TICKETS_FILE = path.join(process.cwd(), 'src/data/purchasedTickets.json');

async function testManualWrite() {
  try {
    // Read the current contents of the file; if it doesn't exist, assume an empty array.
    let data;
    try {
      data = await fs.readFile(PURCHASED_TICKETS_FILE, 'utf8');
    } catch (readError) {
      data = '[]';
    }
    const tickets = JSON.parse(data);

    // Create a test ticket entry
    const testTicket = {
      username: 'manualUser',
      tickets: ['012', '345', '678'],
      memo: 'Lottery manual test',
      timestamp: new Date().toISOString()
    };

    // Append the test ticket and write back to the file
    tickets.push(testTicket);
    await fs.writeFile(PURCHASED_TICKETS_FILE, JSON.stringify(tickets, null, 2));
    console.log('Manual write successful:', tickets);
  } catch (error) {
    console.error('Error during manual write:', error);
  }
}

testManualWrite();
