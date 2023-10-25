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
      // Snimite sve poruke sa "ordinal: 35"
      const filePath = path.join(__dirname, 'partijeIzKonzole.txt');
      ballMessages.forEach(ballMessage => {
        const formattedData = {
          ordinal: ballMessage.ordinal,
          number: ballMessage.number,
          oddInFirstFive: ballMessage.oddInFirstFive,
          evenInFirstFive: ballMessage.evenInFirstFive,
          firstOddEven: ballMessage.firstOddEven,
        };
  
        // Formatiranje vremena
        const now = new Date();
        const formattedTime = new Date(now.getTime() - now.getTime() % (5 * 60000));
        const formattedTimeStr = formattedTime.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).replace(/,/g, '').replace(' ', ' - ');

        // Snimanje u datoteku
        const logEntry = `${formattedTimeStr} ${JSON.stringify(formattedData, null, 2)}\n`;
        fs.appendFileSync(filePath, logEntry);

        console.log('Poruka je sačuvana u datoteku "partijeIzKonzole.txt".');
      });

      // Izbrišite sve poruke
      ballMessages = [];
    }
  });
})();
