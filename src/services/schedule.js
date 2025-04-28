import db from '../db/db.js';
import { MESSAGES } from '../constants.js';
import { formatDate, parseDate, getToday } from '../utils/date.js';
import dayjs from 'dayjs';

const mdEscape = (text) =>
  text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

export function getScheduleText() {
    if (!db.data.schedule?.length) {
        return MESSAGES.EMPTY_SCHEDULE;
    }

    const today = getToday();
    const lines = db.data.schedule
        .filter(({ date }) => dayjs(date).startOf("day").diff(today, "day") >= 0)
        .reverse()
        .map(({ date, users }) => {
            const safeDate  = formatDate(date).replace(/\./g, '\.');
            const safeUsers = users.map(mdEscape).join(', ');

        return `${safeDate}: ${safeUsers}`;
    });

  return `📅 *Поточний розклад:*\n${lines.join('\n')}`;
}
export function getNextTurn(ctx) {
    const user = ctx.from.username;
    const today = getToday();

    const normalize = (name) =>
      (name.startsWith("@") ? name.slice(1) : name).toLowerCase();

    const nextTurn = db.data.schedule
       .filter((rec) =>
           rec.users.some((u) => normalize(u) === user) && dayjs(rec.date).startOf("day").diff(today, "day") >= 0)
       .sort((a, b) => dayjs(a.date) - dayjs(b.date))[0];


    if (!nextTurn) {
        return "Вас поки не має в графіку, перевірьте трішки пізніше";
    }

    const safeDate = formatDate(nextTurn.date).replace(/\./g, '\.');
    const safeUsers = nextTurn.users.map(mdEscape).join(', ');

    return `📅 *Наступна ваша черга :*\n${safeDate}: ${safeUsers}`;
}

function validateScheduleEntry(date, users) {
    if (!date || !Array.isArray(users) || users.length === 0) {
        throw new Error('Invalid schedule entry: date and users are required');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
    }

    if (users.some(user => !user || typeof user !== 'string')) {
        throw new Error('Invalid users: all users must be non-empty strings');
    }
}

export async function updateSchedule(lines) {
    if (!Array.isArray(lines) || lines.length === 0) {
        throw new Error('No schedule lines provided');
    }

    const parsed = [];

    for (const line of lines) {
        const [dateStr, usersStr] = line.split(':');

        if (!dateStr || !usersStr) {
            throw new Error(MESSAGES.INVALID_LINE.replace('${line}', line));
        }

        const date = parseDate(dateStr);
        const users = usersStr.trim().split(/\s+/);

        validateScheduleEntry(date, users);

        parsed.push({ id: date.replace(/-/g, ''),  date, users });
    }

    try {
        for (const newEntry of parsed) {
            const existingIndex = db.data.schedule.findIndex(item => item.date === newEntry.date);

            if (existingIndex !== -1) {
                db.data.schedule[existingIndex] = newEntry;
            } else {
                db.data.schedule.push(newEntry);
            }
        }

        db.data.schedule.sort((a, b) => a.date.localeCompare(b.date));
        await db.write();
    } catch (error) {
        console.error('Failed to update schedule:', error);
        throw new Error('Failed to update schedule');
    }
}
