const fs = require('fs');
const io = require("@pm2/io")
const dotenv = require('dotenv');
const config = require('./config.json');
dotenv.config();
const { REST, Routes, Client, GatewayIntentBits, EmbedBuilder, MessageActivityType } = require('discord.js');
const { stringify } = require('querystring');
let time = 0
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

const Shwdowtime = io.metric({
  name: 'Shwdow',
  id: 'bot/time/1'
})

const commandUses = io.meter({
  name: 'commands',
  id: 'command/usage/count'
})

async function processCooldowns() {
  let data = require("./data.json")
  while (true) {
    for (let userId in data.Data) {
      if (data.Data[userId]["CooldownRate"] !== undefined) {
        data.Data[userId]["CooldownRate"] -= 1;
      }
    }
    time += 1
    Shwdowtime.set(time)

    // Optionally save the updated data back to the file
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2), 'utf8');

    // Wait for 1 second before continuing the loop
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}


client.on('ready', () => {
  processCooldowns()
  console.log(`Logged in as ${client.user.tag}!`);
  const { ActivityType } = require('discord.js');
  client.user.setActivity('you', { type: ActivityType.Watching });
  client.user.setStatus('dnd');
  const newNickname = `${config.botName} ${config.botVersion} (${config.prefix})`;
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
    const WelcomeChannel = client.channels.cache.get("1269249270100398091");
    WelcomeChannel.send(`-----------------\nLogged in as ${client.user.tag}`);
    setTimeout(() => {
      const currentDate = new Date().toLocaleString();
      const WelcomeChannel = client.channels.cache.get("1269249270100398091");
      WelcomeChannel.send(`PREFIX: ${config.prefix}\nDEFAULT PREFIX: ${config.defaultprefix}\nDATE: ${currentDate}`);
      setTimeout(() => {
        const currentDate = new Date().toLocaleString();
        const WelcomeChannel = client.channels.cache.get("1269249270100398091");
        WelcomeChannel.send(`<@${config.OwnerIDs[0]}>`);
      }, 1000);
    }, 1000);
  }, 1000);
});



