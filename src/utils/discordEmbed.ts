import {
  ButtonInteraction,
  ColorResolvable,
  CommandInteraction,
  User,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageOptions,
  MessageSelectMenu,
  MessageSelectMenuOptions,
  MessageSelectOptionData,
  SelectMenuInteraction,
} from "discord.js"
import { COMMA, HOMEPAGE_URL, VERTICAL_BAR } from "./constants"
import {
  getEmbedFooter,
  getEmoji,
  getCommandsList,
  msgColors,
  getDateStr,
  getEmojiURL,
  emojis,
} from "./common"
import {
  getCommandObject,
  getActionCommand,
  specificHelpCommand,
  getSlashCommandObject,
} from "./commands"
import {
  Command,
  EmbedProperties,
  embedsColors,
  SlashCommand,
} from "types/common"
import {
  MessageButtonStyles,
  MessageComponentTypes,
} from "discord.js/typings/enums"
import dayjs from "dayjs"
import { BotBaseError } from "errors"
import ChannelLogger from "./ChannelLogger"

export const EMPTY_FIELD = {
  name: "\u200B",
  value: "\u200B",
  inline: true,
}

/**
 * Returns a formatted string of options (maximum 8)
 *
 * @param {string[]} options Array of option strings
 *
 * @return {string} Formatted string
 * */
export function composeSimpleSelection(
  options: string[],
  customRender?: (o: string, i: number) => string
): string {
  return `${options
    .slice(0, 8)
    .map((o, i) =>
      customRender
        ? customRender(o, i)
        : `${getEmoji(`num_${i + 1}`)} ${VERTICAL_BAR} ${o}`
    )
    .join("\n")}`
}

export function composeDiscordSelectionRow(
  options: MessageSelectMenuOptions = {}
): MessageActionRow {
  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu(options)
  )

  return row
}

export function composeNameDescriptionList(
  list: Array<{ name: string; description: string }>
) {
  const emoji = getEmoji("reply")
  return list
    .map((c) => `[**${c.name}**](${HOMEPAGE_URL})\n${emoji}${c.description}`)
    .join("\n\n")
}

export function getExitButton(authorId: string, label?: string) {
  return new MessageButton({
    customId: `exit-${authorId}`,
    emoji: getEmoji("revoke"),
    style: "SECONDARY",
    label: label ?? "Exit",
  })
}

export function composeDiscordExitButton(authorId: string): MessageActionRow {
  const row = new MessageActionRow().addComponents(getExitButton(authorId))

  return row
}

export function composeButtonLink(
  label: string,
  url: string
): MessageActionRow {
  const row = new MessageActionRow().addComponents(
    new MessageButton({
      style: MessageButtonStyles.LINK,
      label,
      url,
    })
  )

  return row
}

export async function workInProgress(): Promise<MessageOptions> {
  const embed = new MessageEmbed()
  embed
    .setColor("#F4BE5B")
    .setThumbnail(
      "https://cdn.discordapp.com/emojis/916737804002799699.png?size=240"
    )
    .setTitle("Work In Progress")
    .setDescription("We are working on this command. Stay tuned!")

  return { embeds: [embed] }
}

