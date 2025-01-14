import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders"
import {
  ColorResolvable,
  CommandInteraction,
  Message,
  MessageOptions,
  User,
} from "discord.js"
import { SetOptional } from "type-fest"
import { CommandChoiceHandlerOptions } from "utils/CommandChoiceManager"

// Category of commands
export type Category = "Profile" | "Defi" | "Config" | "Community" | "Game"
export type ColorType =
  | "Profile"
  | "Server"
  | "Marketplace" // for sales bot commands
  | "Market" // for showing NFT market-data commands
  | "Defi"
  | "Command"
  | "Game"

export const embedsColors: Record<string, string> = {
  Profile: "#62A1FE",
  Server: "#62A1FE",
  Marketplace: "#FFDE6A",
  Market: "#848CD9",
  Defi: "#9FFFE4",
  Command: "#62A1FE",
  Game: "#FFAD83",
}

export type SlashCommandChoiceOption = {
  name: string
  description: string
  required: boolean
  choices: [string, string][]
}

export type SlashCommand = {
  name: string
  category: Category
  prepare: (
    slashCommands?: Record<string, SlashCommand>
  ) =>
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandSubcommandBuilder
  run: (interaction: CommandInteraction) => Promise<
    | {
        messageOptions: MessageOptions
        commandChoiceOptions?: SetOptional<
          CommandChoiceHandlerOptions,
          "messageId"
        >
      }
    | void
    | null
    | undefined
  >
  help: (interaction: CommandInteraction) => Promise<MessageOptions>
  ephemeral?: boolean
  colorType: ColorType
}

// TODO: remove after slash command migration done
export type Command = {
  id: string
  command: string
  category: Category
  brief: string
  featured?: {
    title: string
    description: string
  }
  onlyAdministrator?: boolean
  run: (
    msg: Message,
    action?: string,
    isAdmin?: boolean
  ) => Promise<
    | {
        messageOptions: MessageOptions
        commandChoiceOptions?: SetOptional<
          CommandChoiceHandlerOptions,
          "messageId"
        >
      }
    | void
    | null
    | undefined
  >
  getHelpMessage: (
    msg: Message,
    action?: string,
    isAdmin?: boolean
  ) => Promise<MessageOptions>
  aliases?: string[]
  canRunWithoutAction?: boolean
  // can only run in admin channels & won't be shown in `$help` message
  experimental?: boolean
  actions?: Record<string, Command>
  allowDM?: boolean
  colorType: ColorType
  minArguments?: number
}

export type EmbedProperties = {
  title?: string
  description?: string
  thumbnail?: string | null
  color?: string | ColorResolvable
  footer?: string[]
  timestamp?: Date | null
  image?: string
  author?: Array<string | null | undefined>
  originalMsgAuthor?: User
  usage?: string
  examples?: string
  withoutFooter?: boolean
  includeCommandsList?: boolean
  actions?: Record<string, Command>
  document?: string
}

// TODO: move all below
export type Role = {
  id: string
  name: string
  reaction: string
}
export type ReactionRoleResponse = {
  guild_id: string
  message_id: string
  role: Role
}

export type RoleReactionEvent = {
  guild_id: string
  message_id: string
  reaction: string
  role_id?: string
}

export type RoleReactionConfigResponse = {
  guild_id: string
  message_id: string
  roles: Role[]
  success: boolean
}

export type DefaultRoleEvent = {
  guild_id: string
  role_id: string
}

export type DefaultRole = {
  role_id: string
  guild_id: string
}

export type DefaultRoleResponse = {
  data: DefaultRole
  success: boolean
}

export type RepostReactionRequest = {
  guild_id: string
  emoji: string
  quantity?: number | 0
  repost_channel_id?: string | ""
}

export type Pagination = {
  page: number
  size: number
  total: number
}
