const { Client, EmbedBuilder, ActivityType } = require("discord.js");
const fs = require("fs");
const express = require("express");
const app = express();
const {
  selfieID,
  bienvenueID,
  MemeID,
} = require("./config.json");

const client = new Client({
  intents: [3276799],
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.use("/ping", (req, res) => {
  res.send(new Date());
});

app.listen(3000, () => {
  console.log("Express is ready.");
});

let welcomeData = {};
try {
  welcomeData = require("./welcomeData.json");
} catch (error) {
  console.error("Erreur lors du chargement du fichier welcomeData.json");
}

client.on("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  client.user.setPresence({
    status: "dnd",
    activities: [
      {
        type: ActivityType.Competing,
        name: "Planète #🌠",
        state: "discord.gg/laplanete",
      },
    ],
  });
});

client.on("guildMemberAdd", async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    (channel) => channel.id === bienvenueID,
  );

  if (welcomeChannel) {
    const question = [
      "Quel est ton jeu vidéo préféré?",
      "Quel est ton film préféré?",
      "Quel est ton livre préféré?",
      "Quel est ton sport préféré?",
      "Quel est ton réseau social préféré?",
      "Quel est ton animal préféré?",
      "Tu préfères pouvoir voler ou être invisible?",
      "Tu préfères voyager dans le passé ou voyager dans le futur?",
      "Tu préfères vivre sans téléphone portable ou sans ordinateur?",
      "Tu préfères être connu pour ton intelligence ou pour ta gentillesse?",
      "Tu préfères résoudre un mystère criminel ou percer un mystère surnaturel?",
      "Tu préfères vivre au milieu d'une forêt ou sur une île déserte?",
    ];

    const questrandom = question[Math.floor(Math.random() * question.length)];

    const welcomeEmbed = new EmbedBuilder()
      .setColor("#2a2c31")
      .setDescription(
        `\`\`👋\`\`・Bienvenue <@${member.user.id}> sur \`\`Planète #🌠\`\` !!\n\`\`❓\`\`・Question du jour, bonjour:\n\`\`🗒️\`\`・${questrandom}`,
      );

    const welcomeMessage = await welcomeChannel.send({
      content: `<@${member.user.id}>`,
      embeds: [welcomeEmbed],
    });
    welcomeData[member.id] = welcomeMessage.id;
    saveWelcomeData();
  }
});

client.on("messageCreate", async (message) => {
  if (message.channel.id === MemeID && message.attachments.size > 0) {
    message
      .react("1174373358264131614")
      .then(() => message.react("1174373360805883995"))
      .then(() => message.react("1174373365272805418"))
      .catch(console.error);
  } else if (message.channel.id === MemeID && message.attachments.size === 0) {
  }

  if (message.channel.id === selfieID && message.attachments.size > 0) {
    const threadName = `Selfie de ${message.author.username}`;
    const createdThread = await message.startThread({
      name: threadName,
      autoArchiveDuration: 4320,
    });

    createdThread.send(
      `Bienvenue dans le salon avis selfie de ${message.author.username}`,
    );
  } else if (
    message.channel.id === selfieID &&
    message.attachments.size === 0
  ) {
    message.delete();
    message.author.send(
      `<:attention:1156547323598483598>〡Votre message dans le salon des <#907985342651568220> a été supprimé en raison de l'absence de photos ou de vidéos.`,
    );
  }
});

client.on("guildMemberRemove", async (member) => {
  if (welcomeData[member.id]) {
    const welcomeChannel = member.guild.channels.cache.find(
      (channel) => channel.id === "907985342492192844",
    );

    if (welcomeChannel) {
      welcomeChannel.messages
        .fetch(welcomeData[member.id])
        .then((message) => {
          message.delete();
          delete welcomeData[member.id];
          saveWelcomeData();
        })
        .catch((error) => console.error(error));
    }
  }
});

client.login(process.env.TOKEN);

function saveWelcomeData() {
  fs.writeFileSync(
    "./welcomeData.json",
    JSON.stringify(welcomeData, null, 4),
    "utf-8",
  );
}
