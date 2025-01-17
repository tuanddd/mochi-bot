import { Guild, Message, TextChannel, User } from "discord.js"
import { getErrorEmbed } from "utils/discordEmbed"
import { BotBaseError } from "./BaseError"

export class CommandError extends BotBaseError {
  private customDescription: string | undefined
  constructor({
    message,
    user,
    guild,
    description,
  }: {
    message?: Message
    user?: User
    guild?: Guild | null
    description?: string
  }) {
    super(message)
    this.name = "Command error"
    this.customDescription = description
    const channel = (message?.channel as TextChannel)?.name
    this.message = JSON.stringify({
      guild: message?.guild?.name ?? guild?.name ?? "DM",
      channel,
      user: message?.author.tag ?? user?.tag ?? "Unknown",
      description,
    })
  }

  handle() {
    this.msgOrInteraction?.reply({
      embeds: [
        getErrorEmbed({
          title: this.name,
          description: this.customDescription,
        }),
      ],
    })
  }
}
