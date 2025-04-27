import "dotenv/config";
import { Telegraf, session } from "telegraf";
import cron from "node-cron";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import tz from "dayjs/plugin/timezone.js";
import db from "./db.js";
import { isAdmin } from "./admin.js";

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("Europe/Kyiv");

const store = {};

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

bot.command("set_schedule", (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.reply("⛔️ Лише адміністратор може змінювати розклад.");
    }

    store.expectSchedule = true;

    ctx.reply(
        "Надішліть розклад одним повідомленням у форматі:\n" +
            "`23.04.2025 - user1`\n`24.04.2025 - user2 user3`",
        { parse_mode: "Markdown" },
    );
});

bot.command("show_schedule", (ctx) => {
    if (db.data.schedule.length === 0) return ctx.reply("Розклад порожній.");

    const text = db.data.schedule
        .map(
            (item) =>
                `${dayjs(item.date).format("DD.MM.YYYY")} – ${item.users.join(", ")}`,
        )
        .join("\n");

    ctx.reply("📅 *Поточний розклад:*\n" + text, { parse_mode: "Markdown" });
});

bot.command("subscribe", async (ctx) => {
    const exists = db.data.subscribers.find((s) => s.id === ctx.from.id);
    if (exists) return ctx.reply("Ви вже підписані ✅");

    db.data.subscribers.push({
        id: ctx.from.id,
        username: ctx.from.username || ctx.from.first_name,
    });
    await db.write();

    ctx.reply("Підписка успішна! Тепер ви отримуватимете нагадування.");
});

bot.command("unsubscribe", async (ctx) => {
    const exists = db.data.subscribers.find((s) => s.id === ctx.from.id);
    if (!exists) return ctx.reply("Ви не підписані");

    db.data.subscribers = db.data.subscribers.filter((s) => s.id !== ctx.from.id);
    await db.write();

    ctx.reply("Ви відписались від розсилки.");
});

bot.on("message", async (ctx) => {
    if (store.expectSchedule) {
        const lines = ctx.message.text.split("\n");
        const parsed = [];

        for (const line of lines) {
            const [date, usersStr] = line.split(" - ");

            if (!date || !usersStr) {
                ctx.reply(`Не можу розібрати рядок: "${line}"\nСкасовано.`);
                store.expectSchedule = false;
                return;
            }

            const [dd, mm, yyyy] = date.split(".");
            const iso = dayjs(`${yyyy}-${mm}-${dd}`, "YYYY-MM-DD").format(
                "YYYY-MM-DD",
            );
            const users = usersStr.trim().split(/\s+/);
            parsed.push({ id: iso.replace(/-/g, ""), date: iso, users });
        }

        db.data.schedule = parsed.sort((a, b) => a.date.localeCompare(b.date));
        await db.write();

        store.expectSchedule = true;
        ctx.reply("✅ Розклад оновлено.");
    }
});

cron.schedule(
    "00 10 * * *",
    async () => {
        const today = dayjs().format("YYYY-MM-DD");
        const todayItem = db.data.schedule.find((item) => item.date === today);

        if (!todayItem) return;

        for (const user of todayItem.users) {
            const subscribers = db.data.subscribers.find(
                (s) => (s.username || "").toLowerCase() === user.replace("@", "").toLowerCase(),
            );

            if (!subscribers) continue;

            try {
                await bot.telegram.sendMessage(
                    subscribers.id,
                    `🔔 Нагадування: сьогодні ваша черга! (${dayjs(
                        today,
                    ).format("DD.MM.YYYY")})`,
                );
            } catch (err) {
                console.error("Не вдалося надіслати:", err);
            }
        }
    },
    { timezone: "Europe/Kyiv" },
);

bot.launch();
console.log("Bot is running…");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
