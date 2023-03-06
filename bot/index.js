const {Telegraf, Markup} = require('telegraf')
const {isAddress} = require("ethers/lib/utils");
const axios = require('axios')
const {RateLimiter} = require("limiter");
const i18n = require('i18n');

// Command
// start - show the menu

// limit of send message to different chat
const lmt = new RateLimiter({
  tokensPerInterval: 30,
  interval: 'second',
})

i18n.configure({
  locales: ['en', 'ja', 'bn', 'id', 'tr', 'vi', 'ko', 'ru'],
  directory: "./locales",
  register: global
})

const measurement_id = `G-BE17GNN7CH`;
const api_secret = process.env.GA_API_SECRET;

const t = (p, l, ph) => {
  return i18n.__({phrase: p, locale: l}, ph)
}

const token = process.env.BOT_TOKEN
const nest_token = process.env.NEST_API_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token)

bot.start(async (ctx) => {
  const chatId = ctx.chat.id
  const isBot = ctx.from.is_bot
  let lang = ctx.from.language_code
  if (!['en', 'ja', 'bn', 'id', 'tr', 'vi', 'ko', 'ru'].includes(lang)) {
    lang = 'en'
  }
  
  if (chatId < 0 || isBot) {
    return
  }
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${chatId}`,
      user_id: `${chatId}`,
      events: [{
        name: 'click',
        params: {
          value: 'start',
          language_code: lang,
          startPayload: ctx.startPayload,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    const res = await Promise.all([
      axios({
        method: 'POST',
        url: `https://cms.nestfi.net/bot-api/red-bot/user`,
        data: {
          chatId: ctx.from.id,
          tgName: ctx.from.username,
        },
        headers: {
          'Authorization': `Bearer ${nest_token}`
        }
      }),
      axios({
        method: 'GET',
        url: `https://cms.nestfi.net/bot-api/red-bot/user/${ctx.from.id}`,
        headers: {
          'Authorization': `Bearer ${nest_token}`,
        }
      })
    ])
    const user = res[1].data
    await lmt.removeTokens(1)
    ctx.reply(t('Welcome', lang, {
      wallet: user?.value?.wallet,
      twitter: user?.value?.twitterName,
      ref: user?.value?.wallet ? `${user?.value?.wallet?.slice(-8)?.toLowerCase()}` : 'Bind wallet first!'
    }), {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.url(t('invite', lang), `https://nest-prize-web-app-delta.vercel.app/api/share2?from=${user?.value?.wallet?.slice(-8)?.toLowerCase()}`)],
        [Markup.button.webApp('Invitation Info', `https://nest-prize-web-app-delta.vercel.app/pizza?chatId=${ctx.from.id}`)],
        [Markup.button.callback(t('Set Twitter', lang), 'inputUserTwitter', user?.value?.twitterName), Markup.button.callback(t('Set Wallet', lang), 'setUserWallet', user?.value?.wallet)],
        [Markup.button.callback('NESTFi S5 Food Festival (Ended)', 'NESTFiEvents')],
        [Markup.button.callback('NEST Roundtable Rewards', 'NESTRoundtable')],
        [Markup.button.url(t('go to futures', lang), 'https://finance.nestprotocol.org/#/futures'), Markup.button.callback(t('Share my positions', lang), 'shareMyFutures')],
      ])
    })
    
  } catch (e) {
    console.log(e)
  }
})

bot.action('NESTRoundtable', async (ctx) => {
  let lang = ctx.update.callback_query.from.language_code
  if (!['en', 'ja', 'bn', 'id', 'tr', 'vi', 'ko', 'ru'].includes(lang)) {
    lang = 'en'
  }
  
  await lmt.removeTokens(1)
  await ctx.editMessageText(`NEST Roundtable 27: NFT Opportunities in 2023
Rewards:
100 $NEST for 100 winners

Tasks:
1. RT the Tweet & @ 3 friends
Link: https://twitter.com/NEST_Protocol/status/1630900495308173313
2. Join the Space
Link: https://twitter.com/i/spaces/1YpKkgdgDqAKj
3. Follow @NEST_Protocol, @SeerFoundation`, {
    ...Markup.inlineKeyboard([
      [Markup.button.callback(t('« Back', lang), 'menu')],
    ])
  })
})

bot.action('inputUserTwitter', async (ctx) => {
  let lang = ctx.update.callback_query.from.language_code
  if (!['en', 'ja', 'bn', 'id', 'tr', 'vi', 'ko', 'ru'].includes(lang)) {
    lang = 'en'
  }
  const isBot = ctx.update.callback_query.from.is_bot
  if (isBot) {
    return
  }
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'inputUserTwitter',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    await axios({
      method: 'POST',
      url: `https://cms.nestfi.net/bot-api/red-bot/user`,
      data: {
        chatId: ctx.update.callback_query.from.id,
        intent: 'setUserTwitter',
      },
      headers: {
        'Authorization': `Bearer ${nest_token}`
      }
    })
    await lmt.removeTokens(1)
    await ctx.reply(t('Please input your twitter name with @', lang))
  } catch (e) {
    console.log(e)
  }
})

