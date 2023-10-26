const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://lucky-betting.mozzartbet.com/lucky6-web/');

  let ballMessages = [];

  // Postavite slušača za konzolne događaje
  page.on('console', async msg => {
    const args = msg.args();
    const vals = [];
    for (let i = 0; i < args.length; i++) {
      vals.push(await args[i].jsonValue());
    }

    // Filtriranje poruka sa statusom "BALL"
    const newBallMessages = vals.filter(msg => msg.status === "BALL");

    // Dodajte nove poruke u niz
    ballMessages = ballMessages.concat(newBallMessages);

    // Proverite da li ste dostigli "ordinal: 35"
    if (ballMessages.some(msg => msg.ordinal === 35)) {
      // Formatiranje vremena
      const now = new Date();
      const formattedTime = new Date(now.getTime() - now.getTime() % (5 * 60000));
      const formattedTimeStr = formattedTime.toLocaleString('sr-RS', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/,/g, '').replace(' ', ' - ');

      // Formatiranje svih poruka u jednom redu
      const formattedData = ballMessages.map(message => {
        return JSON.stringify({
          ordinal: message.ordinal,
          number: message.number,
          oddInFirstFive: message.oddInFirstFive,
          evenInFirstFive: message.evenInFirstFive,
          firstOddEven: message.firstOddEven,
        });
      }).join(', ');

      // Snimanje u datoteku
      const filePath = path.join(__dirname, 'partijeIzKonzole.txt');
      const logEntry = `${formattedTimeStr} - [${formattedData}]\n`;
      fs.appendFileSync(filePath, logEntry);

      console.log('Poruke su sačuvane u datoteku "partijeIzKonzole.txt" u jednom redu.');
      
      // Izbrišite sve poruke iz niza
      ballMessages = [];
    }
  });
})();
