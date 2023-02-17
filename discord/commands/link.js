const {SlashCommandBuilder} = require('@discordjs/builders');
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
      .setName('link')
      .setDescription('link your address')
      .addStringOption(option =>
          option.setName('wallet')
              .setDescription('BSC address')
              .setRequired(true)),
  async execute(interaction) {
    const wallet = interaction.options.getString('wallet');
    try {
      await axios({
        method: 'post',
        url: 'https://cms.nestfi.net/bot-api/red-bot/user/dc',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
        },
        data: {
          redBotUser: {
            dcGroupId: interaction.guild.id,
            dcGroupName: interaction.guild.name,
            dcId: interaction.user.id,
            dcName: interaction.user.username,
            wallet: wallet
          }
        }
      });
      await interaction.reply(`Update ${interaction.user.username} wallet success!`);
    } catch (e) {
      console.log(e);
      await interaction.reply(`There was an error while executing this command!`);
    }
  }
}