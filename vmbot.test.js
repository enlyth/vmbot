const VirtualMachine = require('./vmbot.js').VirtualMachine
const runScript = require('./vmbot.js').runScript
const client = require('./vmbot.js').client
const onReady = require('./vmbot.js').onReady
const parseIncomingMessage = require('./vmbot.js').parseIncomingMessage
require('dotenv').config()
const admin = { id: process.env.ADMIN_ID }
const storage = require('./vmbot.js').storage



test('client exists and can access properties', async () => {
  expect(client).toBeTruthy()
  expect(client.on('message', () => {true})).toBeTruthy()
})

test('can init ready', async () => {
  // client.login = () => true
  // expect(await onReady()).toBeTruthy()
})

test('can parse messages', async () => {
  expect(await parseIncomingMessage({content: '', channel: {send: x => x}})).toBe(false)
  expect(await parseIncomingMessage({content: '`new', channel: {send: x => x}})).toBe(undefined)
  expect(await parseIncomingMessage({content: '`auth', channel: {send: x => x}, author: {id: settings.admin}})).toBe(undefined)
  expect(await parseIncomingMessage({content: '` 123', channel: {send: x => x}, author: {id: settings.admin}})).toBe(undefined)
  expect(await parseIncomingMessage({content: '` )', channel: {send: x => x}, author: {id: settings.admin}})).toBe(undefined)
})

