import { COMMANDS, MESSAGES } from '../constants.js';
import { Composer } from 'telegraf';
import { isAdmin } from '../utils/admin.js';
import { getScheduleText, updateSchedule, getNextTurn } from '../services/schedule.js';
import { subscribe, unsubscribe } from '../services/subscription.js';
import { getMainKeyboard } from './keyboard.js';

const composer = new Composer();
const store = {};

composer.command(COMMANDS.START, (ctx) => {
    ctx.reply(MESSAGES.WELCOME, getMainKeyboard(ctx));
});

composer.hears(COMMANDS.SHOW_SCHEDULE, (ctx) => {
    ctx.reply(getScheduleText(), { parse_mode: 'Markdown' });
});

composer.hears(COMMANDS.GET_NEXT_TURN, (ctx) => {
    ctx.reply(getNextTurn(ctx), { parse_mode: 'Markdown' });
});

composer.hears(COMMANDS.SUBSCRIBE, subscribe);
composer.hears(COMMANDS.UNSUBSCRIBE, unsubscribe);

composer.hears(COMMANDS.SET_SCHEDULE, (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.reply(MESSAGES.ADMIN_ONLY);
    }

    store.expectSchedule = true;
    ctx.reply(MESSAGES.SCHEDULE_FORMAT, { parse_mode: 'Markdown' });
});

composer.on('message', async (ctx) => {
    if (!store.expectSchedule) return;

    try {
        const lines = ctx.message.text.split('\n');
        await updateSchedule(lines);
        ctx.reply(MESSAGES.SCHEDULE_UPDATED);
    } catch (error) {
        ctx.reply(error.message);
    } finally {
        store.expectSchedule = false;
    }
});

export default composer;
