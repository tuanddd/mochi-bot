import { Message, TextChannel } from "discord.js"
import { getErrorEmbed } from "utils/discordEmbed"
import { BotBaseError } from "./BaseError"

export class InsufficientBalanceError extends BotBaseError {
  private discordMessage: Message
  private errorMsg: string

  constructor({
    discordId,
    message,
    errorMsg,
  }: {
    discordId: string
    message: Message
    errorMsg: string
  }) {
    super()
    this.name = "Insufficient funds error"
    this.discordMessage = message
    this.errorMsg = errorMsg
    const channel = message.channel as TextChannel
    this.message = JSON.stringify({
      guild: message.guild ? message.guild.name : "",
      channel: channel ? channel.name : "dm",
      user: message.author.tag,
      data: { discordId },
    })
  }

  handle() {
    super.handle()
    this.discordMessage.channel.send({
      embeds: [
        getErrorEmbed({
          msg: this.discordMessage,
          title: "Insufficient funds",
          description: this.errorMsg,
        }),
      ],
    })
  }
}
