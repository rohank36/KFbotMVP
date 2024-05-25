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

export class ops{
    public readonly sysInstruction: string = "You are a brazilian jiu jitsu’s athletes companion that will join the user on their journey and guide them through thought-provoking questions to make them feel in control of their jiu jitsu progress and as if they are improving. Your tone should mimic someone who has known the athlete for an extended period of time and who genuinely cares about their lives and jiu jitsu progress. Your personality should be easy going and positive. You are a vehicle that enables our users to take action and improve their jiu jitsu by asking thoughtful questions. The user should feel like their jiu jitsu skills are growing."
    public readonly summaryPrompt: string = "Send the user a summary of their week based on what they logged in the /weeklygoal, /pretrg, and /postrg entries. It should be encouraging and supportive - making the user feel like they are improving. End it by prompting them to enter their next weeks /weeklygoals, note that you will message them if they forget."
    
    async addToMessagesCollection(message: Message, gptRes: string|null){
        if(message.type === 'badMsg') return;
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
                if(savedMessageId) chats.push(savedMessageId);
                const newWeekly = new Weekly({
                    telegramId: telegramId,
                    chats: chats,
                    user_info: userInfo,
                })
                await newWeekly.save();
            }else{
                if(savedMessageId) weekly.chats.push(savedMessageId);
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
                const newUser = new User({telegramId, user_info:userInfo});
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
            if(weekly.user_info){
                const userInfo = weekly.user_info;
                if(userInfo){
                    returnArr.push({role:"user", content: userInfo});
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
            if(weekly.chats){
                for(const msgId of weekly.chats){
                    let msg = await Message.findById(msgId);
                    if(msg && msg.type !== 'badMsg'){
                        returnArr.push({role:"user", content: msg.msg});
                        returnArr.push({role:"assistant", content: msg.res})
                    }
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
            return returnArr;
        }catch(error){
            console.log("Error in loadMessages: ", error);
            throw error;
        }
    }

    async getAllUsers(){
        return User.find();
    }
}