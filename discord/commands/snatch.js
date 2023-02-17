const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('snatch')
      .setDescription('snatch NEST prize')
      .addStringOption(option =>
          option.setName('id')
              .setDescription('NEST Prize ID')
              .setRequired(true)),
  async execute(interaction) {
    const id = interaction.options.getString('id');
    if (interaction.commandName === 'snatch') {
      const row = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setCustomId('primary')
                  .setLabel('Snatch')
                  .setStyle(ButtonStyle.Primary)
          );
      await interaction.reply({content: `The prize is: ${id}`, ephemeral: true, components: [row]});
    }
  }
}