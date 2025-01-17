import {
  ButtonInteraction,
  CommandInteraction,
  HexColorString,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageSelectMenu,
  MessageSelectOptionData,
  SelectMenuInteraction,
} from "discord.js"
import {
  composeDiscordExitButton,
  composeEmbedMessage,
  getErrorEmbed,
  composeDaysSelectMenu,
  composeDiscordSelectionRow,
  getSuccessEmbed,
} from "utils/discordEmbed"
import defi from "adapters/defi"
import {
  CommandChoiceHandler,
  EphemeralMessage,
} from "utils/CommandChoiceManager"
import { getChartColorConfig, renderChartImage } from "utils/canvas"
import { Coin } from "types/defi"
import { defaultEmojis, getEmoji, hasAdministrator } from "utils/common"
import config from "adapters/config"
import CacheManager from "utils/CacheManager"

async function renderCompareTokenChart({
  times,
  ratios,
  from,
  to,
}: {
  times: string[]
  ratios: number[]
  from: string
  to: string
}) {
  if (!times || !times.length) return null
  const image = await renderChartImage({
    chartLabel: `Price ratio | ${from} - ${to}`,
    labels: times,
    data: ratios,
  })

  return new MessageAttachment(image, "chart.png")
}

const handler: CommandChoiceHandler = async (msgOrInteraction) => {
  const interaction = msgOrInteraction as SelectMenuInteraction
  const { message } = <{ message: Message }>interaction
  const input = interaction.values[0]
  const [baseId, targetId, days] = input.split("_")
  if (!interaction.guildId) {
    return {
      messageOptions: { embeds: [getErrorEmbed({})] },
    }
  }
  const { ok, data } = await CacheManager.get({
    pool: "ticker",
    key: `compare-${message.guildId}-${baseId}-${targetId}-${days}`,
    call: () =>
      defi.compareToken(message.guildId ?? "", baseId, targetId, +days),
  })
  if (!ok) {
    await message.removeAttachments()
    return {
      messageOptions: { embeds: [getErrorEmbed({})] },
    }
  }

  const { times, ratios, from, to } = data
  const chart = await renderCompareTokenChart({ times, ratios, from, to })

  // update chart image
  await message.removeAttachments()
  const [embed] = message.embeds
  embed.setImage("attachment://chart.png")

  const selectMenu = message.components[0].components[0] as MessageSelectMenu
  const choices = ["1", "7", "30", "90", "180", "365"]
  selectMenu.options.forEach(
    (opt, i) => (opt.default = i === choices.indexOf(days))
  )

  return {
    messageOptions: {
      embeds: [embed],
      ...(chart && { files: [chart] }),
      components: message.components as MessageActionRow[],
    },
    commandChoiceOptions: {
      handler,
      userId: message.author.id,
      messageId: message.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      interaction,
    },
  }
}

export async function setDefaultTickers(i: ButtonInteraction) {
  const [baseId, baseSymbol, baseName, targetId, targetSymbol, targetName] =
    i.customId.split("|")
  const { ok: setDefaultBaseTickerOk } = await config.setGuildDefaultTicker({
    guild_id: i.guildId ?? "",
    query: baseSymbol,
    default_ticker: baseId,
  })
  if (setDefaultBaseTickerOk) {
    CacheManager.findAndRemove(
      "ticker",
      `ticker-default-${i.guildId}-${baseSymbol}`
    )
  }
  const { ok: setDefaultTargetTickerOk } = await config.setGuildDefaultTicker({
    guild_id: i.guildId ?? "",
    query: targetSymbol,
    default_ticker: targetId,
  })
  if (setDefaultTargetTickerOk) {
    CacheManager.findAndRemove(
      "ticker",
      `ticker-default-${i.guildId}-${targetSymbol}`
    )
  }
  if (setDefaultBaseTickerOk || setDefaultTargetTickerOk) {
    CacheManager.findAndRemove(
      "ticker",
      `compare-${i.guildId}-${baseSymbol}-${baseSymbol}-`
    )
  }

  const embed = getSuccessEmbed({
    msg: i.message as Message,
    title: "Default ticker ENABLED",
    description: `Next time your server members use $ticker with \`${baseSymbol}\` and \`${targetSymbol}\`, **${baseName}** and **${targetName}** will be the default selection`,
  })
  return {
    embeds: [embed],
  }
}

