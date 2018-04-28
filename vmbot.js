'use strict'

/**
 * Discord
 */
const Discord = require('discord.js')
const client = new Discord.Client()

/**
 * Other
 */
const storage = require('node-persist')
require('dotenv').config()
const util = require('util')
const discordLoginToken = { token: process.env.LOGIN_TOKEN }

/**
 * VirtualMachine import and create
 */
const VirtualMachine = require('./VirtualMachine.js').VirtualMachine
const virtualMachine = new VirtualMachine(client)

/**
 * Settings
 */
const settings = {
  MESSAGE_LIMIT: 196,
  admin: process.env.ADMIN_ID
}
Object.freeze(settings)
console.log(`Admin ID ${settings.admin}`)

const onReady = async () => {
  await storage.init()
  virtualMachine.initialize()
  console.log(`Storage initiated`)
  console.log(`Logged in as ${client.user.tag}`)
}

const parseIncomingMessage = async msg => {
  const args = msg.content.match(/\S+/g) || []
  if (!args.length) {
    return false
  }
  switch (args[0]) {
    case '`new':
    case '`reset':
      virtualMachine.reset()
      msg.channel.send(
        `\`New sandbox created. NodeJS ${process.version} / ${process.arch} / ${
          process.platform
        }\``
      )
      return
    case '`auth':
      if (settings.admin !== msg.author.id) {
        msg.channel.send('Only bot amin can authorize users.')
        return
      }
      virtualMachine.authorize(args[1])
      return
  }

  const sendMessage = message => {
    console.log(message)
    if (!message || message === '') {
      msg.channel.send('Error: sendMessage(): message falsy or empty')
      return
    }
    let parsed = message
    if (parsed.length > settings.MESSAGE_LIMIT) {
      parsed =
        parsed.slice(0, settings.MESSAGE_LIMIT) +
        `... [${parsed.length - settings.MESSAGE_LIMIT} more characters]`
    }
    msg.channel.send(parsed)
  }

  const sendResult = message => {
    console.log(message)

    let parsed = util.inspect(message)
    if (parsed.length > settings.MESSAGE_LIMIT) {
      parsed =
        parsed.slice(0, settings.MESSAGE_LIMIT) +
        `... [${parsed.length - settings.MESSAGE_LIMIT} more characters]`
    }
    msg.channel.send(`\`${parsed}\``)
  }

  if (msg.content[0] === '`') {
    const args = msg.content.slice(1).trim()

    if (args[args.length - 1] === '`') {
      return
    }
    try {
      const result = await virtualMachine.runScript(args, msg.author.id)
      sendResult(result)
    } catch (err) {
      sendMessage('Error: ' + err.message)
    }
  }
}

client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('disconnect', () => {
    console.warn('Disconnected!')
  })
  .on('reconnecting', () => {
    console.warn('Reconnecting...')
  })
  .on('ready', onReady)
  .on('message', parseIncomingMessage)

client.login(discordLoginToken.token)

/**
 * Exports
 */

module.exports.client = client
module.exports.parseIncomingMessage = parseIncomingMessage
module.exports.settings = settings
module.exports.storage = storage
module.exports.onReady = onReady