client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.on('messageCreate', async message => {
  try {
    commandUses.mark()
  if (message.author.bot) {return;}
  if (message.content.includes("Shwdow do nogi")) {
    if (config.ban.includes(message.author.id)) {
      const member = message.guild.members.cache.get(message.author.id);
    const hasSheHerRole = member.roles.cache.some(role => role.name === 'she/her');
    const hasHeHimRole = member.roles.cache.some(role => role.name === 'he/him');
    if (hasHeHimRole) {
      message.channel.send("Nie jesteś tego warty.")
    } else if (hasSheHerRole) {
      message.channel.send("Nie jesteś tego warta.")
    } else {
      message.channel.send("Nie jesteś tego warty.")
    }
    } else {
    message.channel.send("Nazywam się Shwdow: ten, który czai się w cieniu, aby polować na cienie.")
    }
  }
  if (config.ban.includes(message.author.id)) {
    if (message.content.startsWith(config.prefix)) {
        message.channel.send("co za debil! <:haha:1269312976595320905> wypierdalaj kurwa.");
        message.member.timeout(60 * 1000)
            .catch(console.error);
    }
    return;
}

  const args = message.content.slice(config.prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.channel.send('Pong.');
  } else if (command === 'embedTest') {
    const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Some title')
    .setURL('https://discord.js.org/')
    .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    .addFields(
      { name: 'Regular field title', value: 'Some value here' },
      { name: '\u200B', value: '\u200B' },
      { name: 'Inline field title', value: 'Some value here', inline: true },
      { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
    .setImage('https://i.imgur.com/AfFp7pu.png')
    .setTimestamp()
    .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
  
    message.channel.send({ embeds: [exampleEmbed] });
  } else if (command === 'setprofile') {
    if (config.OwnerIDs.includes(message.author.id)) {
      if (args.length === 1 && (args[0].startsWith("http://") || args[0].startsWith("https://")) && args[0].includes("i.imgur.com/")) {
        try {
          client.user.setAvatar(args[0]);
          message.channel.send("Set avatar to image:" + args[0]);
        } catch (error) {
          message.channel.send(error + "\n\nPlease DM _lostinthought_ (rain) with this error and a screenshot with AT LEAST 3 messages of context.");
        }
      } else {
        message.channel.send("Argument 1 not found or not a valid/supported URL.\nThe only supported URL is i.imgur.com/ as of bot version " + config.botVersion);
      }
    } else {
      message.channel.send("You are not permitted to perform this action.");
    }
  } else if (command === 'setprefix') {
    if (config.OwnerIDs.includes(message.author.id)) {
      if (args.length === 1 && args[0].length <= 5 && args[0].length >= 1) {
        try {
          config.prefix = args[0];

          // Write the updated config to config.json
          fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), 'utf8');

          // Set the bot's nickname in the server where the command was issued
          const newNickname = `${config.botName} ${config.botVersion} (${config.prefix})`;
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

          message.channel.send(`Set prefix to: ${args[0]} and updated nickname to: ${newNickname}`);
        } catch (error) {
          message.channel.send(error + "\n\nPlease inform _lostinthought_ (rain) of this error.");
        }
      } else {
        message.channel.send("Argument 1 not found or not a valid prefix.\nSupported prefix length is between 1 and 5 characters.");
      }
    } else {
      message.channel.send("You are not permitted to perform this action.");
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
        message.channel.send(`Emoji ${emojiName} added successfully. \nGuildInfo: name="rainEmojis", private`);
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
    .setFooter({ text: `requested by ${message.author.tag}` });
  
  message.channel.send({ embeds: [embed] });
  } else if (command === 'rollbattle') {
    if (args.length < 1) {
      return message.channel.send("Argument [1] nie znaleziony.");
    }

    const user = message.mentions.users.first();

    if (!user) {
      return message.channel.send("pinguj kogos.");
    }

    const challengerRoll = Math.floor(Math.random() * 100) + 1;
    await message.author.send(`You rolled: ${challengerRoll}`);

    message.channel.send(`<@${user.id}>, debil(ka) chce z toba walczyc, napisz ${config.prefix}rollreply i rozjeb`);

    const filter = response => response.content === config.prefix + 'rollreply' && response.author.id === user.id;
    const collector = message.channel.createMessageCollector({ filter, time: 300000 });

    collector.on('collect', async () => {
      collector.stop();
      const opponentRoll = Math.floor(Math.random() * 100) + 1;
      await user.send(`You rolled: ${opponentRoll}`);

      if (challengerRoll > opponentRoll) {
        message.channel.send(`${message.author.username} wygrywa z ${challengerRoll} przeciwko ${user.username}, co ma ${opponentRoll}! EZ`);
      } else if (challengerRoll < opponentRoll) {
        message.channel.send(`${user.username} wygrywa z ${opponentRoll} przeciwko ${message.author.username}, co ma ${challengerRoll}! EZ`);
      } else {
        message.channel.send(`tyle samo korwa ${challengerRoll}!`);
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send(`<@${user.username}> za wolno! ha! debil(ka) wygrywa!`);
      }
    });
  } else if (command === "code") {
    message.channel.send(`https://github.com/Zakkina-AmongUs/rainbot/blob/stable/bot.js`)
  } else if (command == "emoteid") {
    const emoji = message.content.match(/<a?:\w+:(\d+)>/);
    if (emoji) {
      try {
      message.channel.send(`Emoji ID: ${emoji[1]} \n For botscript: \`\`\`${args[0]}\`\`\``);
      } catch (error) {
        message.channel.send(`${error} -- Could not get emoji name.`)
      }
    } else {
      message.channel.send('No valid emoji found in the message.');
    }
  } else if (command === "cmds" || command === "help") {
    const helpEmbed = new EmbedBuilder()
    .setColor(0x009900)
    .setTitle(`${config.prefix}cmds`)
    .setAuthor({ name: 'rain', iconURL: 'https://cdn.discordapp.com/avatars/1260916274804953171/10b924a18043f108a7799584be05d93e.webp?size=1024' })
    .setDescription('All commands <3')
    .setFooter({text: "More can and will be added, so check every update!"})
    .setThumbnail('https://cdn.discordapp.com/avatars/1260916274804953171/10b924a18043f108a7799584be05d93e.webp?size=1024')
    .addFields(
      { name: 'Moderation', value: `botban <userID> - Ban someone from the bot. \n botunban - Obvious. \n more when i feel like it` },
      { name: '\u200B', value: '\u200B' },
      { name: 'Games', value: 'rollbattle <user> - test your luck against someone \n guess <number> -- Guessing game. Type for more information! \n guessreset -- Reset ur data in guess. \n guessleaderboard -- Pretty obvious. \n\n\n more when i feel like it'},
      { name: '\u200B', value: '\u200B' },
      { name: 'Other', value: 'emoteid <emotji> - get emote ID of any non-FakeNitro emoji \n \"pfp\" | \"profile\" | \"avatar\" <user> - get someone\'s profile picture'},
      { name: '\u200B', value: '\u200B' },
      { name: 'Danger', value: `NORMAL USERS CAN NOT USE THIS!\n\n eval <JavaScript> - run ANY code\n\n \"bot/emojiadd\" <image URL> - add any image as an emoji to the bot's emoji server`},
      { name: '\u200B', value: '\u200B' },
      { name: 'Legacy', value: `Legacy commands (from Shwdow v2)\nThese commands will not be described.\n\n sex <user> \n publicsex <user> \n debil <user> \n ranking \n ocena <user>`}
      
    )
    
    
    message.channel.send({ embeds: [helpEmbed] });
    message.channel.send(`This could be inaccurate -- it is a very early version that i may forget to update! \n Use \"${config.prefix}code\" for the source code (always has the latest commands)`)
  } else if (command === "guess") {
      const path = "./data.json";
      let data;
    
      // Check if the file exists
      if (fs.existsSync(path)) {
          // If it exists, read and parse the file
          data = JSON.parse(fs.readFileSync(path, 'utf8'));
      } else {
          // If it doesn't exist, initialize with an empty structure
          data = { Data: {} };
      }
  
      // Ensure the necessary structure exists
      if (typeof data.Data[message.author.id] === 'undefined') {
          data.Data[message.author.id] = {};
      }
      if (typeof data.Data[message.author.id]["RandomNumber"] === 'undefined') {
          data.Data[message.author.id]["RandomNumber"] = -1;
      }
      if (typeof data.Data[message.author.id]["MaxNumber"] === 'undefined') {
          data.Data[message.author.id]["MaxNumber"] = 99;
      }
      if (typeof data.Data[message.author.id]["Guesses"] === 'undefined') {
          data.Data[message.author.id]["Guesses"] = 7;
      }
      if (typeof data.Data[message.author.id]["LastWasRight"] === 'undefined') {
          data.Data[message.author.id]["LastWasRight"] = false;
      }
      if (typeof data.Data[message.author.id]["streak"] === 'undefined') {
          data.Data[message.author.id]["streak"] = 0;
      }
      if (typeof data.Data[message.author.id]["Wins"] === 'undefined') {
        data.Data[message.author.id]["Wins"] = 0;
    }
    if (typeof data.Data[message.author.id]["Lose"] === 'undefined') {
        data.Data[message.author.id]["Lose"] = 0;
    }
  
      fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  
      let maxNumber;
      let lastWasRight;
  
      data.Data[message.author.id]["MaxNumber"] = 99 * (data.Data[message.author.id]["streak"] + 1);
      lastWasRight = data.Data[message.author.id]["LastWasRight"];
      maxNumber = data.Data[message.author.id]["MaxNumber"];
  
      // Assign a random number
      if (data.Data[message.author.id]["RandomNumber"] <= 0) {
          console.log(`${message.author.tag} ${JSON.stringify(data.Data[message.author.id])}`);
          data.Data[message.author.id]["RandomNumber"] = Math.round(Math.random() * maxNumber);
          data.Data[message.author.id]["Guesses"] = 7;
          data.Data[message.author.id]["Wins"] = 0;
          data.Data[message.author.id]["Lose"] = 0;
          fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
          message.channel.send(`Welcome! Type ${config.prefix}guess <number> to, well, try to guess a number! The first number is between 0 and 99, and the higher your streak the higher the number will be!`);
          return;
      }
      const FailChannel = client.channels.cache.get("1269389282104184844")
      const guessedNumber = parseInt(args[0], 10);
      if (isNaN(guessedNumber)) {
        if (args[0] == "giveup") {
          try {
          message.channel.send("Very well. The number was " + data.Data[message.author.id]["RandomNumber"])
          } catch (error) {
            message.channel.send("Make sure your DMs are open!")
            return;
          }
          FailChannel.send(`<@${message.author.id}> gave up. Their number was ${data.Data[message.author.id]["RandomNumber"]}.`)
          data.Data[message.author.id]["MaxNumber"] = 99;

              data.Data[message.author.id]["LastWasRight"] = false;
              data.Data[message.author.id]["streak"] = 0;
              let streak = 0;
              data.Data[message.author.id]["Lose"] += 1
              difficulty = Math.max(1, Math.pow(streak / 2, 1.15) * 6);
              data.Data[message.author.id]["Guesses"] = Math.round(Math.min(Math.max(7, ((difficulty ^ 0.68) / 4) * 2), 30))
              data.Data[message.author.id]["RandomNumber"] = Math.round(Math.random() * 99);
              return;
        } else {
          message.channel.send("Please provide a valid number.");
          return;
      }
    }
  
      if (guessedNumber === data.Data[message.author.id]["RandomNumber"]) {
          let difficulty;
          let streak;
          streak = data.Data[message.author.id]["streak"];
          FailChannel.send(`<@${message.author.id}> won!. New streak: ${data.Data[message.author.id]["streak"] + 1}, the number was ${data.Data[message.author.id]["RandomNumber"]}!`)
          try {
          message.channel.send(`You got it right! The next number is between 0 and ${maxNumber + maxNumber}, Guesses: ${Math.round(Math.min(Math.max(6, ((difficulty ^ 0.68) / 4) * 2), 30))}`);
        } catch (error) {
          message.channel.send("Make sure your DMs are open! you got the number right btw but it didnt count cuz error")
          return;
        }
          data.Data[message.author.id]["MaxNumber"] = maxNumber + maxNumber;
          data.Data[message.author.id]["LastWasRight"] = true;
          data.Data[message.author.id]["streak"] += 1;
          difficulty = Math.max(1, Math.pow(streak / 2, 1.15) * 6);
          data.Data[message.author.id]["Guesses"] = Math.round(Math.min(Math.max(7, ((difficulty ^ 0.58) / 5) * 2), 30))
          data.Data[message.author.id]["RandomNumber"] = Math.round(Math.random() * data.Data[message.author.id]["MaxNumber"]);
          data.Data[message.author.id]["Wins"] += 1
      } else {
          data.Data[message.author.id]["Guesses"] -= 1;
          if (data.Data[message.author.id]["Guesses"] <= 0) {
              let difficulty;
              let streak;
              streak = data.Data[message.author.id]["streak"];
              try {
              message.channel.send("You ran out of guesses. Number:" + data.Data[message.author.id]["RandomNumber"] + "Restarting... The new number is between 0 and 99." + ` Guesses: ${data.Data[message.author.id]["Guesses"]}`);
              FailChannel.send(`<@${message.author.id}> failed. Streak lost: ${data.Data[message.author.id]["streak"]}, their last guess was ${guessedNumber}, while the number was ${data.Data[message.author.id]["RandomNumber"]}!`)
            } catch (error) {
              message.channel.send("Make sure your DMs are open!")
              return;
            }
              data.Data[message.author.id]["MaxNumber"] = 99;
              data.Data[message.author.id]["LastWasRight"] = false;
              data.Data[message.author.id]["streak"] = 0;
              data.Data[message.author.id]["Lose"] += 1
              difficulty = Math.max(1, Math.pow(streak / 2, 1.15) * 6);
              data.Data[message.author.id]["Guesses"] = Math.round(Math.min(Math.max(7, ((difficulty ^ 0.68) / 4) * 2), 30))
              data.Data[message.author.id]["RandomNumber"] = Math.round(Math.random() * 99);
          } else {
              if (guessedNumber > data.Data[message.author.id]["RandomNumber"]) {
                try {
                  message.channel.send("A little too high. Try again." + ` Guesses: ${data.Data[message.author.id]["Guesses"]}`);
                } catch (error) {
                  message.channel.send("Make sure your DMs are open!")
                  return;
                }
              } else {
                try {
                  message.channel.send("Too low. Go higher." + ` Guesses: ${data.Data[message.author.id]["Guesses"]}`);
                } catch (error) {
                  message.channel.send("Make sure your DMs are open!")
                  return;
                }
              }
          }
      }
      console.log(message.author.user + " " + JSON.stringify(data, null, 2))
      fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  } else if (command === "guessreset") {
    const path = "./data.json";
      let data;
  
      // Check if the file exists
      if (fs.existsSync(path)) {
          // If it exists, read and parse the file
          data = JSON.parse(fs.readFileSync(path, 'utf8'));
      } else {
          // If it doesn't exist, initialize with an empty structure
          data = { Data: {} };
      }
      data.Data[message.author.id] = {}
      try {
      message.channel.send("Deleted data for ID " + message.author.id)
      } catch (error) {
        message.channel.send("Make sure your DMs are open!")
        return;
      }
      fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  } else if (command === "guessleaderboard") {
    console.log("guessleaderboard command received");

    let data;
    let path = "./data.json";

    // Check if the file exists and parse the file
    if (fs.existsSync(path)) {
        data = JSON.parse(fs.readFileSync(path, 'utf8'));
        console.log("Data file read successfully");
    } else {
        console.log("Data file does not exist");
        return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
    }

    // Check if the user has data
    if (!data.Data[message.author.id]) {
        console.log("User does not have data");
        return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
    }
    if (!data.Data[message.author.id]["Wins"]) {
      console.log("User does not have data");
      return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
  }

    // Create an array of { userId, wins } objects
    let lbArray = [];
    for (let userId in data.Data) {
        if (data.Data[userId].Wins !== undefined) {
            lbArray.push({ userId: userId, wins: data.Data[userId]["Wins"] });
        }
    }

    console.log("Leaderboard array created", lbArray);

    // Sort the array in descending order based on wins
    lbArray.sort((a, b) => b.wins - a.wins);

    // Create an array of the top users
    let topArray = [];
    for (let i = 0; i < lbArray.length && i < 10; i++) { // Limiting to top 10 users
        topArray.push(`${i + 1} - <@${lbArray[i].userId}> - Wins: ${lbArray[i].wins}`);
    }

    console.log("Top array created", topArray);

    // Convert the array to a string and send it as a message
    let stringArray = topArray.join('\n');
    message.channel.send(stringArray);
    console.log("Leaderboard sent to channel");
} else if (command === "debil") {
  let path = "./data.json"
  let data = require("./data.json")
  if (typeof data.Data[message.author.id] === 'undefined') {
    data.Data[message.author.id] = {};
  }
  if (typeof data.Data[message.author.id]["Debilizm"] === 'undefined') {
    data.Data[message.author.id]["Debilizm"] = 0;
  }
  if (typeof data.Data[message.author.id]["CooldownRate"] === 'undefined') {
    data.Data[message.author.id]["CooldownRate"] = 0;
  }
  if (typeof data.Data[message.author.id]["Oceny"] === 'undefined') {
    data.Data[message.author.id]["Oceny"] = 0;
  }
  let mentionedUserId = message.mentions.users.first()?.id;
  if (mentionedUserId) {
    if (typeof data.Data[mentionedUserId] === 'undefined') {
      data.Data[mentionedUserId] = {};
    }
    if (typeof data.Data[mentionedUserId]["Debilizm"] === 'undefined') {
      data.Data[mentionedUserId]["Debilizm"] = 0;
    }
    if (typeof data.Data[mentionedUserId]["Oceny"] === 'undefined') {
      data.Data[mentionedUserId]["Oceny"] = 0;
    }
  } else {
    mentionedUserId = message.author.id
  }
  let CooldownRate = data.Data[message.author.id]["CooldownRate"]
  const member = message.guild.members.cache.get(mentionedUserId);
    const hasSheHerRole = member.roles.cache.some(role => role.name === 'she/her');
    const hasHeHimRole = member.roles.cache.some(role => role.name === 'he/him');
  if (CooldownRate <= 0) {
    data.Data[message.author.id]["CooldownRate"] = 30
    data.Data[message.author.id]["Oceny"] += 1
    data.Data[mentionedUserId]["Debilizm"] += 1
      if (hasHeHimRole) {
        // User has 'he/him' role
        message.channel.send(`Oceniono <@${mentionedUserId}>: debil`)
      } else if (hasSheHerRole) {
        // User has 'she/her' role
        message.channel.send(`Oceniono <@${mentionedUserId}>: debilka`)
      } else {
        // User has neither role
        message.channel.send(`Oceniono <@${mentionedUserId}>: debil`)
      }
  } else {
    message.channel.send("zamknij pizde Karen, nie tak szybko")
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
} else if (command === "ranking") {
  console.log("guessleaderboard command received");

    let data;
    let path = "./data.json";
    

    // Check if the file exists and parse the file
    if (fs.existsSync(path)) {
        data = JSON.parse(fs.readFileSync(path, 'utf8'));
        console.log("Data file read successfully");
    } else {
        console.log("Data file does not exist");
        return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
    }
    if (typeof data.Data[message.author.id] === 'undefined') {
      data.Data[message.author.id] = {};
    }
    if (typeof data.Data[message.author.id]["Debilizm"] === 'undefined') {
      data.Data[message.author.id]["Debilizm"] = 0;
    }
    if (typeof data.Data[message.author.id]["CooldownRate"] === 'undefined') {
      data.Data[message.author.id]["CooldownRate"] = 10;
    }
    if (typeof data.Data[message.author.id]["Oceny"] === 'undefined') {
      data.Data[message.author.id]["Oceny"] = 0;
    }
    const mentionedUserId = message.mentions.users.first()?.id;
    if (mentionedUserId) {
      if (typeof data.Data[mentionedUserId] === 'undefined') {
        data.Data[mentionedUserId] = {};
      }
      if (typeof data.Data[mentionedUserId]["Debilizm"] === 'undefined') {
        data.Data[mentionedUserId]["Debilizm"] = 0;
      }
      if (typeof data.Data[mentionedUserId]["Oceny"] === 'undefined') {
        data.Data[mentionedUserId]["Oceny"] = 0;
      }
    } else {
      mentionedUserId = message.author.id
    }

    // Check if the user has data
    if (!data.Data[message.author.id]) {
        console.log("User does not have data");
        return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
    }
    if (!data.Data[message.author.id]["Debilizm"]) {
      console.log("User does not have data");
      return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
  }


    // Create an array of { userId, wins } objects
    let lbArray = [];
    for (let userId in data.Data) {
        if (data.Data[userId].Wins !== undefined) {
            lbArray.push({ userId: userId, wins: data.Data[userId]["Debilizm"] });
        }
    }

    console.log("Leaderboard array created", lbArray);

    // Sort the array in descending order based on wins
    lbArray.sort((a, b) => b.wins - a.wins);

    // Create an array of the top users
    let topArray = [];
    for (let i = 0; i < lbArray.length && i < 10; i++) { // Limiting to top 10 users
        topArray.push(`${i + 1} - <@${lbArray[i].userId}> - Debilizm: ${lbArray[i].wins}`);
    }

    console.log("Top array created", topArray);

    // Convert the array to a string and send it as a message
    let stringArray = topArray.join('\n');
    message.channel.send(stringArray);
    console.log("Leaderboard sent to channel");
    // Check if the file exists and parse the file
    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path, 'utf8'));
      console.log("Data file read successfully");
  } else {
      console.log("Data file does not exist");
      return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
  }
  if (typeof data.Data[message.author.id] === 'undefined') {
    data.Data[message.author.id] = {};
  }
  if (typeof data.Data[message.author.id]["Debilizm"] === 'undefined') {
    data.Data[message.author.id]["Debilizm"] = 0;
  }
  if (typeof data.Data[message.author.id]["CooldownRate"] === 'undefined') {
    data.Data[message.author.id]["CooldownRate"] = 10;
  }
  if (typeof data.Data[message.author.id]["Oceny"] === 'undefined') {
    data.Data[message.author.id]["Oceny"] = 0;
  }
  const mentionedUserId2 = message.mentions.users.first()?.id;
  if (mentionedUserId2) {
    if (typeof data.Data[mentionedUserId2] === 'undefined') {
      data.Data[mentionedUserId2] = {};
    }
    if (typeof data.Data[mentionedUserId2]["Debilizm"] === 'undefined') {
      data.Data[mentionedUserId2]["Debilizm"] = 0;
    }
    if (typeof data.Data[mentionedUserId2]["Oceny"] === 'undefined') {
      data.Data[mentionedUserId2]["Oceny"] = 0;
    }
  } else {
    mentionedUserId2 = message.author.id
  }

  // Check if the user has data
  if (!data.Data[message.author.id]) {
      console.log("User does not have data");
      return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
  }
  if (!data.Data[message.author.id]["Oceny"]) {
    console.log("User does not have data");
    return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
}


  // Create an array of { userId, wins } objects
  let lbArray2 = [];
  for (let userId in data.Data) {
      if (data.Data[userId].Wins !== undefined) {
          lbArray2.push({ userId: userId, wins: data.Data[userId]["Oceny"] });
      }
  }

  console.log("Leaderboard array created", lbArray);

  // Sort the array in descending order based on wins
  lbArray.sort((a, b) => b.wins - a.wins);

  // Create an array of the top users
  let topArray2 = [];
  for (let i = 0; i < lbArray.length && i < 10; i++) { // Limiting to top 10 users
      topArray2.push(`${i + 1} - <@${lbArray[i].userId}> - Oceny: ${lbArray[i].wins}`);
  }

  console.log("Top array created", topArray);

  // Convert the array to a string and send it as a message
  let stringArray2 = topArray2.join('\n');
  message.channel.send(stringArray2);
  console.log("Leaderboard sent to channel");
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
} else if (command === "ocena"){
  let data;
    let path = "./data.json";
    

    // Check if the file exists and parse the file
    if (fs.existsSync(path)) {
        data = JSON.parse(fs.readFileSync(path, 'utf8'));
        console.log("Data file read successfully");
    } else {
        console.log("Data file does not exist");
        return message.channel.send("Sorry, you don't have any data so the bot would crash <3 Play guess a bit first?");
    }
    if (typeof data.Data[message.author.id] === 'undefined') {
      data.Data[message.author.id] = {};
    }
    if (typeof data.Data[message.author.id]["Debilizm"] === 'undefined') {
      data.Data[message.author.id]["Debilizm"] = 0;
    }
    if (typeof data.Data[message.author.id]["CooldownRate"] === 'undefined') {
      data.Data[message.author.id]["CooldownRate"] = 10;
    }
    if (typeof data.Data[message.author.id]["Oceny"] === 'undefined') {
      data.Data[message.author.id]["Oceny"] = 0;
    }
    let mentionedUserId = message.mentions.users.first()?.id;
    if (mentionedUserId) {
      if (typeof data.Data[mentionedUserId] === 'undefined') {
        data.Data[mentionedUserId] = {};
      }
      if (typeof data.Data[mentionedUserId]["Debilizm"] === 'undefined') {
        data.Data[mentionedUserId]["Debilizm"] = 0;
      }
      if (typeof data.Data[mentionedUserId]["Oceny"] === 'undefined') {
        data.Data[mentionedUserId]["Oceny"] = 0;
      }
    } else {
      mentionedUserId = message.author.id
    }

    message.channel.send("Zdobywanie informacji..")
    // pointless wait timer because yes
    setTimeout(() => {
      message.channel.send(`Statystyki dla <@${mentionedUserId}>\n\nDebilizm: ${data.Data[mentionedUserId]["Debilizm"]}\n\nOcenianie innych: ${data.Data[mentionedUserId]["Oceny"]}`)
    }, 500)
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}
if (command === "restart"){
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      return message.channel.send("wypierdalaj kurwo jebana");
    }
    
    await message.channel.send("??eval process.exit();");
    process.exit();
}

/* Legacy bot commands (Shwdow v2) */

if (command === "sex") {
  let mentionedFirst = message.mentions.users.first().id
  if (mentionedfirst) {

  } else {
    mentionedFirst = message.author.id
  }
  if (mentionedFirst === message.author.id) {
    let Channel = client.channels.cache.get(1269049650195992709)
    Channel.send(`<@${message.author.id}> próbował(a) sie ruchać! xDDD`)
  } else {
  message.channel.send(`<@${message.author.id}> rucha <@${mentionedFirst}>, o kurwa`)
  }
}
if (command === "publicsex") {
  let mentionedFirst = message.mentions.users.first().id
  if (mentionedfirst) {

  } else {
    mentionedFirst = message.author.id
  }
  if (mentionedFirst === message.author.id) {
    let Channel = client.channels.cache.get(1269049650195992709)
    Channel.send(`<@${message.author.id}> próbował(a) sie ruchać! xDDD`)
  } else {
    let Channel = client.channels.cache.get(1269049650195992709)
    Channel.send(`<@${message.author.id}> rucha <@${mentionedFirst}>, o kurwa`)
  }
}

} catch (error) {
  message.channel.send(`\`\`\`${error}\`\`\`\n\nSomething went wrong. Context: ${message.content}\n\n <@1260916274804953171>`)
}
  
});

