const VirtualMachine = require('./VirtualMachine.js').VirtualMachine
const client = require('./vmbot.js').client
const parseIncomingMessage = require('./vmbot.js').parseIncomingMessage
require('dotenv').config()
const adminId = process.env.ADMIN_ID
const storage = require('./VirtualMachine.js').storage


test('simple arithmetic in VM', async () => {
    const vm = new VirtualMachine(null)
    expect(await vm.runScript('3 + 4', adminId)).toBe(7)
    expect(await vm.runScript('12341233451 - 1231556622', adminId)).toBe(
      12341233451 - 1231556622
    )
  
    expect(await vm.runScript('-2 * 7 + 8 * 11 - 3 / 12', adminId)).toBe(
      -2 * 7 + 8 * 11 - 3 / 12
    )
  })
  
  test('variables let, const, var', async () => {
    const vm = new VirtualMachine(null)  
    expect(await vm.runScript('let a = 3; a += 343; a', adminId)).toBe(343 + 3)
    expect(await vm.runScript('const b = { y : -3, z : 6 }; b', adminId)).toEqual({
      y: -3,
      z: 6
    })
    expect(await vm.runScript('var c = "abc"; c + "de"', adminId)).toBe('abcde')
  })
  
  test('errors thrown on syntax errors', async () => {
    const vm = new VirtualMachine(null) 
    await expect(vm.runScript('(() => ())()', adminId)).rejects.toEqual(new SyntaxError('Unexpected token )'))
  })

  test('errors thrown on wrong admin', async () => {
    const vm = new VirtualMachine(null) 
    await expect(vm.runScript('true', '123')).rejects.toEqual(new Error('Unauthorized user'))
  })
  
  
  test('can create and use new virtualMachine', async () => {
    let vm
    expect(vm = await new VirtualMachine(null)).toBeInstanceOf(VirtualMachine)
    expect(vm.reset()).toBeTruthy()
    expect(vm.getAuthorizedUsers()).toBeInstanceOf(Set)
    expect(await vm.authorize('1234')).toBe(false)
    expect(await vm.authorize('123456789012345678')).toBe(false)
  })