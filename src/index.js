import 'dotenv/config';
import { Telegraf, session } from 'telegraf';
import composer from './bot/handlers.js';
import { setupCron } from './services/subscription.js';
import { config } from './config.js';

const store = {};
const bot = new Telegraf(config.bot.token);
bot.use(session());

bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('Виникла помилка. Будь ласка, спробуйте пізніше.');
});

bot.use(composer);
setupCron(bot);

bot.launch();
console.log('Bot is running…');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
