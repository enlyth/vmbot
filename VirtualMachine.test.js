const VirtualMachine = require('./VirtualMachine.js').VirtualMachine
const client = require('./vmbot.js').client
const parseIncomingMessage = require('./vmbot.js').parseIncomingMessage
require('dotenv').config()
const admin = { id: process.env.ADMIN_ID }
const storage = require('./VirtualMachine.js').storage


test('simple arithmetic in VM', async () => {
    const vm = new VirtualMachine(null)
    expect(await vm.runScript('3 + 4')).toBe(7)
    expect(await vm.runScript('12341233451 - 1231556622')).toBe(
      12341233451 - 1231556622
    )
  
    expect(await vm.runScript('-2 * 7 + 8 * 11 - 3 / 12')).toBe(
      -2 * 7 + 8 * 11 - 3 / 12
    )
  })
  
  test('variables let, const, var', async () => {
    const vm = new VirtualMachine(null)  
    expect(await vm.runScript('let a = 3; a += 343; a')).toBe(343 + 3)
    expect(await vm.runScript('const b = { y : -3, z : 6 }; b')).toEqual({
      y: -3,
      z: 6
    })
    expect(await vm.runScript('var c = "abc"; c + "de"')).toBe('abcde')
  })
  
  test('errors thrown on syntax errors', async () => {
    const vm = new VirtualMachine(null) 
    await expect(vm.runScript('(() => ())()')).rejects.toEqual(new SyntaxError('Unexpected token )'))
  })
  
  
  test('can create and use new virtualMachine', async () => {
    let vm
    expect(vm = await new VirtualMachine()).toBeInstanceOf(VirtualMachine)
    expect(vm.reset()).toBeTruthy()
    expect(vm.getAuthorizedUsers()).toBeInstanceOf(Set)
    expect(await vm.authorize('1234')).toBe(false)
    expect(await vm.authorize('123456789012345678')).toBe(false)
  })