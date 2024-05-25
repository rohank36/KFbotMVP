import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI= process.env.MONGODB_URI || '';
export const BOT_TOKEN= process.env.BOT_TOKEN || '';
export const GPT_TOKEN= process.env.GPT_TOKEN || '';