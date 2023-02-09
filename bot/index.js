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

const botName = "NESTRedEnvelopesBot"

bot.start(async (ctx) => {
  const chatId = ctx.chat.id
  const isBot = ctx.from.is_bot
  const lang = ctx.from.language_code
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
  if (ctx.startPayload && Number(ctx.startPayload) !== ctx.from.id) {
    try {
      const res = await Promise.all([
        axios({
          method: 'get',
          url: `https://cms.nestfi.net/bot-api/red-bot/user/${ctx.startPayload}`,
          headers: {
            'Authorization': `Bearer ${nest_token}`
          }
        }),
        axios({
          method: 'get',
          url: `https://cms.nestfi.net/bot-api/red-bot/prizes/${ctx.startPayload}`,
          headers: {
            'Authorization': `Bearer ${nest_token}`
          }
        }),
      ])
      const user = res[0].data
      const prize = res[1].data
      if (user.errorCode === 0 && user.value) {
        await axios({
          method: 'POST',
          url: `https://cms.nestfi.net/bot-api/red-bot/user`,
          data: {
            chatId: ctx.from.id,
            tgName: ctx.from.username,
            inviteCode: ctx.startPayload,
          },
          headers: {
            'Authorization': `Bearer ${nest_token}`
          }
        }).catch((e) => console.log(e))
      } else if (prize.errorCode === 0 && prize.value) {
        ctx.reply(prize.value.text || t('You found a NEST Prize!', lang), {
          ...Markup.inlineKeyboard([
            [Markup.button.webApp(t('Snatch!', lang), `https://nest-prize-web-app-delta.vercel.app/prize?code=${ctx.startPayload}&lang=${lang}`)],
            [Markup.button.url(t('Star or Issue', lang), 'https://github.com/NEST-Protocol/NEST-Prize-WebApp')],
          ])
        })
        return
      } else {
        await lmt.removeTokens(1)
        ctx.reply(t('Sorry, this is not a valid NEST prize or a valid reference link.', lang))
        return
      }
    } catch (e) {
      console.log(e)
    }
  }
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
    ctx.reply(t('Welcome to NEST FI\n\nWallet and Twitter must be added to join NEST FI campaign\n\nYour wallet: {{wallet}}\nYour twitter: {{twitter}}\nYour ref link: https://t.me/NESTRedEnvelopesBot?start={{ref}}\n\nGiveaway events, click on NESTFi Events.', lang, {
      wallet: user?.value?.wallet,
      twitter: user?.value?.twitterName,
      ref: ctx.from.id
    }), {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.url(t('invite', lang), `https://nest-prize-web-app-delta.vercel.app/api/share2?from=${ctx.from.id}`)],
        [Markup.button.callback(t('Set Twitter', lang), 'inputUserTwitter', user?.value?.twitterName), Markup.button.callback(t('Set Wallet', lang), 'setUserWallet', user?.value?.wallet)],
        [Markup.button.callback(t('NESTFi S5 Food Festival', lang), 'NESTFiEvents')],
        [Markup.button.callback(t('NEST Roundtable 24', lang), 'NESTRoundtable')],
        [Markup.button.url(t('go to futures', lang), 'https://finance.nestprotocol.org/#/futures'), Markup.button.callback(t('Share my positions', lang), 'shareMyFutures')],
      ])
    })
    
  } catch (e) {
    console.log(e)
  }
})

bot.action('NESTRoundtable', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
  await lmt.removeTokens(1)
  await ctx.editMessageText(t(`NEST Roundtable 24\nTasks:\n1. RT the Tweet & @ 3 friends\nLink: [https://twitter.com/NEST_Protocol/status/1623295788985241601](https://twitter.com/NEST_Protocol/status/1623295788985241601)\n2. Join the Space\nLink: [https://twitter.com/i/spaces/1BdGYygBbmBGX?s=20](https://twitter.com/i/spaces/1BdGYygBbmBGX?s=20)`, lang), {
    ...Markup.inlineKeyboard([
      [Markup.button.callback(t('« Back', lang), 'menu')],
    ])
  })
})

bot.action('inputUserTwitter', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
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
  const lang = ctx.update.callback_query.from.language_code
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
    await ctx.editMessageText(t("Welcome to NEST FI\n\nWallet and Twitter must be added to join NEST FI campaign\n\nYour wallet: {{wallet}}\nYour twitter: {{twitter}}\nYour ref link: https://t.me/NESTRedEnvelopesBot?start={{ref}}\n\nGiveaway events, click on NESTFi Events.", lang, {
      wallet: res?.data?.value?.wallet,
      twitter: res?.data?.value?.twitterName,
      ref: ctx.update.callback_query.from.id
    }), {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.url(t('invite',lang), `https://nest-prize-web-app-delta.vercel.app/api/share2?from=${ctx.from.id}`)],
        [Markup.button.callback(t('Set Twitter', lang), 'inputUserTwitter', res?.data?.value?.twitterName), Markup.button.callback(t('Set Wallet',lang), 'setUserWallet', res?.data?.value?.wallet)],
        [Markup.button.callback(t('NESTFi S5 Food Festival', lang), 'NESTFiEvents')],
        [Markup.button.url(t('go to futures', lang), 'https://finance.nestprotocol.org/#/futures'), Markup.button.callback(t('Share my positions',lang), 'shareMyFutures')],
      ])
    })
  } catch (e) {
    console.log(e)
    await lmt.removeTokens(1)
  }
})

