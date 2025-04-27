import db from '../db/db.js';
import { getMainKeyboard } from "../bot/keyboard.js"
import { getToday, formatDate } from "../utils/date.js";
import cron from 'node-cron';
import { MESSAGES } from '../constants.js';
import { config } from '../config.js';


export function isSubscribed(userId, subscribers) {
    if (!userId || !Array.isArray(subscribers)) {
        return false;
    }
    return subscribers.some(s => s.id === userId);
}

export async function subscribe(ctx) {
    try {
        if (!ctx.from?.id) {
            throw new Error('Invalid user context');
        }

        if (isSubscribed(ctx.from.id, db.data.subscribers)) {
            return ctx.reply(MESSAGES.ALREADY_SUBSCRIBED);
        }

        const newSubscriber = {
            id: ctx.from.id,
            username: ctx.from.username || ctx.from.first_name,
            subscribedAt: new Date().toISOString()
        };

        db.data.subscribers.push(newSubscriber);
        await db.write();

        return ctx.reply(MESSAGES.SUBSCRIBED, getMainKeyboard(ctx));
    } catch (error) {
        console.error('Subscription error:', error);
        throw new Error('Failed to subscribe user');
    }
}

export async function unsubscribe(ctx) {
    try {
        if (!ctx.from?.id) {
            throw new Error('Invalid user context');
        }

        if (!isSubscribed(ctx.from.id, db.data.subscribers)) {
            return ctx.reply(MESSAGES.NOT_SUBSCRIBED);
        }

        db.data.subscribers = db.data.subscribers.filter(s => s.id !== ctx.from.id);
        await db.write();

        return ctx.reply(MESSAGES.UNSUBSCRIBED, getMainKeyboard(ctx));
    } catch (error) {
        console.error('Unsubscription error:', error);
        throw new Error('Failed to unsubscribe user');
    }
}

export function setupCron(bot) {
    cron.schedule(config.bot.cronSchedule, async () => {
        const today = getToday();
        const todayItem = db.data.schedule.find(item => item.date === today);

        if (!todayItem) {
            console.log('No schedule items for today');
            return;
        }

        console.log(`Found ${todayItem.users.length} users to notify for today`);

        for (const user of todayItem.users) {
            const subscriber = db.data.subscribers.find(
                s => (s.username || '').toLowerCase() === user.replace('@', '').toLowerCase()
            );

            if (!subscriber) {
                console.log(`No subscriber found for user: ${user}`);
                continue;
            }

            try {
                await bot.telegram.sendMessage(
                    subscriber.id,
                    MESSAGES.REMINDER.replace('${date}', formatDate(today))
                );
                console.log(`Successfully sent reminder to user: ${subscriber.username}`);
            } catch (err) {
                console.error(`Failed to send reminder to user ${subscriber.username}:`, err);
            }
        }
    }, { timezone: config.bot.timezone });
}
