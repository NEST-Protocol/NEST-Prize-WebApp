const {Telegraf, Markup} = require('telegraf')
const {isAddress} = require("ethers/lib/utils");
const axios = require('axios')
const {RateLimiter} = require("limiter");

// Command
// start - show the menu

// limit of send message to different chat
const lmt = new RateLimiter({
  tokensPerInterval: 30,
  interval: 'second',
})

const token = process.env.BOT_TOKEN
const nest_token = process.env.NEST_API_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token)

const botName = "NESTRedEnvelopesBot"

function hashCode(str) {
  let hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

bot.start(async (ctx) => {
  const chatId = ctx.chat.id
  const isBot = ctx.from.is_bot
  if (chatId < 0 || isBot) {
    return
  }
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
      }
      if (prize.errorCode === 0  && prize.value) {
        ctx.reply(prize.value.text || 'You found a NEST Prize!', Markup.inlineKeyboard([
          Markup.button.webApp('Snatch!', `https://nest-prize-web-app.vercel.app/prize?code=${ctx.startPayload}`),
        ]))
        return
      }
      await lmt.removeTokens(1)
      ctx.reply('Sorry, this is not a valid NEST prize or a valid reference link.')
      return
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
    ctx.reply(`Welcome to NEST Prize

Your wallet: ${user?.value?.wallet || 'Not set yet'},
Your twitter: ${user?.value?.twitterName || 'Not set yet'},

Your ref link: https://t.me/NESTRedEnvelopesBot?start=${ctx.from.id}

Giveaway events, click on NESTFi Events.

/help`, {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🤩', 'forDeveloper'), Markup.button.callback('Invite', 'invite')],
        [Markup.button.callback('Set Twitter', 'inputUserTwitter'), Markup.button.callback('Set Wallet', 'setUserWallet', user?.value?.wallet)],
        [Markup.button.callback('NESTFi S3 Food Festival', 'NESTFiEvents')],
        [Markup.button.url('go to futures', 'https://finance.nestprotocol.org/#/futures'), Markup.button.callback('Share my Futures', 'shareMyFutures')],
      ])
    })

  } catch (e) {
    console.log(e)
  }
})

bot.action('invite', async (ctx) => {
  await lmt.removeTokens(1)
  try {
    await ctx.replyWithPhoto(`https://nest-prize-web-app.vercel.app/api/share?from=${ctx.update.callback_query.from.id}`)
  } catch (e) {
    console.log(e)
    await ctx.reply(`https://nest-prize-web-app.vercel.app/api/share?from=${ctx.update.callback_query.from.id}`)
  }
})

bot.command('help', async (ctx) => {
  const chat_id = ctx.chat.id
  if (chat_id < 0) {
    return
  }
  await lmt.removeTokens(1)
  ctx.reply(`I can help you to get NEST Prizes.

/start - show the menu

You can control me by sending these commands:

*Admin Portal*
/admin - send prizes
  `, {
    parse_mode: 'Markdown',
  })
})

bot.command('admin', async (ctx) => {
  const chat_id = ctx.chat.id;
  if (chat_id < 0 || WHITELIST.findIndex((id) => id === chat_id) === -1) {
    await lmt.removeTokens(1)
    await ctx.reply(`Sorry, ${chat_id} are not allowed to use this command!`, Markup.inlineKeyboard([
      [Markup.button.url('New Issue', 'https://github.com/NEST-Protocol/NESTRedEnvelopesBot/issues')]
    ]))
    return
  }
  await lmt.removeTokens(1)
  await ctx.reply(`NEST Prize Admin Portal`, Markup.inlineKeyboard([
    [Markup.button.callback('Send', 'setConfig')],
  ]))
})

bot.action('inputUserTwitter', async (ctx) => {
  const isBot = ctx.update.callback_query.from.is_bot
  if (isBot) {
    return
  }
  await axios({
    method: 'POST',
    url: `https://cms.nestfi.net/bot-api/red-bot/user`,
    data: {
      chatId: ctx.from.id,
      intent: 'setUserTwitter',
    },
    headers: {
      'Authorization': `Bearer ${nest_token}`
    }
  }).catch((e) => console.log(e))
  await lmt.removeTokens(1)
  await ctx.reply('Please input your twitter name with @')
})

