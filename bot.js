const fs = require('fs');
const dotenv = require('dotenv');
const config = require('./config.json');

dotenv.config();

const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');

// Define commands
const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
];

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error reloading application (/) commands:', error);
  }
})();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const { ActivityType } = require('discord.js');
  client.user.setActivity('you', { type: ActivityType.Watching });
  client.user.setStatus('dnd')
  const newNickname = `rain ${config.botVersion} (${config.prefix})`;
       try {
        const guild = client.guilds.cache.get("1268238059191795794");
    
        if (guild) {
          const botMember = guild.members.cache.get(client.user.id);
    
          if (botMember) {
            botMember.setNickname(newNickname);
            console.log(`Nickname changed to "${newNickname}" in guild "${guild.name}".`);
          } else {
            console.error('Bot is not a member of the guild or the member cache is not available.');
          }
        } else {
          console.error('Guild not found.');
        }
      } catch (error) {
        console.error('Error changing nickname:', error);
      }
  setTimeout(() => {
    const WelcomeChannel = client.channels.cache.get("1269249270100398091")
    WelcomeChannel.send(`-----------------\nLogged in as ${client.user.tag}`)
    setTimeout(() => {
      const currentDate = new Date().toLocaleString();
      const WelcomeChannel = client.channels.cache.get("1269249270100398091")
      WelcomeChannel.send(`PREFIX: ${config.prefix}\nDEFAULT PREFIX: ${config.defaultprefix}\nDATE: ${currentDate}`)
      setTimeout(() => {
        const currentDate = new Date().toLocaleString();
        const WelcomeChannel = client.channels.cache.get("1269249270100398091")
        WelcomeChannel.send(`<@` + config.OwnerIDs[0] + `>`)
      }, 1000)
    }, 1000)
  }, 1000)
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.channel.send('Pong.');
  } else if (command === 'embedTest') {
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('test')
      .setURL('https://discord.js.org/')
      .setAuthor('twoja stara', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
      .setDescription('nwm co tu napisac')
      .setThumbnail('https://i.imgur.com/wSTFkRM.png')
      .addFields(
        { name: '1', value: '1' },
        { name: '\u200B', value: '\u200B' },
        { name: '2', value: '2', inline: true },
        { name: '3', value: '3', inline: true },
      )
      .addField('4', '4', true)
      .setImage('https://i.imgur.com/wSTFkRM.png')
      .setTimestamp()
      .setFooter('xD', 'https://i.imgur.com/wSTFkRM.png');

    message.channel.send({ embeds: [exampleEmbed] });
  } else if (command === 'setprofile') {
    if (config.OwnerIDs.includes(message.author.id)) {
      if (args.length === 1 && (args[0].startsWith("http://") || args[0].startsWith("https://")) && args[0].includes("i.imgur.com/")) {
        try {
          client.user.setAvatar(args[0]);
          message.channel.send("Set avatar to image:" + args[0])
        } catch (error) {
          message.channel.send(error + "\n\nPlease DM _lostinthought_ (rain) with this error and a screenshot with AT LEAST 3 messages of context.")
        }
      } else {
        message.channel.send("Argument 1 not found or not a valid/supported URL.\nThe only supported URL is i.imgur.com/ as of bot version " + config.botVersion)
      }
    } else {
      message.channel.send("You are not permitted to perform this action.")
    }
  } else if (command === 'setprefix') {
    if (config.OwnerIDs.includes(message.author.id)) {
      if (args.length === 1 && args[0].length <= 5 && args[0].length >= 1) {
        try {
          config.prefix = args[0];

          // Write the updated config to config.json
          fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), 'utf8');

          // Set the bot's nickname in the server where the command was issued
          const newNickname = `rain ${config.botVersion} (${args[0]})`;
          
          if (message.guild) {
            await message.guild.members.me.setNickname(newNickname);
          }

          message.channel.send(`Set prefix to: ${args[0]} and updated nickname to: ${newNickname}`);
        } catch (error) {
          message.channel.send(error + "\n\nPlease inform _lostinthought_ (rain) of this error.")
        }
      } else {
        message.channel.send("Argument 1 not found or not a valid prefix.\nSupported prefix length is between 1 and 5 characters.")
      }
    } else {
      message.channel.send("You are not permitted to perform this action.")
    }
  } else if (command === 'bot/addemoji') {
    if (config.OwnerIDs.includes(message.author.id)) {
      if (args.length < 2) {
        return message.channel.send("Please provide the emoji URL and name.");
      }

      const [emojiUrl, emojiName] = args;

      try {
        const guild = client.guilds.cache.get('1269247041192853504');
        if (!guild) {
          return message.channel.send("Could not find the specified guild.");
        }

        // Create the emoji
        await guild.emojis.create({ attachment: emojiUrl, name: emojiName });
        message.channel.send(`Emoji ${emojiName} added successfully.`);
      } catch (error) {
        message.channel.send(`Failed to add emoji: ${error.message}`);
      }
    } else {
      message.channel.send("You are not permitted to perform this action.");
    }
  } else if (command === 'eval') {
    if (config.OwnerIDs.includes(message.author.id)) {
      try {
        const code = args.join(' ');
        let result = eval(code);
        if (typeof result !== 'string') result = require('util').inspect(result);
        message.channel.send(`\`\`\`js\n${result}\n\`\`\``);
      } catch (error) {
        message.channel.send(`Error: \`${error.message}\``);
      }
    } else {
      message.channel.send("You are not permitted to perform this action.");
    }
  } else if (command === 'avatar' || command === 'profile' || command === 'pfp') {
    // Get the user mentioned or default to the message author
    const user = message.mentions.users.first() || message.author;

    // Fetch the user's avatar URL
    const avatarUrl = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

    // Send the avatar URL in an embed
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s pfp`)
      .setImage(avatarUrl)
      .setColor('#0099ff')
      .setFooter({ text: `requested by ${message.author.tag}`});

    message.channel.send({ embeds: [embed] });
  }
});

client.login(config.DISCORD_TOKEN);
