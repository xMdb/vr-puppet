const auURL = 'https://www.ebgames.com.au/product/pc/231700-valve-index-complete-vr-kit';
// const nzURL = 'https://www.ebgames.co.nz/product/pc/231700-valve-index-complete-vr-kit';

require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

(async () => {
   puppeteer.use(stealth());

   const browser = await puppeteer.launch({
      headless: true,
      // Linux/Ubuntu
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
   });

   const auPage = await browser.newPage();
   // const nzPage = await browser.newPage();
   console.log('Launching...');
   await auPage.goto(auURL);
   // await nzPage.goto(nzURL);

   async function detectAUStock() {
      await auPage.reload();
      const content = await auPage.content();
      const time = new Date().toLocaleString('en-US', {
         hour: 'numeric',
         minute: 'numeric',
         hour12: true,
      });
      if (content.includes(`<meta itemprop="availability" content="https://schema.org/OutOfStock">`)) {
         const title = await auPage.title();
         console.log(`[AU - ${time}] ${title}\n   - Still out of stock.`);
      } else {
         const title = await auPage.title();
         console.log(
            `\n\n[AU - ${time}] ${title}\n\n!!!!!!!!!!!!!! IN STOCK !!!!!!!!!!!!!!\nGO GO GO ${auURL}\n!!!!!!!!!!!!!! IN STOCK !!!!!!!!!!!!!!\n\n`
         );
         await axios(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            data: {
               content: `<@253699775377965056> AUSTRALIA: In stock! ${title}: ${auURL}`,
            },
         });
      }
   }

   // async function detectNZStock() {
   //    await nzPage.reload();
   //    const content = await nzPage.content();
   //    const time = new Date().toLocaleString('en-US', {
   //       hour: 'numeric',
   //       minute: 'numeric',
   //       hour12: true,
   //    });
   //    if (content.includes(`<meta itemprop="availability" content="https://schema.org/OutOfStock">`)) {
   //       const title = await nzPage.title();
   //       console.log(`[NZ - ${time}] ${title}\n   - Still out of stock.`);
   //    } else {
   //       const title = await nzPage.title();
   //       console.log(
   //          `\n\n[NZ - ${time}] ${title}\n\n!!!!!!!!!!!!!! IN STOCK !!!!!!!!!!!!!!\nGO GO GO ${nzURL}\n!!!!!!!!!!!!!! IN STOCK !!!!!!!!!!!!!!\n\n`
   //       );
   //       await axios(process.env.DISCORD_WEBHOOK_URL, {
   //          method: 'POST',
   //          headers: {
   //             'Content-Type': 'application/json',
   //          },
   //          data: {
   //             content: `<@253699775377965056> NEW ZEALAND: In stock! ${title}: ${nzURL}`,
   //          },
   //       });
   //    }
   // }
   
   detectAUStock();
   // detectNZStock();
   // loop detect stock forever and pause for a bit
   setInterval(detectAUStock, 150 * 1000);
   // setInterval(detectNZStock, 155 * 1000);
})();

// Oopsie boopsies
process
   .on('uncaughtException', (err) => {
      console.error(`(!) Oopsie boopsie happened at ${new Date().toLocaleString()}\n--------------------------`);
      console.error(err);
      process.exit(1);
   })
   .on('unhandledRejection', (err) => {
      console.error(`(!) Oopsie boopsie happened at ${new Date().toLocaleString()}\n--------------------------`);
      console.error(err);
      process.exit(1);
   });