// TODO: remove after slash command migration done
export function composeEmbedMessage(
  msg: Message | null | undefined,
  props: EmbedProperties
) {
  let { title, description = "" } = props
  const {
    color,
    thumbnail,
    footer = [],
    timestamp = null,
    image,
    author: _author = [],
    originalMsgAuthor,
    usage,
    examples,
    withoutFooter,
    includeCommandsList,
    actions,
    document,
  } = props
  const author = _author.map((a) => a ?? "").filter(Boolean)
  const commandObj = getCommandObject(msg)
  const actionObj = getActionCommand(msg)
  const isSpecificHelpCommand = specificHelpCommand(msg)

  if (includeCommandsList) {
    description += `\n\n${getCommandsList(
      getEmoji("reply" ?? "╰ "),
      actions ?? commandObj?.actions ?? {}
    )}`
  }

  title =
    (isSpecificHelpCommand ? (actionObj ?? commandObj)?.brief : title) ?? ""

  let authorTag = msg?.author?.tag
  let authorAvatarURL = msg?.author?.avatarURL()
  if (originalMsgAuthor) {
    authorTag = originalMsgAuthor.tag
    authorAvatarURL = originalMsgAuthor.avatarURL()
  }

  const embed = new MessageEmbed()
    .setTitle(title)
    .setColor((color ?? getCommandColor(commandObj)) as ColorResolvable)

  // embed options
  if (!withoutFooter) {
    embed
      .setFooter(
        getEmbedFooter(
          authorTag ? [...footer, authorTag] : [...footer, "Mochi bot"]
        ),
        authorAvatarURL || undefined
      )
      .setTimestamp(timestamp ?? new Date())
  }
  if (description) embed.setDescription(description)
  if (thumbnail) embed.setThumbnail(thumbnail)
  if (image) embed.setImage(image)
  if (author.length === 1) embed.setAuthor(author[0])
  if (author.length === 2) embed.setAuthor(author[0], author[1])

  // embed fields
  const aliases = (actionObj ?? commandObj)?.aliases
  if (isSpecificHelpCommand && aliases)
    embed.addFields({
      name: "\u200B",
      value: `**Alias**: ${aliases.map((a) => `\`${a}\``).join(COMMA)}.`,
    })
  if (usage) {
    embed.addFields({ name: "**Usage**", value: `\`\`\`${usage}\`\`\`` })
  }
  if (examples) {
    embed.addFields({ name: "**Examples**", value: `\`\`\`${examples}\`\`\`` })
  }
  if (document) {
    embed.addFields({
      name: "**Instructions**",
      value: `[**Gitbook**](${document})`,
    })
  }
  return embed
}

// TODO: remove after slash command migration done
function getCommandColor(commandObj: Command | null) {
  return embedsColors[commandObj?.colorType ?? "Command"]
}

export function getSuggestionEmbed(params: {
  title?: string
  description: string
  msg: Message
}) {
  const { title, description, msg } = params
  const embed = composeEmbedMessage(msg, {
    author: [title ?? "Hmm?", getEmojiURL(emojis["QUESTION"])],
    description,
    color: "#ffffff",
  })

  return embed
}

export function getSuggestionComponents(
  suggestions: Array<MessageSelectOptionData>
) {
  if (suggestions.length === 0) return
  const hasOneSuggestion = suggestions.length === 1
  const row = new MessageActionRow()
  if (hasOneSuggestion) {
    const button = new MessageButton()
      .setLabel("Yes")
      .setStyle("PRIMARY")
      .setCustomId(`suggestion-button-${suggestions[0].value}`)
    row.addComponents(button)
  } else {
    const select = new MessageSelectMenu()
      .setPlaceholder("Other options")
      .addOptions(suggestions)
      .setCustomId("suggestion-select")
    row.addComponents(select)
  }

  return row
}

// TODO: remove after slash command migration done
export function getSuccessEmbed(params: {
  title?: string
  description?: string
  thumbnail?: string
  msg?: Message
  image?: string
  originalMsgAuthor?: User
}) {
  const { title, description, thumbnail, msg, image, originalMsgAuthor } =
    params
  return composeEmbedMessage(msg, {
    author: [title ?? "Successful", getEmojiURL(emojis["APPROVE"])],
    description: description ?? "The operation finished successfully",
    image,
    thumbnail,
    color: msgColors.SUCCESS,
    originalMsgAuthor,
  })
}

// TODO: remove after slash command migration done
export function getErrorEmbed(params: {
  title?: string
  description?: string
  thumbnail?: string
  msg?: Message
  image?: string
  originalMsgAuthor?: User
}) {
  const { title, description, thumbnail, msg, image, originalMsgAuthor } =
    params
  return composeEmbedMessage(msg, {
    author: [title ?? "Command error", getEmojiURL(emojis["REVOKE"])],
    description:
      description ??
      "There was an error. Our team has been informed and is trying to fix the issue. Stay tuned.",
    image,
    thumbnail,
    color: msgColors.ERROR,
    originalMsgAuthor,
  })
}

export function getInvalidInputEmbed(msg: Message) {
  return getErrorEmbed({
    msg,
    title: "Invalid input",
    description:
      "That is an invalid argument. Please see help message of the command",
  })
}

