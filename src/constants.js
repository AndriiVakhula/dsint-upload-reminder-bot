export const COMMANDS = {
    START: 'start',
    SHOW_SCHEDULE: '📅 Показати розклад',
    GET_NEXT_TURN: '➡️ Дата наступного завантаження',
    SUBSCRIBE: '✅ Підписатися',
    UNSUBSCRIBE: '❌ Відписатися',
    SET_SCHEDULE: '⚙️ Встановити розклад',
};

export const MESSAGES = {
    WELCOME: `Вітаю! Я бот для нагадування про завантаження відео у Dsint.

Доступні команди:
${COMMANDS.SHOW_SCHEDULE} - показати поточний розклад
${COMMANDS.GET_NEXT_TURN} - показати дату наступного завантаження
${COMMANDS.SUBSCRIBE} - підписатися на нагадування
${COMMANDS.UNSUBSCRIBE} - відписатися від нагадувань
${COMMANDS.SET_SCHEDULE} - встановити розклад (тільки для адмінів)`,

    EMPTY_SCHEDULE: '📅 Розклад порожній',
    SCHEDULE_FORMAT: `Відправте розклад у форматі:
\`\`\`
YYYY-MM-DD: @username1 @username2
YYYY-MM-DD: @username3
\`\`\`
Кожен рядок має містити дату та список користувачів через двокрапку.`,

    SCHEDULE_UPDATED: '✅ Розклад оновлено',
    INVALID_LINE: '❌ Невірний формат рядка: ${line}',
    ADMIN_ONLY: '❌ Ця команда доступна тільки для адмінів',
    ALREADY_SUBSCRIBED: '✅ Ви вже підписані на нагадування',
    NOT_SUBSCRIBED: '❌ Ви не підписані на нагадування',
    SUBSCRIBED: '✅ Ви підписані на нагадування',
    UNSUBSCRIBED: '✅ Ви відписані від нагадувань',
    REMINDER: '🔔 Нагадування: сьогодні ваша черга завантажувати файли (${date})',
};

export const CRON_SCHEDULE = '33 13 * * *';
export const TIMEZONE = 'Europe/Kyiv';
