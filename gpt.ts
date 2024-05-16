import OpenAI from "openai";
import Message from "./schemas/message";
import Weekly from "./schemas/weekly";

interface Message {
    role: string;
    content: string;
    type: string;
    telegramId: number;
}
export class GPT {
    private static instance: GPT;
    private openai: OpenAI;
    public readonly sysInstruction: string = "You are a brazilian jiu jitsu’s athletes companion that will join the user on their journey and guide them through thought-provoking questions to make them feel in control of their jiu jitsu progress and as if they are improving. Your tone should mimic someone who has known the athlete for an extended period of time and who genuinely cares about their lives and jiu jitsu progress. Your personality should be easy going and positive. You are a vehicle that enables our users to take action and improve their jiu jitsu by asking thoughtful questions. The user should feel like their jiu jitsu skills are growing."

    private constructor(apiKey: string) {
        this.openai = new OpenAI({apiKey: apiKey});
    }

    public static getInstance(): GPT {
        if (!GPT.instance) {
            GPT.instance = new GPT("sk-proj-Q6P738mhT4CkWFxDusTCT3BlbkFJfpDZTJO4bx8PqnfwvFcr");
        }
        return GPT.instance;
    }

    async addToMessagesCollection(message: Message, gptRes: string|null){
        try{
            const newMessage = new Message({
                telegramId: message.telegramId,
                type: message.type,
                msg: message.content,
                res: gptRes,
            });
            const savedMessage= await newMessage.save();
            return savedMessage._id;
        }catch(error){
            throw error;
        }
    }

    async addToWeeklyCollection(savedMessageId: any, weeklyDocumentId: any){
        try{

        }catch(error){
            throw error;
        }
    }

    async loadWeekly(telegramId: Number){
        try{
            //const weekly = await Weekly.findOne({telegramId: telegramId});
            
            //find all weekly documents with telegramId
            //sort by timestamp and filter by !done.
            //returns one weekly document that matches the search criteria
        }catch(error){
            throw error;
        }
    }

    async checkUser(){
        // find user in db by telegramId
        // if no user, create document. 
        //TODO: add profile updating feature later 
    }

    loadMessages(message: Message): any{
        // if message.type = userInfo 
            // call checkUser()
        //else
            //call loadWeekly()
                //if message.type = summary
                    // load all messages + new msg to get summary 
                    // add summary to cur weekly summary array, set done to true
                    // create new weekly with user_info and [] of summaries from prev week with the new summary already added in.
                // else build on current weekly
                    // load user_info, all summaries (from oldest to most recent) and messages from current week + new msg
                
        console.log(message);
        return [
            { role: "system", content: this.sysInstruction },
            { role: message.role, content: message.content }
        ];
    }

    async callGPT(message: Message){
        try{
            const cleanedMessage = this.loadMessages(message);
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: cleanedMessage!,
                temperature: 1,
                max_tokens: 700,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
            const savedMessageId = await this.addToMessagesCollection(message, response.choices[0].message.content);
            const weeklyDocument = await this.loadWeekly(message.telegramId);
            //const weeklyDocumentId = weeklyDocument._id;
            //await this.addToWeeklyCollection(savedMessageId, weeklyDocumentId);
            return response;
        }catch(error){
            throw error;
        }
    }
}