bot.action('menu', async (ctx) => {
  let lang = ctx.update.callback_query.from.language_code
  if (!['en', 'ja', 'bn', 'id', 'tr', 'vi', 'ko', 'ru'].includes(lang)) {
    lang = 'en'
  }
  const isBot = ctx.update.callback_query.from.is_bot
  if (isBot) {
    return
  }
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'menu',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    const res = await axios({
      method: 'GET',
      url: `https://cms.nestfi.net/bot-api/red-bot/user/${ctx.update.callback_query.from.id}`,
      headers: {
        'Authorization': `Bearer ${nest_token}`,
      }
    })
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
        .catch((e) => console.log(e))
    await ctx.editMessageText(t("Welcome", lang, {
      wallet: res?.data?.value?.wallet,
      twitter: res?.data?.value?.twitterName,
      ref: res?.data?.value?.wallet ? `${res?.data?.value?.wallet?.slice(-8)?.toLowerCase()}` : 'Bind wallet first!'
    }), {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.url(t('invite',lang), `https://nest-prize-web-app-delta.vercel.app/api/share2?from=${ctx.update.callback_query.from.id}`)],
        [Markup.button.webApp('Invitation Info', `https://nest-prize-web-app-delta.vercel.app/pizza?chatId=${ctx.update.callback_query.from.id}`)],
        [Markup.button.callback(t('Set Twitter', lang), 'inputUserTwitter', res?.data?.value?.twitterName), Markup.button.callback(t('Set Wallet',lang), 'setUserWallet', res?.data?.value?.wallet)],
        [Markup.button.callback('NESTFi S5 Food Festival (Ended)', 'NESTFiEvents')],
        [Markup.button.callback(t('NEST Roundtable Rewards', lang), 'NESTRoundtable')],
        [Markup.button.url(t('go to futures', lang), 'https://finance.nestprotocol.org/#/futures'), Markup.button.callback(t('Share my positions',lang), 'shareMyFutures')],
      ])
    })
  } catch (e) {
    console.log(e)
    await lmt.removeTokens(1)
  }
})

bot.action('shareMyFutures', async (ctx) => {
  let lang = ctx.update.callback_query.from.language_code
  if (!['en', 'ja', 'bn', 'id', 'tr', 'vi', 'ko', 'ru'].includes(lang)) {
    lang = 'en'
  }
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'shareMyFutures',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    const userRes = await axios({
      method: 'GET',
      url: `https://cms.nestfi.net/bot-api/red-bot/user/${ctx.update.callback_query.from.id}`,
      headers: {
        'Authorization': `Bearer ${nest_token}`,
      }
    })
    if (!userRes?.data?.value?.wallet) {
      await lmt.removeTokens(1)
      await ctx.answerCbQuery()
          .catch((e) => console.log(e))
      await ctx.editMessageText(t('Please set your wallet first', lang), {
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t('« Back', lang), 'menu')],
        ])
      })
      return
    }
    const res = await axios({
      method: 'GET',
      url: `https://cms.nestfi.net/bot-api/red-bot/user/future?wallet=${userRes?.data?.value?.wallet}`,
      headers: {
        'Authorization': nest_token,
      }
    })
    const orders = res.data.value
    await ctx.answerCbQuery()
    const keyboards = orders.map((order) => {
      return [Markup.button.url(`${order.token} ${order.level}x ${order.orientation} ${order.rate}%`, `https://nest-prize-web-app-delta.vercel.app/share?from=${userRes?.data?.value?.wallet.slice(-8).toLowerCase()}&rate=${order.rate}&orientation=${order.orientation}&level=${order.level}&token=${order.token}&open_price=${order.open_price}&now_price=${order.now_price}`)]
    })
    // add back button to keyboards
    keyboards.push([Markup.button.callback(t('« Back', lang), 'menu')])
    await ctx.editMessageText(t(`Share your futures orders:`, lang), Markup.inlineKeyboard(keyboards))
  } catch (e) {
    console.log(e)
  }
})