const suggestionsHandler: CommandChoiceHandler = async (msgOrInteraction) => {
  const interaction = msgOrInteraction as SelectMenuInteraction
  const { message } = <{ message: Message }>interaction
  const input = interaction.values[0]
  const [
    baseCoinId,
    baseCoinSymbol,
    baseCoinName,
    targetCoinId,
    targetCoinSymbol,
    targetCoinName,
    authorId,
  ] = input.split("_")

  const gMember = message.guild?.members.cache.get(
    authorId ?? message.author.id
  )
  // ask admin to set server default tickers
  let ephemeralMessage: EphemeralMessage | undefined
  if (hasAdministrator(gMember)) {
    await interaction.deferReply({ ephemeral: true })
    const actionRow = new MessageActionRow().addComponents(
      new MessageButton({
        customId: `${baseCoinId}|${baseCoinSymbol}|${baseCoinName}|${targetCoinId}|${targetCoinSymbol}|${targetCoinName}`,
        emoji: getEmoji("approve"),
        style: "PRIMARY",
        label: "Confirm",
      })
    )
    ephemeralMessage = {
      embeds: [
        composeEmbedMessage(message, {
          title: "Set default ticker",
          description: `Do you want to set **${baseCoinName}** and **${targetCoinName}** as your server default tickers?\nNo further selection next time use \`$ticker\``,
        }),
      ],
      components: [actionRow],
      buttonCollector: setDefaultTickers,
    }
  }

  return {
    ...(await composeTokenComparisonEmbed(
      interaction,
      baseCoinId,
      targetCoinId
    )),
    ephemeralMessage,
  }
}

async function composeSuggestionsResponse(
  interaction: SelectMenuInteraction | CommandInteraction,
  baseQ: string,
  targetQ: string,
  baseSuggestions: Coin[],
  targetSuggestions: Coin[]
) {
  const opt = (base: Coin, target: Coin): MessageSelectOptionData => ({
    label: `${base.name} (${base.symbol}) x ${target.name} (${target.symbol})`,
    value: `${base.id}_${base.symbol}_${base.name}_${target.id}_${target.symbol}_${target.name}_${interaction.user.id}`,
  })
  const options = baseSuggestions
    .map((b) => targetSuggestions.map((t) => opt(b, t)))
    .flat()
    .slice(0, 25) // discord allow maximum 25 options
  const selectRow = composeDiscordSelectionRow({
    customId: "compare_suggestions_selection",
    placeholder: "Make a selection",
    options,
  })

  const embed = composeEmbedMessage(null, {
    title: `${defaultEmojis.MAG} Multiple options found`,
    description: `${options.length} options found for \`${baseQ}/${targetQ}\`.\nPlease select one of the following options below`,
  })

  return {
    messageOptions: {
      embeds: [embed],
      components: [selectRow, composeDiscordExitButton(interaction.user.id)],
    },
    commandChoiceOptions: {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      handler: suggestionsHandler,
    },
  }
}

async function composeTokenComparisonEmbed(
  interaction: SelectMenuInteraction | CommandInteraction,
  baseQ: string,
  targetQ: string
) {
  if (!interaction.guildId) {
    return {
      messageOptions: { embeds: [getErrorEmbed({})] },
    }
  }
  const { ok, data } = await CacheManager.get({
    pool: "ticker",
    key: `compare-${interaction.guildId}-${baseQ}-${targetQ}-7`,
    call: () => defi.compareToken(interaction.guildId ?? "", baseQ, targetQ, 7),
  })
  if (!ok) {
    return {
      messageOptions: { embeds: [getErrorEmbed({})] },
    }
  }

  const { base_coin_suggestions, target_coin_suggestions } = data
  if (base_coin_suggestions || target_coin_suggestions) {
    return await composeSuggestionsResponse(
      interaction,
      baseQ,
      targetQ,
      base_coin_suggestions,
      target_coin_suggestions
    )
  }

  const coinInfo = (coin: Coin) =>
    `Rank: \`#${coin.market_cap_rank}\``
      .concat(
        `\nPrice: \`$${coin.market_data.current_price[
          "usd"
        ]?.toLocaleString()}\``
      )
      .concat(
        `\nMarket cap: \`$${coin.market_data.market_cap[
          "usd"
        ]?.toLocaleString()}\``
      )
  const { times, ratios, from, to, base_coin, target_coin } = data
  const currentRatio = ratios?.[ratios?.length - 1] ?? 0

  const embed = composeEmbedMessage(null, {
    color: getChartColorConfig(baseQ).borderColor as HexColorString,
    author: [`${base_coin.name} vs. ${target_coin.name}`],
    footer: ["Data fetched from CoinGecko.com"],
    image: "attachment://chart.png",
    description: `**Ratio**: \`${currentRatio}\``,
  })
    .addField(base_coin.name, coinInfo(base_coin), true)
    .addField(target_coin.name, coinInfo(target_coin), true)

  const chart = await renderCompareTokenChart({ times, ratios, from, to })
  const selectRow = composeDaysSelectMenu(
    "compare_token_selection",
    `${baseQ}_${targetQ}`,
    [1, 7, 30, 90, 180, 365]
  )

  return {
    messageOptions: {
      ...(chart && { files: [chart] }),
      embeds: [embed],
      components: [selectRow, composeDiscordExitButton(interaction.user.id)],
    },
    commandChoiceOptions: {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      handler,
    },
  }
}

export default async function Compare(
  interaction: CommandInteraction,
  baseQ: string,
  targetQ: string
) {
  return await composeTokenComparisonEmbed(interaction, baseQ, targetQ)
}
