# vmbot
Website: www.vmbot.io

## What is this?
It's a self-hosted bot made mostly for fun, allowing you to run arbitrary JavaScript in your Discord channel.

## Using vmbot
You need to create a Discord bot and get a token. Guides for this can be found on the internet, e.g. here: https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

Clone the project and create a `.env` file in your project directory, with the following settings:

    LOGIN_TOKEN="your-discord-bot-login-token"
    ADMIN_ID="your-discord-user-id"

After you do that, start the bot by running `npm start`, or using a process manager like pm2. You can also use the included Dockerfile to make a Docker image. Then run code in any channel by using the backtick (`) prefix, as such:

    `const a = 3; a + 7

The bot should reply `10`
The context is retained until you run the `` `new `` command.
You can also access the vmbot Discord.js object itself, it is passed into the VM as the global `client` object, and you can use it as such:

    `[...client.guilds.keys()]
The bot will reply an array of the channels it is currently connected to, and so on. Refer to the official Discord.js documentation for further help.

To autenticate other users to use the bot, use the `` `auth <USER_ID>`` command.

This readme is quite concise at the moment but if anything is confusing, just view the source. It is very light, and this is more of a proof of concept than anything at the moment.