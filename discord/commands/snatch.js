const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('snatch')
      .setDescription('snatch NEST prize')
      .addStringOption(option =>
          option.setName('id')
              .setDescription('NEST Prize code')
              .setRequired(true)),
  async execute(interaction) {
    const code = interaction.options.getString('id');
    if (interaction.commandName === 'snatch') {
      const row = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setLabel('Snatch')
                  .setURL(`https://nest-prize-web-app-delta.vercel.app/prize?code=${code}&dcId=${interaction.user.id}`)
                  .setStyle(ButtonStyle.Link)
          );
      await interaction.reply({content: `Click Snatch Button to Open It!`, ephemeral: true, components: [row]});
    }
  }
}