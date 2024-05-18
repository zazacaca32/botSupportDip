const { Telegraf, Markup } = require('telegraf')
import 'dotenv/config'

let config = {
    "token": "6930134753:AAEbV9KEev_ZoAOd5Lu4fdcjPKZbTdfEGwA", // Токен бота
    "admin": 5922141739 // id владельца бота
};

const bot = new Telegraf(config.token);


let replyText = {
    "helloAdmin": "Привет админ, ждем сообщения от пользователей",
    "helloUser":  "Приветствую, отправьте мне сообщение. Постараюсь ответить в ближайшее время. или выберите",
    "replyWrong": "Для ответа пользователю используйте функцию Ответить."
};


let quest = [{
    question: `Какими юридическими услугами вы занимаетесь, и могли бы вы поделиться общими ценами на них?`,
    answer: `Мы готовы предоставить вам квалифицированную юридическую помощь в широком спектре областей, начиная от общегражданских дел и заканчивая арбитражными спорами. Наша цель - обеспечить вам доступ к правосудию и защитить ваши интересы.

Мы предлагаем гибкую ценовую политику, начиная с бесплатной первой консультации по телефону. Составление искового заявления и представительство в инстанциях Москвы и Московской области осуществляется по честным и прозрачным тарифам, а полное ведение дела будет гарантировано с нашей стороны от 40 000 рублей.

Для клиентов, нуждающихся в срочной помощи юриста, мы предоставляем услуги срочного вызова по разумным ценам, учитывая время суток и расстояние от места выезда до центра Москвы.

Мы нацелены на удовлетворение ваших потребностей и готовы предложить профессиональную помощь в любых ситуациях. Благодарим вас за доверие и готовы ответить на все ваши вопросы!`
},
{
    question: `Какие общие правовые вопросы могут требовать консультации с юристом, например, семейное право, недвижимость, налоги и т.д.?`,
    answer: `Общие правовые вопросы, которые могут потребовать консультации с юристом, включают в себя семейное право (разводы, усыновление, опека над детьми), вопросы недвижимости (покупка/продажа недвижимости, аренда, споры с соседями), налоговые вопросы (налоговые льготы, налоговые проверки, налоговые выплаты) и многое другое. Во всех этих случаях юрист может помочь в разъяснении законов и правил, предоставить консультацию по действующему законодательству и защитить интересы клиента в суде, если это необходимо.`
}];

let isAdmin = (userId) => {
    return userId == config.admin;
};

let forwardToAdmin = async (ctx) => {
    if (isAdmin(ctx.message.from.id)) {
        ctx.reply(replyText.replyWrong);
    } else {
        let message = ctx.message;
       await ctx.telegram.sendMessage(config.admin, `Новое сообщение от <b>${message.from.first_name} ${message.from.last_name}</b>\n`, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
            Markup.button.callback("Ответьте на это сообщение", message.from.id),
        ]),
    });
       ctx.forwardMessage(config.admin)
    }
};

bot.start((ctx) => {
    ctx.reply(isAdmin(ctx.message.from.id)
        ? replyText.helloAdmin
        : replyText.helloUser);
    for (const i in quest){
         ctx.reply(quest[i].question, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
            Markup.button.callback("Узнать ответ", i),
        ]),
    });
    }
});

bot.on('callback_query', async (ctx) => {
    console.log(ctx.update.callback_query.data);
    const data_id = ctx.update.callback_query.data;


 ctx.reply(`${quest[data_id].question}\n\n${quest[data_id].answer}`);

  // Using context shortcut
  await ctx.answerCbQuery()
})

bot.on('message', (ctx) => {

    let message = ctx.message;
    if (isAdmin(message.from.id)){
    if (message.reply_to_message)
        if (message.reply_to_message.reply_markup)
            if (message.reply_to_message.reply_markup.inline_keyboard) {
                let reply_id = (message.reply_to_message.reply_markup.inline_keyboard[0][0].callback_data)
                ctx.telegram.sendCopy(reply_id, message);
        }
    } else {
        forwardToAdmin(ctx);
    }
});


bot.launch();