'use strict'

const util = require('util')
const EXECUTION_TIMEOUT = 2500
const { VM, /* NodeVM, */ VMScript } = require('vm2')
const storage = require('node-persist')
require('dotenv').config()

/**
 * The VirtualMachine class is linked to the Discord client,
 * as it provides an interface to it
 * It also takes care of admin/user authorization when
 * running scripts
 */

class VirtualMachine {
  constructor (client, logger = console.log) {
    const defaultSandboxConfig = {
      wrapper: 'none',
      timeout: EXECUTION_TIMEOUT,
      sandbox: {
        console: console,
        require: require,
        util: util,
        client: client /* Discord client */
      }
    }
    this.defaultConfig = defaultSandboxConfig
    this.vm = new VM(defaultSandboxConfig)
    this.authorizedUsers = new Set()
    this.inside = new Set()
    this.logger = logger
  }

  async run (script) {
    return this.vm.run(script)
  }

  async reset () {
    const newVM = new VM(this.defaultConfig)
    this.vm = newVM
    return newVM
  }

  async authorize (userId) {
    const validateUserId = id => {
      return (
        typeof id === 'string' &&
        id.length === 18 &&
        !isNaN(new Number(id))
      )
    }
    if (!validateUserId(userId)) {
      this.logger(`Error: Cannot add invalid user ID.`)
      return false
    }
    try {
      this.logger(process.env.ADMIN_ID)
      if (this.authorizedUsers.has(userId)) {
        this.logger(`Cannot authorize ${userId}, already authorized.`)
        return false
      }

      this.authorizedUsers.add(userId)
      await storage.setItem('authorizedUsers', Array.from(this.authorizedUsers))
      this.logger(`Authorized ${userId}.`)
      return true
    } catch (error) {
      this.logger(error)
      this.logger(`Error: Cannot add user ${userId}. Defaulting to none.`)
      return false
    }
  }

  async initialize () {
    /**
     * Persist IDs as array, store in memory as Set
     */
    this.authorizedUsers = await storage.getItem('authorizedUsers')

    try {
      this.authorizedUsers = new Set(this.authorizedUsers)
    } catch (error) {
      this.authorizedUsers = new Set()
    }

    const isEmptyObj = obj =>
      Object.keys(obj).length === 0 && obj.constructor === Object
    if (
      this.authorizedUsers === undefined ||
      isEmptyObj(this.authorizedUsers)
    ) {
      this.logger('Cannot fetch authorizedUsers. Defaulting to none.')
      await storage.setItem('authorizedUsers', [])
      this.authorizedUsers = new Set()
    }

    console.log('VirtualMachine initialized')
    return this
  }

  getAuthorizedUsers () {
    return this.authorizedUsers
  }

  async runScript (args, userId) {
    return new Promise((resolve, reject) => {
      console.log(this.authorizedUsers)
      if (!this.authorizedUsers.has(userId) && userId !== process.env.ADMIN_ID) {
        reject(new Error('Unauthorized user'))
      }

      const precompileScript = script => {
        /**
         * First we try to compile it as `( ${code} )`,
         * so when we send e.g. an object {a : 1},
         * V8 doesn't interpret it as function scope
         *
         * If the parse/compilation fails, it means
         * there is statement rather than an object
         * and we execute the script as such in its pure
         * form, e.g. just `${code}`
         *
         * Desired results:
         * {a: 1}
         * > { a: 1 }
         * { true }
         * > true
         * let message = ''; for (let i = 0; i != 3; ++i) message += 'a'; message;
         * > 'aaa'
         *
         * And so on.
         */
        let precompiled
        try {
          precompiled = new VMScript(`( ${script} )`)
          precompiled.compile()
        } catch (preError) {
          try {
            precompiled = new VMScript(`${script}`)
            precompiled.compile()
          } catch (error) {
            throw error
          }
        }
        return precompiled
      }

      try {
        this.logger('args: ' + args)
        const precompiledScript = precompileScript(args)
        const result = this.vm.run(precompiledScript)
        this.logger('result: ' + util.inspect(result))
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports.VirtualMachine = VirtualMachine