// Separate event listener for botban and botunban commands
client.on('messageCreate', async message => {
  try {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();
  if (command === 'botban') {
    if (config.OwnerIDs.includes(message.author.id)) {
      const userId = args[0];
      if (!userId) {
        return message.channel.send("Please provide a user ID to ban.");
      }
      if (!config.ban) {
        config.ban = [];
      }
      if (!config.ban.includes(userId)) {
        config.ban.push(userId);
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), 'utf8');
        message.channel.send(`User ID ${userId} has been banned from using the bot. <:shwdow:1269277537910001797>`);
      } else {
        message.channel.send(`User ID ${userId} is already banned.`);
      }
    } else {
      message.channel.send("You are not permitted to perform this action.");
    }
  } else if (command === 'botunban') {
    if (config.OwnerIDs.includes(message.author.id)) {
      const userId = args[0];
      if (!userId) {
        return message.channel.send("Please provide a user ID to unban.");
      }
      if (config.ban && config.ban.includes(userId)) {
        config.ban = config.ban.filter(id => id !== userId);
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), 'utf8');
        message.channel.send(`User ID ${userId} has been unbanned from using the bot. <:rain:1269277891485761651>`);
      } else {
        message.channel.send(`User ID ${userId} is not banned.`);
      }
    } else {
      message.channel.send("You are not permitted to perform this action.");
    }
  }
  } catch (error) {
    message.channel.send(`${error}\n\nSomething went wrong. Context: ${message.content}\n\n <@1260916274804953171>`)
  }
});

client.login(config.DISCORD_TOKEN);