bot.action('menu', async (ctx) => {
  const isBot = ctx.update.callback_query.from.is_bot
  if (isBot) {
    return
  }
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
    await ctx.editMessageText(`Welcome to NEST Prize

Your wallet: ${res?.data?.value?.wallet || 'Not set yet'},
Your twitter: ${res?.data?.value?.twitterName || 'Not set yet'},

Your ref link: https://t.me/NESTRedEnvelopesBot?start=${ctx.update.callback_query.from.id}

Giveaway events, click on NESTFi Events.

/help`, {
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🤩', 'forDeveloper'), Markup.button.callback('Invite', 'invite')],
        [Markup.button.callback('Set Twitter', 'inputUserTwitter'), Markup.button.callback('Set Wallet', 'setUserWallet', res?.data?.value?.wallet)],
        [Markup.button.callback('NESTFi S3 Food Festival', 'NESTFiEvents')],
        [Markup.button.url('go to futures', 'https://finance.nestprotocol.org/#/futures'), Markup.button.callback('Share my Futures', 'shareMyFutures')],
      ])
    })
  } catch (e) {
    console.log(e)
    await lmt.removeTokens(1)
  }
})

bot.action('shareMyFutures', async (ctx) => {
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
      await ctx.editMessageText(`Please set your wallet first`, {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('« Back', 'menu')],
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
      return [Markup.button.url(`${order.token} ${order.level}x ${order.orientation} ${order.rate}%`, `https://nest-prize-web-app.vercel.app/api/shareorder?from=${ctx.update.callback_query.from.id}&rate=${order.rate}&orientation=${order.orientation}&level=${order.level}&token=${order.token}&open_price=${order.open_price}&now_price=${order.now_price}`)]
    })
    // add back button to keyboards
    keyboards.push([Markup.button.callback('« Back', 'menu')])
    await ctx.editMessageText(`Share your futures orders:`, Markup.inlineKeyboard(keyboards))
  } catch (e) {
    console.log(e)
  }
})

bot.action('NESTFiEvents', async (ctx) => {
  try {
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
      .catch((e) => console.log(e))
    await ctx.editMessageText(`Event Introduction
  
🍔 Hamburger (New user First Order Bonus)
Bonus: 50 NEST+

🍕 Pizza (Invitation Bonus)
Fixed Bonus: 10 NEST.
Ongoing Bonus:0.5% of the total transaction volume

🐣 Butter chicken (Volume Bonus)
Bonus: 10x leverage bonus 10–100 NEST.
20x leverage bonus 20–200 NEST.

Details：https://nest-protocol.medium.com/s3-nestfi-food-festival-1590987ed5fd`, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.url('🍔 Hamburger', 'https://t.me/nestficommunity/47530'), Markup.button.callback('🍕 Pizza', 'pizza')],
        [Markup.button.callback('🐣 Butter chicken', 'butterChicken')],
        [Markup.button.callback('« Back', 'menu')]
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('pizza', async (ctx) => {
  try {
    const res = await axios({
      method: 'get',
      url: `https://work.parasset.top/workbench-api/activity/user/settle/detail?chatId=${ctx.update.callback_query.from.id}`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
      }
    })
    if (res.data.code === 0) {
      await lmt.removeTokens(1)
      await ctx.answerCbQuery()
        .catch((e) => console.log(e))
      await ctx.editMessageText(`**Invitees conditions**
1. 500 NEST accumulated on open futures positions
2. Leverage 10X or 20X
3. Position opening time greater than 5 minutes
0.5% of initial margin will be awarded to the inviter

Your ref link: https://t.me/NESTRedEnvelopesBot?start=${ctx.update.callback_query.from.id}

Complete pizza:
Total: ${res.data.data.positions.invite_positions10 + res.data.data.positions.invite_positions20} NEST , rewards: ${res.data.data.balance.detail.invite} NEST

`, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        ...Markup.inlineKeyboard([
          [Markup.button.callback('« Back', 'NESTFiEvents')]
        ])
      })
    } else {
      await ctx.answerCbQuery('Some error occurred.')
    }
  } catch (e) {
    await ctx.answerCbQuery('Some error occurred.')
  }
})

bot.action('butterChicken', async (ctx) => {
  try {
    const [ticket10, ticket20] = await Promise.all([
      axios({
        method: 'get',
        url: `https://work.parasset.top/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=10`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
        }
      }),
      axios({
        method: 'get',
        url: `https://work.parasset.top/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=20`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
        }
      })
    ])
    const ticket10Count = ticket10.data.data?.tickets || 0
    const ticket10History = ticket10.data.data?.history || []
    const ticket20Count = ticket20.data.data?.tickets || 0
    const ticket20History = ticket20.data.data?.history || []

    await lmt.removeTokens(1)
    ctx.answerCbQuery()
    await ctx.editMessageText(`conditions
Butter chicken （Trading bonus）

Requirements:
1.random bonus for every 500 futures NEST volume accumulated
2. Order length must be greater than 5 minutes, with leverage options of 10x, 20x（Unlimited times）

Bonus:
10x leverage bonus 10–100 NEST.
20x leverage bonus 20–200 NEST.

10x remaining butter chicken: ${ticket10Count}
${ticket10History.map((item) => `${item} NEST`).join('\n')}

20x remaining butter chicken: ${ticket20Count}
${ticket20History.map((item) => `${item} NEST`).join('\n')}
`, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('10x draw', 'draw10x', ticket10Count <= 0), Markup.button.callback('20x draw', 'draw20x', ticket20Count <= 0)],
        [Markup.button.callback('« Back', 'NESTFiEvents')]
      ])
    })
  } catch (e) {
    ctx.answerCbQuery('Some error occurred.')
  }
})

