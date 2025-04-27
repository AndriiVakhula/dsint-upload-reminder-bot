import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { config } from '../config.js';

const defaultData = {
    schedule: [],
    subscribers: [],
};

class Database {
    constructor() {
        this.db = new Low(new JSONFile(config.db.file), defaultData);
    }

    async init() {
        try {
            await this.db.read();
            if (!this.db.data) {
                this.db.data = defaultData;
                await this.db.write();
            }
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw new Error('Database initialization failed');
        }
    }

    async write() {
        try {
            await this.db.write();
        } catch (error) {
            console.error('Failed to write to database:', error);
            throw new Error('Database write failed');
        }
    }

    get data() {
        return this.db.data;
    }
}

const db = new Database();
await db.init();

export default db;
