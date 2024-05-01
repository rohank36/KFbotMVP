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
const startMenu = "<b>Start Menu</b>\n\nBlah blabh blagh balah asdf.";
bot.command("start", async (ctx) => {
    await ctx.reply(startMenu, {
        parse_mode: "HTML",
    });
})

//message handler
bot.on("message", async (ctx)=>{
    console.log(
        `${ctx.from.first_name} wrote ${
            "text" in ctx.message ? ctx.message.text : ""
        }`,
    );

    if(ctx.message.text){
        await ctx.reply(ctx.message.text.toUpperCase(), {
            entities: ctx.message.entities,
        });
    }

})
  
//Start bot
bot.start();