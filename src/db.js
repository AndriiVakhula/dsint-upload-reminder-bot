import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("./db.json");
const defaultData = { schedule: [], subscribers: [] };

const db = new Low(adapter, defaultData);
await db.read();
await db.write();

export default db;