export function justifyEmbedFields(embed: MessageEmbed, cols: number) {
  if (embed.fields.length % cols === 0) {
    return embed
  }
  embed.addFields(Array(cols - (embed.fields.length % cols)).fill(EMPTY_FIELD))
  return embed
}

export async function renderPaginator(msg: Message, pages: MessageEmbed[]) {
  if (!pages.length) return
  let page = 0
  const forwardBtn = new MessageButton()
    .setCustomId("FORWARD_BTN")
    .setLabel("Next")
    .setStyle("SECONDARY")
  const backwardBtn = new MessageButton()
    .setCustomId("BACKWARD_BTN")
    .setLabel("Previous")
    .setStyle("SECONDARY")
  const row = new MessageActionRow().addComponents([backwardBtn, forwardBtn])

  const message = await msg.channel.send({
    embeds: [pages[page]],
    components: [row],
  })

  const collector = message.createMessageComponentCollector({
    componentType: "BUTTON",
    time: 20000,
  })

  collector.on("collect", async (i) => {
    await i.deferUpdate()
    if (i.user.id !== msg.author.id) return
    if (i.customId === "FORWARD_BTN") {
      page = page > 0 ? page - 1 : pages.length - 1
      await message
        .edit({ embeds: [pages[page]], components: [row] })
        .catch(() => null)
    }
    if (i.customId === "BACKWARD_BTN") {
      page = page < pages.length - 1 ? page + 1 : 0
      await message
        .edit({ embeds: [pages[page]], components: [row] })
        .catch(() => null)
    }
  })
}

export function getPaginationRow(page: number, totalPage: number) {
  if (totalPage === 1) return []
  const actionRow = new MessageActionRow()
  if (page !== 0) {
    actionRow.addComponents(
      new MessageButton({
        type: MessageComponentTypes.BUTTON,
        style: MessageButtonStyles.PRIMARY,
        label: "Previous",
        customId: `page_${page}_-_${totalPage}`,
      })
    )
  }

  if (page !== totalPage - 1) {
    actionRow.addComponents({
      type: MessageComponentTypes.BUTTON,
      style: MessageButtonStyles.PRIMARY,
      label: "Next",
      customId: `page_${page}_+_${totalPage}`,
    })
  }
  return [actionRow]
}

export function listenForSuggestionAction(
  replyMsg: Message,
  authorId: string,
  onAction: (
    value: string,
    i: ButtonInteraction | SelectMenuInteraction
  ) => Promise<void>
) {
  replyMsg
    .createMessageComponentCollector({
      componentType: MessageComponentTypes.BUTTON,
      idle: 60000,
    })
    .on("collect", async (i) => {
      if (i.user.id !== authorId) return
      const value = i.customId.split("-").pop()
      try {
        await onAction(value ?? "", i)
      } catch (e: any) {
        let error = e as BotBaseError

        // something went wrong
        if (!(error instanceof BotBaseError)) {
          error = new BotBaseError(i.message as Message, e.message as string)
        }
        error.handle?.()
        const originalMsg = await i.channel?.messages.fetch(
          (i.message as Message).reference?.messageId ?? ""
        )
        if (originalMsg) {
          ChannelLogger.alert(originalMsg, error)
        }
      }
    })
    .on("end", () => {
      replyMsg.edit({ components: [] }).catch(() => null)
    })

  replyMsg
    .createMessageComponentCollector({
      componentType: MessageComponentTypes.SELECT_MENU,
      idle: 60000,
    })
    .on("collect", async (i) => {
      if (i.user.id !== authorId) return
      const value = i.values[0]
      try {
        await onAction(value, i)
      } catch (e: any) {
        let error = e as BotBaseError

        // something went wrong
        if (!(error instanceof BotBaseError)) {
          error = new BotBaseError(i.message as Message, e.message as string)
        }
        error.handle?.()
        const originalMsg = await i.channel?.messages.fetch(
          (i.message as Message).reference?.messageId ?? ""
        )
        if (originalMsg) {
          ChannelLogger.alert(originalMsg, error)
        }
      }
    })
    .on("end", () => {
      replyMsg.edit({ components: [] }).catch(() => null)
    })
}

