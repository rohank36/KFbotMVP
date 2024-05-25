import User from "./schemas/user";
import {ops} from "./ops";

export default async function summaryCronJob(gpt:any, bot:any){
    console.log("Summary Cron Job Running...")
    const opsInstance = new ops();
    const allUsers = await opsInstance.getAllUsers();
    for(const userObj of allUsers){
        let telegramId = userObj.telegramId;
        if(telegramId){
            const chat = {
                role:"user",
                content:"summary message",
                type:"summary",
                telegramId:telegramId,
                userMsg:"summary message",
            }
            let completion = await gpt.callGPT(chat);
            let res = completion.choices[0].message.content;
            if(res) await bot.api.sendMessage(telegramId,res);
        }
    }
}