bot.action('shareMyFutures', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
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
      return [Markup.button.url(`${order.token} ${order.level}x ${order.orientation} ${order.rate}%`, `https://nest-prize-web-app-delta.vercel.app/share?from=${ctx.update.callback_query.from.id}&rate=${order.rate}&orientation=${order.orientation}&level=${order.level}&token=${order.token}&open_price=${order.open_price}&now_price=${order.now_price}`)]
    })
    // add back button to keyboards
    keyboards.push([Markup.button.callback(t('« Back', lang), 'menu')])
    await ctx.editMessageText(t(`Share your futures orders:`, lang), Markup.inlineKeyboard(keyboards))
  } catch (e) {
    console.log(e)
  }
})

bot.action('NESTFiEvents', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'NESTFiEvents',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
        .catch((e) => console.log(e))
    await ctx.editMessageText(t(`Event Introduction\n\n🍔 Hamburger (New user First Order Bonus)\nBonus: 200NEST\n\n🍕 Pizza (Invitation Bonus)\nOngoing Bonus:0.1% of the trading volume (only calculate the leverage of opening quantity X).\n\n🐣 Butter chicken (Volume Bonus)\nBonus:\n5x leverage bonus 5–50 NEST.\n10x leverage bonus 10–100 NEST.\n20x leverage bonus 20–200 NEST.\n\n🍦 Ice cream\nReward: 0.05% of total trading volume as bonus pool, 50% of trading volume ranking, 50% of profit ranking\nDetails：https://nest-protocol.medium.com/s5-nestfi-food-festival-63120836d5ba`, lang), {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.url(t('🍔 Hamburger', lang), `https://t.me/${botName}?start=149`), Markup.button.callback(t('🍕 Pizza', lang), 'pizza')],
        [Markup.button.callback(t('🐣 Butter chicken', lang), 'butterChicken'), Markup.button.callback(t('🍨 Ice cream', lang), 'iceCream')],
        [Markup.button.url(t('Once a day', lang), 'https://t.me/NEST_DAO/1305')],
        [Markup.button.callback(t('« Back', lang), 'menu')]
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('pizza', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'pizza',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  await lmt.removeTokens(1)
  await ctx.answerCbQuery()
      .catch((e) => console.log(e))
  await ctx.editMessageText(t(`Commission = 0.1% of the trading volume (only calculate the leverage of opening quantity X).\nYour reference link: https://t.me/NESTRedEnvelopesBot?start={{ref}}`, lang, {
    ref: ctx.update.callback_query.from.id
  }), {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    ...Markup.inlineKeyboard([
      [Markup.button.webApp(t('pizza info', lang), `https://nest-prize-web-app-delta.vercel.app/pizza?chatId=${ctx.update.callback_query.from.id}`)],
      [Markup.button.callback(t('« Back', lang), 'NESTFiEvents')],
    ])
  })
})

bot.action('iceCream', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'iceCream',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  await lmt.removeTokens(1)
  await ctx.answerCbQuery()
  await ctx.editMessageText(t(`🍦 Ice cream\nReward: 0.05% of total trading volume as bonus pool, 50% of trading volume ranking, 50% of profit ranking\n1. Trading Volume Ranking\nConditions: Trading volume must be greater than 100,000 (calculated leverage) to be eligible to participate.\nReward: The top 80 rewards will be awarded every three days according to the trading volume ranking.\n2. Profit Ranking\nConditions: The principal amount of a single trade must be greater than 1000nest (not counting leverage) to be eligible to participate.\nReward: The top 80 rewards will be awarded every three days according to the profit ranking`, lang), {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    ...Markup.inlineKeyboard([
      [Markup.button.webApp(t('Rank', lang), `https://nest-prize-web-app-delta.vercel.app/ice-cream?chatId=${ctx.update.callback_query.from.id}`)],
      [Markup.button.callback(t('« Back', lang), 'NESTFiEvents')],
    ])
  })
})

