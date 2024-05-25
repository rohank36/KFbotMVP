import OpenAI from "openai";
import { ops } from "./ops";
import { GPT_TOKEN } from "./config";

interface Message {
    role: string;
    content: string;
    type: string;
    telegramId: number;
    userMsg: string,
}
export class GPT {
    private static instance: GPT;
    private openai: OpenAI;
    private ops = new ops();
    private constructor(apiKey: string) {
        this.openai = new OpenAI({apiKey: apiKey});
    }

    public static getInstance(): GPT {
        if (!GPT.instance) {
            GPT.instance = new GPT(GPT_TOKEN);
        }
        return GPT.instance;
    }
    
    async callGPT(message: Message){
        try{
            const isSummary = message.type === 'summary';
            const telegramId = message.telegramId;
            const cleanedMessage = await this.ops.loadMessages(message);
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: cleanedMessage!,
                temperature: 1,
                max_tokens: 700,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
            const savedMessageId = await this.ops.addToMessagesCollection(message, response.choices[0].message.content);
            const weekly = await this.ops.loadWeekly(message.telegramId);
            await this.ops.addToWeeklyCollection(savedMessageId, weekly, isSummary, telegramId);
            return response;
        }catch(error){
            throw error;
        }
    }
}