import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { config } from '../config.js';

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault('Europe/Kyiv');

export function getToday() {
    return dayjs().tz(config.bot.timezone).format('YYYY-MM-DD');
}

export function formatDate(date) {
    if (!date) {
        throw new Error('Date is required');
    }
    return dayjs(date).tz(config.bot.timezone).format('DD.MM.YYYY');
}

export function parseDate(dateStr) {
    const [dd, mm, yyyy] = dateStr.split('.');
    return dayjs(`${yyyy}-${mm}-${dd}`, 'YYYY-MM-DD').format('YYYY-MM-DD');
}
