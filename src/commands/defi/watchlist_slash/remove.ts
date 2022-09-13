import { SlashCommand } from "types/common"
import { CommandInteraction } from "discord.js"
import { thumbnails } from "utils/common"
import {
  getErrorEmbed,
  getSuccessEmbed,
  composeEmbedMessage2,
} from "utils/discordEmbed"
import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { SLASH_PREFIX as PREFIX } from "utils/constants"
import defi from "adapters/defi"
import CacheManager from "utils/CacheManager"

const command: SlashCommand = {
  name: "remove",
  category: "Defi",
  prepare: () => {
    return new SlashCommandSubcommandBuilder()
      .setName("remove")
      .setDescription("Remove a token from your watchlist.")
      .addStringOption((option) =>
        option
          .setName("symbol")
          .setDescription(
            "The token which you wanna remove from your watchlist."
          )
          .setRequired(true)
      )
  },
  run: async function (interaction: CommandInteraction) {
    const symbol = interaction.options.getString("symbol", true)
    const userId = interaction.user.id
    const { ok } = await defi.removeFromWatchlist({
      userId,
      symbol,
    })
    if (!ok) return { messageOptions: { embeds: [getErrorEmbed({})] } }
    CacheManager.findAndRemove("watchlist", `watchlist-${userId}-`)
    return { messageOptions: { embeds: [getSuccessEmbed({})] } }
  },
  help: async (interaction) => ({
    embeds: [
      composeEmbedMessage2(interaction, {
        thumbnail: thumbnails.TOKENS,
        title: "Remove a token from your watchlist.",
        usage: `${PREFIX}watchlist remove <symbol>`,
        examples: `${PREFIX}watchlist remove eth`,
      }),
    ],
  }),
  colorType: "Defi",
}

export default command
