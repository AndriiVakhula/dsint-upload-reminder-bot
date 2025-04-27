import 'dotenv/config';

const ADMINS = process.env.ADMINS?.split(',');

export function isAdmin(ctx) {
    return ADMINS.includes('@' + ctx.from.username);
}