bot.action('butterChicken', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'butterChicken',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    const [ticket5, ticket10, ticket20] = await Promise.all([
      axios({
        method: 'get',
        url: `https://cms.nestfi.net/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=5`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
        }
      }),
      axios({
        method: 'get',
        url: `https://cms.nestfi.net/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=10`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
        }
      }),
      axios({
        method: 'get',
        url: `https://cms.nestfi.net/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=20`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
        }
      })
    ])
    const ticket5Count = ticket5.data.data?.tickets || 0
    const ticket5History = ticket5.data.data?.history || []
    const ticket10Count = ticket10.data.data?.tickets || 0
    const ticket10History = ticket10.data.data?.history || []
    const ticket20Count = ticket20.data.data?.tickets || 0
    const ticket20History = ticket20.data.data?.history || []
    
    await lmt.removeTokens(1)
    ctx.answerCbQuery()
    await ctx.editMessageText(t('conditions\n\nButter chicken (Trading bonus)\n\nRequirements:\n1.random bonus for every 800 futures NEST volume accumulated\n2. Order length must be greater than 5 minutes, with leverage\noptions of 5x, 10x, 20x（Unlimited times）\n\nBonus:\n5x leverage bonus 5–50 NEST.\n10x leverage bonus 10–100 NEST.\n20x leverage bonus 20–200 NEST.\n\n5x remaining butter chicken: {{ticket5Count}}\n{{ticket5History}}\n\n10x remaining butter chicken: {{ticket10Count}}\n{{ticket10History}}\n\n20x remaining butter chicken: {{ticket20Count}}\n{{ticket20History}}', lang, {
      ticket5Count: ticket5Count,
      ticket5History: ticket5History.map((item) => `${item} NEST`).join('\n'),
      ticket10Count: ticket10Count,
      ticket10History: ticket10History.map((item) => `${item} NEST`).join('\n'),
      ticket20Count: ticket20Count,
      ticket20History: ticket20History.map((item) => `${item} NEST`).join('\n'),
    }), {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('5x draw', lang), 'draw5x', ticket5Count <= 0)],
        [Markup.button.callback(t('10x draw', lang), 'draw10x', ticket10Count <= 0)],
        [Markup.button.callback(t('20x draw',lang), 'draw20x', ticket20Count <= 0)],
        [Markup.button.callback(t('« Back',lang), 'NESTFiEvents')]
      ])
    })
  } catch (e) {
    console.log(e)
    ctx.answerCbQuery(t('Some error occurred.', lang))
  }
})

bot.action('draw5x', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'draw5x',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    const res = await axios({
      method: 'post',
      url: `https://cms.nestfi.net/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=5`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
      }
    })
    const ticketCount = res.data.data?.tickets || 0
    const ticketHistory = res.data.data?.history || []
    
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
        .catch((e) => console.log(e))
    await ctx.editMessageText(`5x remaining butter chicken: ${ticketCount}
${ticketHistory.map((item) => `${item} NEST`).join('\n')}`, {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('5x draw', lang), 'draw5x', ticketCount <= 0)],
        [Markup.button.callback(t('« Back', lang), 'butterChicken')]
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('draw10x', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'draw10x',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    const res = await axios({
      method: 'post',
      url: `https://cms.nestfi.net/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=10`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
      }
    })
    const ticketCount = res.data.data?.tickets || 0
    const ticketHistory = res.data.data?.history || []
    
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
        .catch((e) => console.log(e))
    await ctx.editMessageText(`10x remaining butter chicken: ${ticketCount}
${ticketHistory.map((item) => `${item} NEST`).join('\n')}`, {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('10x draw', lang), 'draw10x', ticketCount <= 0)],
        [Markup.button.callback(t('« Back', lang), 'butterChicken')]
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('draw20x', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
  axios({
    method: 'post',
    url: `https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`,
    data: {
      client_id: `${ctx.update.callback_query.from.id}`,
      user_id: `${ctx.update.callback_query.from.id}`,
      events: [{
        name: 'click',
        params: {
          value: 'draw20x',
          language_code: lang,
        },
      }]
    }
  }).catch((e) => console.log(e))
  try {
    const res = await axios({
      method: 'post',
      url: `https://cms.nestfi.net/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=20`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
      }
    })
    const ticketCount = res.data.data?.tickets || 0
    const ticketHistory = res.data.data?.history || []
    
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
        .catch((e) => console.log(e))
    await ctx.editMessageText(`20x remaining butter chicken: ${ticketCount}
${ticketHistory.map((item) => `${item} NEST`).join('\n')}`, {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t('20x draw', lang), 'draw20x', ticketCount <= 0)],
        [Markup.button.callback(t('« Back', lang), 'butterChicken')]
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('setUserWallet', async (ctx) => {
  const lang = ctx.update.callback_query.from.language_code
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
  const lang = ctx.message.from.language_code
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
              invite_code: res?.data?.value?.inviteCode || '',
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
