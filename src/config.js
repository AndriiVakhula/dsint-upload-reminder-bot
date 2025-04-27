import 'dotenv/config';

export const config = {
    bot: {
        token: process.env.BOT_TOKEN,
        timezone: process.env.TIMEZONE || 'Europe/Kiev',
        cronSchedule: process.env.CRON_SCHEDULE || '0 10 * * *', // 10 AM daily
    },
    db: {
        file: 'db.json',
    },
};
