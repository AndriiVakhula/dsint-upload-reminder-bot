import { Markup } from 'telegraf';
import { COMMANDS } from '../constants.js';
import { isSubscribed } from '../services/subscription.js';
import { isAdmin } from '../utils/admin.js';
import db from '../db/db.js';

export function getMainKeyboard(ctx) {
    const buttons = [[COMMANDS.SHOW_SCHEDULE, COMMANDS.GET_NEXT_TURN]];

    if (isAdmin(ctx)) {
        buttons.push([COMMANDS.SET_SCHEDULE]);
    }

    const subStatus = isSubscribed(ctx.from.id, db.data.subscribers);
    buttons.push([subStatus ? COMMANDS.UNSUBSCRIBE : COMMANDS.SUBSCRIBE]);

    return Markup.keyboard(buttons)
        .resize()
        .placeholder('Виберіть дію');
}
