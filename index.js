require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require("puppeteer");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN || "", { polling: true });

const introductionMessage = `Hello! I will provide info about GRIN ツ coin inflation.
Website: https://grinflation.com/

<b>Commands:</b>
/info - Show GRIN ツ inflation`;

const replyWithIntro = (msg) => {
    const { chat: { id } } = msg;
    bot.sendMessage(id, introductionMessage, {
        parse_mode: "HTML",
    });
}

bot.onText(/\/start/, replyWithIntro);

let lastInflationDate;
const replyWithInflation = (msg) => {
    const { chat: { id } } = msg;
    const date = new Date().getTime()
    if (lastInflationDate && date - lastInflationDate < 60000) {
        bot.sendPhoto(id, 'grinflation.png');
        return;
    }
    lastInflationDate = date;
    puppeteer
        .launch({
            defaultViewport: {
                width: 320,
                height: 370,
            },
        })
        .then(async (browser) => {
            const page = await browser.newPage();
            await page.goto("https://grinflation.com");
            await page.screenshot({ path: `grinflation.png` });
            await browser.close();
        })
        .then(() => {
            bot.sendPhoto(id, 'grinflation.png');
        })
        .catch((e) => {
            console.log(e);
        });
}

bot.onText(/\/info/, replyWithInflation)

bot.on('polling_error', (error) => {
    console.log(error);
});