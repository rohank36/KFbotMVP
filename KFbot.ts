import { Bot, InlineKeyboard } from "grammy";
import { GPT } from './gpt';

//Init bot 
const bot = new Bot("7107203567:AAFse2-JV0wRB86tcP_M5KoonKFYPUFUA6E");

//Init GPT instance
const gpt = GPT.getInstance();

//Help Menu Command
const helpMenu = "<b>Help Menu ⚙️</b>\nHere are the commands that allow you to log entries:\n\n \\pretrg for Pre Training Entries\n\n \\posttrg for Post Training Entries\n\n \\weeklygoals for Weekly Goal Entries\n\n For any bug reports or other concerns please reach out to: kaizenflotech@gmail.com";
bot.command("help", async (ctx) => {
    await ctx.reply(helpMenu, {
        parse_mode: "HTML",
    });
});

//Start Command
const startMenu = "<b>Start Menu</b>\n\nWelcome to KaizenFlo💪🌊🔥\n\nCongratulations on taking that fantastic step towards growth and learning off the mats. To help me better understand your journey and support you along the way, could you share some details about yourself? I'd love to know your name, age, profession, where you live, and the gym you train at? Put a /userinfo tag before entering your response. Here\'s an example:\n\n /userinfo I'm John Danaher, 127 years old, professor training out of New Wave Jiu Jitsu in Austin, Texas.";
bot.command("start", async (ctx) => {
    await ctx.reply(startMenu, {
        parse_mode: "HTML",
    });
})

//Processing user messages
async function processPreTrg(userMsg: string){
    console.log('in pretrg');
}

async function processPostTrg(userMsg: string){
    console.log('in posttrg');
}

async function processWeeklyGoals(userMsg: string){
    console.log('in weeklygoals');
    const prompt = "msg:"+userMsg;
    const ourPrompt = "Acknowledge the users weekly goal message and prompt them to start thinking about how they will move closer to this goal each session during the week. End it by prompting them to log a /pretrg and /postrg entry, also note that you will message them if they forget."
    const instruction = prompt + "\n\n" + ourPrompt;
    console.log(instruction);
    const chat = {
        role:"assistant",
        content: instruction
    }
    try{
        const completion = await gpt.callGPT(chat);
        return completion.choices[0].message.content;
    }catch(error){
        return errorHandler();
    }
}

async function processUserInfo(userMsg: string) {
    console.log('in userinfo');
    const prompt = "msg:"+userMsg;
    const ourPrompt = "Respond to the users message by acknowledging the details they mentioned and prompt them to log their weekly goals using /weeklygoals at the beginning of their message"
    const instruction = prompt + "\n\n" + ourPrompt;
    console.log(instruction);
    const chat = {
        role:"assistant",
        content: instruction
    }
    try{
        const completion = await gpt.callGPT(chat);
        return completion.choices[0].message.content;
    }catch(error){
        return errorHandler();
    }
}

async function processBadMsg(userMsg: string){
    console.log('bad message')
    const prompt = "msg:"+userMsg;
    const ourPrompt = "The user entered something without a tag. Acknowledge what they said but note that they have to use one of the valid tags: /pretrg, /posttrg, /weeklygoals. End by reminding them about the /help command in the menu."
    const instruction = prompt + "\n\n" + ourPrompt;
    console.log(instruction);
    const chat = {
        role:"assistant",
        content: instruction
    }
    try{
        const completion = await gpt.callGPT(chat);
        return completion.choices[0].message.content;
    }catch(error){
        return errorHandler();
    }
}

function errorHandler(){
    return "Something went wrong...";
}

//message handler
bot.on("message", async (ctx)=>{
    console.log(
        `${ctx.from.first_name} wrote ${
            "text" in ctx.message ? ctx.message.text : ""
        }`,
    );

    if(ctx.message.text){
        const msg = ctx.message.text.toLowerCase();
        let res;
        if (/^\/pretrg\b/.test(msg)) {
            res = await processPreTrg(msg);
        } else if (/^\/posttrg\b/.test(msg)) {
            res = await processPostTrg(msg);
        } else if (/^\/weeklygoals\b/.test(msg)) {
            res = await processWeeklyGoals(msg);
            if(res){
                await ctx.reply(res);
            }
        } else if (/^\/userinfo\b/.test(msg)) {
            res = await processUserInfo(msg);
            if(res){
                await ctx.reply(res);
            }
        } else {
            res = await processBadMsg(msg);
            if(res){
                await ctx.reply(res);
            }
        }   
        
        /*
        await ctx.reply(ctx.message.text.toUpperCase(), {
            entities: ctx.message.entities,
        });
        */
    }

})
  
//Start bot
bot.start();