import { Bot, InlineKeyboard } from "grammy";

//Init bot 
const bot = new Bot("7107203567:AAFse2-JV0wRB86tcP_M5KoonKFYPUFUA6E");

//Help Menu Command
const helpMenu = "<b>Help Menu</b>\n\nBlah blabh blagh balah asdf.";
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


function processPreTrg(){
    console.log('in pretrg');
}

function processPostTrg(){
    console.log('in posttrg');
}

function processWeeklyGoals(){
    console.log('in weeklygoals');
}

function processUserInfo(){
    console.log('in userinfo');
}

function processBadMsg(){
    console.log('bad message')
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
            res = processPreTrg();
        } else if (/^\/posttrg\b/.test(msg)) {
            res = processPostTrg();
        } else if (/^\/weeklygoals\b/.test(msg)) {
            res = processWeeklyGoals();
        } else if (/^\/userinfo\b/.test(msg)) {
            res = processUserInfo();
        } else {
           res = processBadMsg();
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