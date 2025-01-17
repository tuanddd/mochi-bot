import config from "adapters/config"
import { SLASH_PREFIX } from "utils/constants"
import { composeEmbedMessage, getErrorEmbed } from "utils/discordEmbed"
import { CommandInteraction } from "discord.js"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"

export const info = new SlashCommandSubcommandBuilder()
  .setName("info")
  .setDescription("Show current logging channel info")

export async function logInfo(interaction: CommandInteraction) {
  if (!interaction.guild) {
    return {
      messageOptions: {
        embeds: [
          getErrorEmbed({
            description: "This command must be run in a Guild",
            originalMsgAuthor: interaction.user,
          }),
        ],
      },
    }
  }

  const guild = await config.getGuild(interaction.guild.id)
  if (!guild) {
    throw new Error(`Guild ${interaction.guildId} not found`)
  }
  if (!guild.log_channel) {
    const embed = composeEmbedMessage(null, {
      author: [interaction.guild.name, interaction.guild.iconURL() ?? ""],
      description: `No logging channel configured for this guild.\nSet one with \`${SLASH_PREFIX}log set <channel>.\``,
      originalMsgAuthor: interaction.user,
    })
    return { messageOptions: { embeds: [embed] } }
  }

  const embed = composeEmbedMessage(null, {
    author: [interaction.guild.name, interaction.guild.iconURL() ?? ""],
    description: `Current monitoring channel is <#${guild.log_channel}>.\nYou can update using \`${SLASH_PREFIX}log set <channel>.\``,
    originalMsgAuthor: interaction.user,
  })
  return { messageOptions: { embeds: [embed] } }
}