export function listenForPaginateAction(
  replyMsg: Message,
  originalMsg: Message,
  render: (
    msg: Message,
    pageIdx: number
  ) => Promise<{ messageOptions: MessageOptions }>,
  withAttachmentUpdate?: boolean,
  withMultipleComponents?: boolean
) {
  const operators: Record<string, number> = {
    "+": 1,
    "-": -1,
  }
  replyMsg
    .createMessageComponentCollector({
      componentType: MessageComponentTypes.BUTTON,
      idle: 60000,
    })
    .on("collect", async (i) => {
      await i.deferUpdate()
      const [pageStr, opStr, totalPage] = i.customId.split("_").slice(1)
      const page = +pageStr + operators[opStr]
      const {
        messageOptions: { embeds, components, files },
      } = await render(originalMsg, page)

      const msgComponents = withMultipleComponents
        ? components
        : getPaginationRow(page, +totalPage)
      if (withAttachmentUpdate && files?.length) {
        await replyMsg.removeAttachments()
        await replyMsg
          .edit({
            embeds,
            components: msgComponents,
            files,
          })
          .catch(() => null)
      } else {
        await replyMsg
          .edit({
            embeds,
            components: msgComponents,
          })
          .catch(() => null)
      }
    })
    .on("end", () => {
      replyMsg.edit({ components: [] }).catch(() => null)
    })
}

export function composeDaysSelectMenu(
  customId: string,
  optValuePrefix: string,
  days: number[],
  defaultVal?: number
) {
  const getDropdownOptionDescription = (days: number) =>
    `${getDateStr(dayjs().subtract(days, "day").unix() * 1000)} - ${getDateStr(
      dayjs().unix() * 1000
    )}`
  const opt = (days: number): MessageSelectOptionData => ({
    label: `${days === 365 ? "1 year" : `${days} day${days > 1 ? "s" : ""}`}`,
    value: `${optValuePrefix}_${days}`,
    emoji: days > 1 ? "📆" : "🕒",
    description: getDropdownOptionDescription(days),
    default: days === (defaultVal ?? 7),
  })
  const selectRow = composeDiscordSelectionRow({
    customId,
    placeholder: "Make a selection",
    options: days.map((d) => opt(d)),
  })
  return selectRow
}

export function composeEmbedMessage2(
  interaction: CommandInteraction,
  props: EmbedProperties
) {
  const {
    title,
    description,
    color,
    thumbnail,
    footer = [],
    timestamp = null,
    image,
    author: _author = [],
    originalMsgAuthor,
    usage,
    examples,
    withoutFooter,
    // includeCommandsList,
    // actions,
  } = props
  const author = _author.map((a) => a ?? "").filter(Boolean)
  const commandObj = getSlashCommandObject(interaction)

  // if (includeCommandsList) {
  //   description += `\n\n${getCommandsList(
  //     getEmoji("reply" ?? "╰ "),
  //     actions ?? commandObj?.actions ?? {}
  //   )}`
  // }

  // title =
  //   (isSpecificHelpCommand ? (actionObj ?? commandObj)?.brief : title) ?? ""

  let authorTag = interaction.user.tag
  let authorAvatarURL = interaction.user.avatarURL()
  if (originalMsgAuthor) {
    authorTag = originalMsgAuthor.tag
    authorAvatarURL = originalMsgAuthor.avatarURL()
  }

  const embed = new MessageEmbed()
    .setTitle(title ?? "")
    .setColor((color ?? getSlashCommandColor(commandObj)) as ColorResolvable)

  // embed options
  if (!withoutFooter) {
    embed
      .setFooter(
        getEmbedFooter(
          authorTag ? [...footer, authorTag] : footer ?? ["Mochi bot"]
        ),
        authorAvatarURL || undefined
      )
      .setTimestamp(timestamp ?? new Date())
  }
  if (description) embed.setDescription(description)
  if (thumbnail) embed.setThumbnail(thumbnail)
  if (image) embed.setImage(image)
  if (author.length === 1) embed.setAuthor(author[0])
  if (author.length === 2) embed.setAuthor(author[0], author[1])

  // embed fields
  if (usage) embed.addField("**Usage**", `\`\`\`${usage}\`\`\``)
  if (examples) embed.addField("**Examples**", `\`\`\`${examples}\`\`\``)
  return embed
}

function getSlashCommandColor(commandObj: SlashCommand | null) {
  return embedsColors[commandObj?.colorType ?? "Command"]
}
