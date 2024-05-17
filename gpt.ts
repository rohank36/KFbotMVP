import OpenAI from "openai";
import Message from "./schemas/message";
import Weekly from "./schemas/weekly";
import User from "./schemas/user";

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
    public readonly sysInstruction: string = "You are a brazilian jiu jitsu’s athletes companion that will join the user on their journey and guide them through thought-provoking questions to make them feel in control of their jiu jitsu progress and as if they are improving. Your tone should mimic someone who has known the athlete for an extended period of time and who genuinely cares about their lives and jiu jitsu progress. Your personality should be easy going and positive. You are a vehicle that enables our users to take action and improve their jiu jitsu by asking thoughtful questions. The user should feel like their jiu jitsu skills are growing."
    public readonly summaryPrompt: string = "Send the user a summary of their week based on what they logged in the /weeklygoal, /pretrg, and /postrg entries. It should be encouraging and supportive - making the user feel like they are improving. End it by prompting them to enter their next weeks /weeklygoals, note that you will message them if they forget."
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
            console.log('Error in addToMessagesCollection: ', error);
            throw error;
        }
    }

    async addToWeeklyCollection(savedMessageId: any, weekly: any, isSummary: boolean, telegramId: number){
        try{
            const weekId = weekly!._id;
            if(isSummary){
                await Weekly.findByIdAndUpdate(weekId, { done: true }, { new: true });
                const userInfo = weekly.user_info;
                const chats: string[] = [];
                chats.push(savedMessageId);
                const newWeekly = new Weekly({
                    telegramId: telegramId,
                    chats: chats,
                    user_info: userInfo,
                })
                await newWeekly.save();
            }else{
                weekly.chats.push(savedMessageId);
                await Weekly.findByIdAndUpdate(weekId, {chats: weekly.chats}, {new: true});
            }
                
        }catch(error){
            console.log('Error in addToWeeklyCollection: ', error);
            throw error;
        }
    }

    async loadWeekly(telegramId: Number){
        try{
            const weekly = await Weekly.findOne({telegramId: telegramId, done: false});
            if(!weekly){
                console.log("no weekly found, creating new weekly");
                const user = await User.findOne({telegramId});
                const userInfo = user.user_info;
                const newWeekly = new Weekly({
                    telegramId: telegramId,
                    user_info: userInfo,
                });
                const newWeeklySaved = await newWeekly.save();
                return newWeeklySaved;
            }else{
                return weekly;
            }
        }catch(error){
            console.log('Error in loadWeekly: ', error);
            throw error;
        }
    }

    async checkUser(telegramId: Number, userInfo: any){
        try{
            const user = await User.findOne({telegramId: telegramId});
            if(!user){
                const newUser = new User({telegramId, userInfo});
                await newUser.save();
            } 
        }catch(error){
            console.log('Error in checkUser: ', error);
            throw error;
        }
        //TODO: add profile updating feature later 
    }
    async loader(weekly: any): Promise<{}[]>{
        try{
            let returnArr: {}[] = [];
            returnArr.push({role: "system", content: this.sysInstruction});
            if(weekly.userInfo){
                const userInfoId = weekly.userInfo;
                const userInfo = await Message.findById({userInfoId});
                if(userInfo){
                    returnArr.push({role:"user", content: userInfo.msg});
                    returnArr.push({role:"assistant", content: userInfo.res})
                }
            }
            /*
            if(weekly.weeklyGoal){
                const goalId = weekly.weeklyGoal;
                const goals = await Message.findById({goalId});
                if(goals){
                    returnArr.push({role:"user", content: goals.msg});
                    returnArr.push({role:"assistant", content: goals.res})
                }
            }
            */
            for(const msgId of weekly.chats){
                let msg = await Message.findById({msgId});
                if(msg){
                    returnArr.push({role:"user", content: msg.msg});
                    returnArr.push({role:"assistant", content: msg.res})
                }
            }
            return returnArr;
        }catch(error){
            console.log('Error in loader: ', error);
            throw error;
        }
    }

    async loadMessages(message: Message): Promise<any>{
        try{
            if(message.type==='userInfo'){
                await this.checkUser(message.telegramId, message.userMsg);
            }
            const weekly = await this.loadWeekly(message.telegramId);
            const returnArr = await this.loader(weekly); //build the array with all the weekly info here.
            if(message.type==='summary'){
                returnArr.push({role:"user", content: this.summaryPrompt})
            }else{
                returnArr.push({role:"user", content: message.content});
            }
            console.log("Loaded Message: ", returnArr);
            return returnArr;
            /* 
            console.log(message);
            return [
                { role: "system", content: this.sysInstruction },
                { role: message.role, content: message.content }
            ];
            */
        }catch(error){
            console.log("Error in loadMessages: ", error);
            throw error;
        }
    }

    async callGPT(message: Message){
        try{
            console.log("Message in GPT: ",message);
            const isSummary = message.type === 'summary';
            const telegramId = message.telegramId;
            const cleanedMessage = await this.loadMessages(message);
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
            const weekly = await this.loadWeekly(message.telegramId);
            await this.addToWeeklyCollection(savedMessageId, weekly, isSummary, telegramId);
            return response;
        }catch(error){
            console.log("Error in callGPt: ", error);
            throw error;
        }
    }
}