bot.action('NESTFiEvents', async (ctx) => {
  try {
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
        .catch((e) => console.log(e))
    await ctx.editMessageText(`S5 food festival is end, settlement is in progress.`, {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('« Back', 'menu')]
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('setUserWallet', async (ctx) => {
  let lang = ctx.update.callback_query.from.language_code
  if (!['en', 'ja', 'bn', 'id', 'tr', 'vi', 'ko', 'ru'].includes(lang)) {
    lang = 'en'
  }
  const isBot = ctx.update.callback_query.from.is_bot
  if (isBot) {
    return
  }
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'setUserWallet',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    await axios({
      method: 'POST',
      url: `https://cms.nestfi.net/bot-api/red-bot/user`,
      data: {
        chatId: ctx.update.callback_query.from.id,
        intent: 'setUserWallet',
      },
      headers: {
        'Authorization': `Bearer ${nest_token}`
      }
    })
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
    await ctx.editMessageText(t('Please send your wallet address:', lang))
  } catch (e) {
    console.log(e)
  }
})

bot.on('message', async (ctx) => {
  let lang = ctx.message.from.language_code
  if (!['en', 'ja', 'bn', 'id', 'tr', 'vi', 'ko', 'ru'].includes(lang)) {
    lang = 'en'
  }
  const input = ctx.message.text
  const chat_id = ctx.message.chat.id
  const isBot = ctx.message.from.is_bot
  if (chat_id < 0 || isBot) {
    return
  }
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${chat_id}`,
      user_id: `${chat_id}`,
      events: [{
        name: 'message',
        params: {
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    const res = await axios({
      method: 'GET',
      url: `https://cms.nestfi.net/bot-api/red-bot/user/${ctx.message.from.id}`,
      headers: {
        'Authorization': `Bearer ${nest_token}`,
      }
    })
    
    const intent = res?.data?.value?.intent
    if (res?.data?.value?.disable === 'Y') {
      await lmt.removeTokens(1)
      await ctx.reply(t("Sorry, you are blocked.", lang))
      return
    }
    
    if (intent === null) {
      await lmt.removeTokens(1)
      ctx.reply(t('I have no idea what you are talking about.',lang))
    } else if (intent === 'setUserWallet') {
      if (isAddress(input)) {
        try {
          await axios({
            method: 'POST',
            url: `https://cms.nestfi.net/bot-api/red-bot/user`,
            data: {
              chatId: ctx.from.id,
              wallet: input,
            },
            headers: {
              'Authorization': `Bearer ${nest_token}`
            }
          }).catch((e) => console.log(e))
          
          await axios({
            method: 'POST',
            url: `https://cms.nestfi.net/workbench-api/activity/user/update`,
            data: JSON.stringify({
              user_id: ctx.from.id,
              username: res?.data?.value?.tgName || '',
              wallet: input
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${nest_token}`
            }
          })
          await lmt.removeTokens(1)
          ctx.reply(t(`Your wallet address has updated: {{input}}`, lang, {
            input: input
          }), Markup.inlineKeyboard([
            [Markup.button.callback(t('« Back', lang), 'menu')],
          ]))
        } catch (e) {
          await lmt.removeTokens(1)
          ctx.reply(t('Some error occurred.',lang), {
            reply_to_message_id: ctx.message.message_id,
            ...Markup.inlineKeyboard([
              [Markup.button.callback(t('« Back', lang), 'menu')],
              [Markup.button.url(t('New Issue', lang), 'https://github.com/NEST-Protocol/NEST-Prize-WebApp/issues/new')]
            ])
          })
        }
      } else {
        await lmt.removeTokens(1)
        ctx.reply(t('Please input a valid wallet address.',lang), {
          reply_to_message_id: ctx.message.message_id,
        })
      }
    } else if (intent === 'setUserTwitter') {
      if (input.startsWith('@')) {
        try {
          await axios({
            method: 'POST',
            url: `https://cms.nestfi.net/bot-api/red-bot/user`,
            data: {
              chatId: ctx.from.id,
              twitterName: input.slice(1),
            },
            headers: {
              'Authorization': `Bearer ${nest_token}`
            }
          })
          await lmt.removeTokens(1)
          ctx.reply(t(`Your twitter has updated: {{input}}`, lang, {
            input: input.slice(1)
          }), Markup.inlineKeyboard([
            [Markup.button.callback(t('« Back', lang), 'menu')],
          ]))
        } catch (e) {
          await lmt.removeTokens(1)
          ctx.reply(t('Some error occurred.', lang), {
            reply_to_message_id: ctx.message.message_id,
            ...Markup.inlineKeyboard([
              [Markup.button.callback(t('« Back', lang), 'menu')],
              [Markup.button.url(t('New Issue', lang), 'https://github.com/NEST-Protocol/NEST-Prize-WebApp/issues/new')]
            ])
          })
        }
      } else {
        ctx.reply(t('Please input a valid twitter account start with @.', lang))
      }
    }
  } catch (e) {
    await lmt.removeTokens(1)
    ctx.reply(t('Some error occurred.', lang))
  }
})

exports.handler = async (event, context, callback) => {
  const tmp = JSON.parse(event.body);
  await bot.handleUpdate(tmp);
  return callback(null, {
    statusCode: 200,
    body: '',
  });
};
