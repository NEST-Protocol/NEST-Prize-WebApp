const {SlashCommandBuilder} = require('@discordjs/builders');
const axios = require("axios");
const {isAddress} = require("ethers/lib/utils");

module.exports = {
  data: new SlashCommandBuilder()
      .setName('link')
      .setDescription('link your address')
      .addStringOption(option =>
          option.setName('wallet')
              .setDescription('BSC address')
              .setRequired(true)),
  async execute(interaction) {
    try {
      const wallet = interaction.options.getString('wallet');
      if (!isAddress(wallet)) {
        await interaction.reply({
          content: `Invalid wallet address!`,
          ephemeral: true
        });
        return;
      }
      axios({
        method: 'post',
        url: 'https://cms.nestfi.net/bot-api/red-bot/user/dc',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
        },
        data: {
          dcGroupId: interaction.guild.id,
          dcGroupName: interaction.guild.name,
          dcId: interaction.user.id,
          dcName: interaction.user.username,
          wallet: wallet
        }
      }).catch((e) => {
        console.log(e);
      })
      await interaction.reply({
        content: `Update ${interaction.user.username} wallet success!`,
        ephemeral: true
      });
    } catch (e) {
      console.log(e);
      await interaction.reply({
        content: `There was an error while executing this command!`,
        ephemeral: true
      });
    }
  }
}