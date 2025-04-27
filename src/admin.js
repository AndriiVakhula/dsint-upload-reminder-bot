import 'dotenv/config';
const ADMIN_IDS = process.env.ADMINS.split(',');

export function isAdmin(ctx) {
    return ADMIN_IDS.includes("@" + ctx.from.username);
}
