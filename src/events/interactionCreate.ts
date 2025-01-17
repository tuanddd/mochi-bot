import { slashCommands } from "commands"
import { confirmGlobalXP } from "commands/config/globalxp"
import { confirmAirdrop, enterAirdrop } from "commands/defi/airdrop"
import { triplePodInteraction } from "commands/games/tripod"
import { sendVerifyURL } from "commands/profile/verify"
import {
  SelectMenuInteraction,
  ButtonInteraction,
  Message,
  Interaction,
  CommandInteraction,
} from "discord.js"
import { MessageComponentTypes } from "discord.js/typings/enums"
import { BotBaseError } from "errors"
import ChannelLogger from "utils/ChannelLogger"
import CommandChoiceManager from "utils/CommandChoiceManager"
import { Event } from "."
import { getErrorEmbed } from "utils/discordEmbed"
import CacheManager from "utils/CacheManager"
import community from "adapters/community"

export default {
  name: "interactionCreate",
  once: false,
  execute: async (interaction) => {
    if (
      !interaction.isSelectMenu() &&
      !interaction.isButton() &&
      !interaction.isCommand()
    )
      return
    let msg = undefined
    if ("message" in interaction && interaction.message instanceof Message) {
      msg = interaction.message
    }
    try {
      if (interaction.isSelectMenu()) {
        await handleSelecMenuInteraction(interaction)
      } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction)
      } else if (interaction.isCommand()) {
        await handleCommandInteraction(interaction)
      }
    } catch (e: any) {
      let error = e as BotBaseError

      // something went wrong
      if (!(error instanceof BotBaseError)) {
        error = new BotBaseError(msg, e.message as string)
      }
      error.handle?.()
      if (msg) {
        ChannelLogger.alert(msg, error)
      } else if (interaction.isCommand()) {
        ChannelLogger.alertSlash(interaction, error)
      }
      ChannelLogger.log(error, 'Event<"interactionCreate">')
    }
  },
} as Event<"interactionCreate">

async function handleCommandInteraction(interaction: Interaction) {
  const i = interaction as CommandInteraction
  const command = slashCommands[i.commandName]
  if (!command) {
    await i.reply({ embeds: [getErrorEmbed({})] })
    return
  }
  await i.deferReply({ ephemeral: command?.ephemeral })
  const response = await command.run(i)
  if (!response) return
  const { messageOptions, commandChoiceOptions } = response
  let shouldRemind = await CacheManager.get({
    pool: "vote",
    key: `remind-${i.user.id}-vote-again`,
    // 5 min
    ttl: 300,
    call: async () => {
      const res = await community.getUpvoteStreak(i.user.id)
      let ttl = 0
      let shouldRemind = true
      if (res.ok) {
        const timeUntilTopgg = res.data?.minutes_until_reset_topgg ?? 0
        const timeUntilDiscordBotList =
          res.data?.minutes_until_reset_discordbotlist ?? 0
        ttl = Math.max(timeUntilTopgg, timeUntilDiscordBotList)

        // only remind if both timers are 0 meaning both source can be voted again
        shouldRemind = ttl === 0
      }
      return shouldRemind
    },
  })
  if (i.commandName === "vote") {
    // user is already using $vote, no point in reminding
    shouldRemind = false
  }
  const reply = <Message>await i
    .editReply({
      ...(shouldRemind
        ? { content: "> 👋 Psst! You can vote now, try `$vote`. 😉" }
        : {}),
      ...messageOptions,
    })
    .catch(() => null)
  if (commandChoiceOptions) {
    CommandChoiceManager.add({
      ...commandChoiceOptions,
      messageId: reply.id,
    })
  }
}

async function handleSelecMenuInteraction(interaction: Interaction) {
  const i = interaction as SelectMenuInteraction
  const msg = i.message as Message
  const key = `${i.user.id}_${msg.guildId}_${msg.channelId}`
  const commandChoice = await CommandChoiceManager.get(key)
  if (!commandChoice || !commandChoice.handler) return
  if (i.customId === "exit") {
    await msg
      .delete()
      .catch(() => {
        commandChoice.interaction?.editReply({
          content: "Exited!",
          components: [],
          embeds: [],
        })
      })
      .catch(() => null)
    CommandChoiceManager.remove(key)
    return
  }

  const { messageOptions, commandChoiceOptions, ephemeralMessage } =
    await commandChoice.handler(i)

  let output: Message
  const deferredOrReplied = i.deferred || i.replied
  if (ephemeralMessage && deferredOrReplied) {
    // already deferred or replied in commandChoice.handler()
    // we do this for long-response command (> 3s) to prevent bot from throwing "Unknown interaction" error
    output = <Message>await i
      .editReply({
        embeds: ephemeralMessage.embeds,
        components: ephemeralMessage.components,
      })
      .catch(() => null)
  } else if (ephemeralMessage && !deferredOrReplied) {
    output = <Message>await i.reply({
      ephemeral: true,
      fetchReply: true,
      embeds: ephemeralMessage.embeds,
      components: ephemeralMessage.components,
    })
  } else if (!ephemeralMessage && !deferredOrReplied) {
    // no ephemeral so no need to respond to interaction
    output = <Message>await i.deferUpdate({ fetchReply: true })
  } else {
    // in fact this case should never happen
    return
  }

  if (ephemeralMessage?.buttonCollector) {
    output
      .createMessageComponentCollector({
        componentType: MessageComponentTypes.BUTTON,
      })
      .on("collect", async (i) => {
        await i.deferUpdate()
        const result = await ephemeralMessage.buttonCollector?.(i)
        if (!result) return
        i.editReply({
          embeds: result.embeds,
          components: result.components ?? [],
        }).catch(() => null)
      })
  }

  await CommandChoiceManager.update(key, {
    ...commandChoiceOptions,
    interaction: i,
    messageId: output?.id,
  })
  i
  await msg.edit(messageOptions).catch(() => null)
}

async function handleButtonInteraction(interaction: Interaction) {
  const i = interaction as ButtonInteraction
  const msg = i.message as Message
  switch (true) {
    case i.customId.startsWith("exit-"): {
      const authorId = i.customId.split("-")[1]
      if (i.user.id !== authorId) {
        await i.deferUpdate()
        return
      }
      await msg.delete()
      return
    }
    case i.customId.startsWith("confirm_airdrop-"):
      await confirmAirdrop(i, msg)
      return
    case i.customId.startsWith("enter_airdrop-"):
      await enterAirdrop(i, msg)
      return
    case i.customId.startsWith("mochi_verify"):
      await sendVerifyURL(i)
      return
    case i.customId.startsWith("globalxp"):
      await confirmGlobalXP(i, msg)
      return
    case i.customId.startsWith("triple-pod-"):
      await triplePodInteraction(i)
      return
    default:
      return
  }
}