bot.action('draw10x', async (ctx) => {
  try {
    const res = await axios({
      method: 'post',
      url: `https://work.parasset.top/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=10`,
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
        [Markup.button.callback('10x draw', 'draw10x', ticketCount <= 0)],
        [Markup.button.callback('« Back', 'butterChicken')]
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('draw20x', async (ctx) => {
  try {
    const res = await axios({
      method: 'post',
      url: `https://work.parasset.top/workbench-api/activity/tickets?chatId=${ctx.update.callback_query.from.id}&type=20`,
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
        [Markup.button.callback('20x draw', 'draw20x', ticketCount <= 0)],
        [Markup.button.callback('« Back', 'butterChicken')]
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('forDeveloper', async (ctx) => {
  const isBot = ctx.update.callback_query.from.is_bot
  if (isBot) {
    return
  }
  try {
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
      .catch((e) => console.log(e))
    await ctx.editMessageText(`*Another Revolution in Blockchain*

*NEST PVM*
NEST Probability Virtual Machine (PVM) is a virtual machine-like structure based on the basic function library. Developers can develop various exciting applications based on the function library, similar to Ethereum virtual machine (EVM) programming.
Github repository: [NEST-PVM-V1.0](https://github.com/NEST-Protocol/NEST-PVM-V1.0). More [PVM Mechanism](https://nestprotocol.org/docs/Concept/PVM/)

*NEST Oracle*
NEST oracle is the only truly decentralized oracle on the market today.
Github repository: [NEST-Oracle-V4.0](https://github.com/NEST-Protocol/NEST-Oracle-V4.0). [How to Mining](https://nestprotocol.org/docs/Technical-Reference-NEST-Oracle/#how-to-mining/), [How to Call Price](https://nestprotocol.org/docs/Technical-Reference-NEST-Oracle/#how-to-call-price)
`, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.url('Follow Github', 'https://github.com/NEST-Protocol'), Markup.button.url('Developer Doc', 'https://nestprotocol.org/docs/PVM-Technical-Reference/')],
        [Markup.button.url('New Issues', 'https://github.com/NEST-Protocol/NESTRedEnvelopesBot/issues/new'), Markup.button.callback('« Back', 'menu')],
      ])
    })
  } catch (e) {
    console.log(e)
  }
})

bot.action('setUserWallet', async (ctx) => {
  const isBot = ctx.update.callback_query.from.is_bot
  if (isBot) {
    return
  }
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
    }).catch((e) => console.log(e))

    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
      .catch((e) => console.log(e))
    await ctx.editMessageText('Please send your wallet address:')
  } catch (e) {
    console.log(e)
    await lmt.removeTokens(1)
  }
})

bot.action('checkTwitter', async (ctx) => {
  try {
    const res = await axios({
      method: 'GET',
      timeout: 3000,
      url: `https://work.parasset.top/workbench-api/twitter/userInfo?cond=${ctx.update.callback_query.from.id}`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
      }
    })
    if (res.data?.data.length === 0) {
      ctx.editMessageText("You haven't authorized yet, please click the 'Authorize' button to authorize.", Markup.inlineKeyboard([
        [Markup.button.url('Authorize', `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=dU9nMk54dnQzc0UtNjNwbDRrWno6MTpjaQ&redirect_uri=https://nestdapp.io/twitter&scope=tweet.read%20users.read%20follows.read%20like.read%20offline.access&state=${hashCode(botName)}_${ctx.update.callback_query.from.id}&code_challenge=challenge&code_challenge_method=plain`)],
        [Markup.button.callback('I have Authorized', 'checkTwitter')],
      ]))
    } else {
      // const access_token = res.data.data[0].access_token
      const twitter_name = res.data.data[0].twitter_name.replace('@', '')
      const twitter_id = res.data.data[0].twitter_id
      await axios({
        method: 'POST',
        url: `https://cms.nestfi.net/bot-api/red-bot/user`,
        data: {
          chatId: ctx.update.callback_query.from.id,
          twitterName: twitter_name,
          twitterId: twitter_id,
        }
      })
      ctx.editMessageText("You have authorized successfully.", Markup.inlineKeyboard([
        [Markup.button.callback('« Back', 'menu')],
      ]))
    }
  } catch (e) {
    ctx.answerCbQuery("Some error occurred.")
  }
})

bot.action('admin', async (ctx) => {
  const chat_id = ctx.update.callback_query.from.id
  if (WHITELIST.findIndex((id) => id === chat_id) === -1) {
    await lmt.removeTokens(1)
    await ctx.answerCbQuery()
      .catch((e) => console.log(e))
    await ctx.reply(`Sorry, ${chat_id} are not allowed to use this command!`, Markup.inlineKeyboard([
      [Markup.button.url('New Issue', 'https://github.com/NEST-Protocol/NESTRedEnvelopesBot/issues')]
    ]))
    return
  }
  await lmt.removeTokens(1)
  await ctx.answerCbQuery()
    .catch((e) => console.log(e))
  await ctx.editMessageText('NEST Prize Admin Portal', Markup.inlineKeyboard([
    [Markup.button.callback('Send', 'setConfig')],
  ]))
})

bot.on('message', async (ctx) => {
  const input = ctx.message.text
  const chat_id = ctx.message.chat.id
  const isBot = ctx.message.from.is_bot
  if (chat_id < 0 || isBot) {
    return
  }
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
      await ctx.reply("Sorry, you are blocked.")
      return
    }

    if (intent === null) {

    }
    else if (intent === 'setUserWallet') {
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
            url: `https://work.parasset.top/workbench-api/activity/user/update`,
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
          ctx.reply(`Your wallet address has updated: ${input}`, Markup.inlineKeyboard([
            [Markup.button.callback('« Back', 'menu')],
          ]))
        } catch (e) {
          await lmt.removeTokens(1)
          ctx.reply('Some error occurred.', {
            reply_to_message_id: ctx.message.message_id,
            ...Markup.inlineKeyboard([
              [Markup.button.callback('« Back', 'menu')],
              [Markup.button.url('New Issue', 'https://github.com/NEST-Protocol/NESTRedEnvelopesBot/issues')]
            ])
          })
        }
      } else {
        await lmt.removeTokens(1)
        ctx.reply('Please input a valid wallet address.', {
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
          }).catch((e) => console.log(e))

          await lmt.removeTokens(1)
          ctx.reply(`Your twitter has updated: ${input.slice(1)}`, Markup.inlineKeyboard([
            [Markup.button.callback('« Back', 'menu')],
            [Markup.button.callback('🤩', 'forDeveloper')],
          ]))
        } catch (e) {
          await lmt.removeTokens(1)
          ctx.reply('Some error occurred.', {
            reply_to_message_id: ctx.message.message_id,
            ...Markup.inlineKeyboard([
              [Markup.button.callback('« Back', 'menu')],
              [Markup.button.url('New Issue', 'https://github.com/NEST-Protocol/NESTRedEnvelopesBot/issues')]
            ])
          })
        }
      } else {
        ctx.reply('Please input a valid twitter account start with @.')
      }
    }
  } catch (e) {
    await lmt.removeTokens(1)
    ctx.reply('Some error occurred.')
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