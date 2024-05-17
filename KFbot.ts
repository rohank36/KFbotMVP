import { Bot } from "grammy";
import { GPT } from './gpt';
import { Database } from './mongo';

//TODO: Get rid of all unnecessary console.logs

//Init MongoDB instance
let db;
async function connectDB(){
    try{
        const dbInstance = await Database.getInstance();
        db = dbInstance.getDb();
    }catch(error){
        console.error("Failed to connect bot to database:", error);
    }
}
connectDB();

//Init bot 
const bot = new Bot("7107203567:AAFse2-JV0wRB86tcP_M5KoonKFYPUFUA6E");

//Init GPT instance
const gpt = GPT.getInstance();

//Help Menu Command
const helpMenu = "<b>Help Menu ⚙️</b>\nHere are the commands that allow you to log entries:\n\n \\pretrg for Pre Training Entries\n\n \\posttrg for Post Training Entries\n\n \\weeklygoals for Weekly Goal Entries\n\nFor any bug reports or other concerns please reach out to: kaizenflotech@gmail.com";
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

//Process User Messages
async function processUserMsg(userMsg: string, type: string, telegramId: number){
    let prompt = "msg:"+userMsg;
    let ourPrompt;
    switch (type) {
        case 'pretrg':
            ourPrompt = "Respond by acknowledging their plan, motivating them, and end it by saying you're looking forward to hearing from them in their /posttrg entry.";
            break;
    
        case 'posttrg':
            ourPrompt = "Respond by acknowledging what happened in the session in a supportive manner. Give some questions that will lead them to think deeper about the session and what they can do better next session. End it by telling them to log it in /pretrg tomorrow.";
            break;
    
        case 'weeklygoals':
            ourPrompt = "Acknowledge the users weekly goal message and prompt them to start thinking about how they will move closer to this goal each session during the week. End it by prompting them to log a /pretrg and /postrg entry, also note that you will message them if they forget.";
            break;
    
        case 'userInfo':
            ourPrompt = "Respond to the users message by acknowledging the details they mentioned and prompt them to log their weekly goals using /weeklygoals at the beginning of their message";
            break;
            
        case 'summary':
            ourPrompt= "";
            break;

        default:
            // Handle badMsg type here
            ourPrompt = "The user entered something without a tag. Acknowledge what they said but note that they have to use one of the valid tags: /pretrg, /posttrg, /weeklygoals. End by reminding them about the /help command in the menu."
            break;
    }
    const instruction = prompt + "\n\n" + ourPrompt;
    console.log(instruction);
    const chat = {
        role:"user",
        content: instruction,
        type: type,
        telegramId: telegramId,
        userMsg: userMsg,
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
        `${ctx.from.first_name} ${ctx.from?.id} wrote ${
            "text" in ctx.message ? ctx.message.text : ""
        }`,
    );

    //const chatId = ctx.chat.id;
    //const userName = ctx.from.first_name;
    const telegramId = ctx.from?.id;
    let msg;
    let res; 

    if(ctx.chat?.type !== 'private'){
        await ctx.reply("Please start a private chat with this bot."); //TODO: Add bot to grp and check to see if it replies properly
    }else{
        if(ctx.message.text){
            msg = ctx.message.text.toLowerCase();
            if (/^\/pretrg\b/.test(msg)) {
                res = await processUserMsg(msg, 'pretrg', telegramId);
            } else if (/^\/posttrg\b/.test(msg)) {
                res = await processUserMsg(msg, 'posttrg', telegramId);
            } else if (/^\/weeklygoals\b/.test(msg)) {
                res = await processUserMsg(msg, 'weeklygoals', telegramId);
            } else if (/^\/userinfo\b/.test(msg)) {
                res = await processUserMsg(msg, 'userInfo', telegramId);
            } else if (/^\/summary\b/.test(msg)){
                res = await processUserMsg(msg, 'summary', telegramId);
            }else {
                res = await processUserMsg(msg, 'badMsg', telegramId);
            } 
            if(res) await ctx.reply(res);
        }
    }
})
  
//Start bot
bot.start();