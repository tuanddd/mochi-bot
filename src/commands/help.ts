import { Message } from "discord.js"
import { HELP_GITBOOK, HOMEPAGE_URL } from "utils/constants"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { capFirst, getEmoji, thumbnails } from "utils/common"
import { Command } from "types/common"
import { composeEmbedMessage } from "utils/discordEmbed"
dayjs.extend(utc)

const image =
  "https://cdn.discordapp.com/attachments/984660970624409630/1023869479521882193/help2.png"

function getHelpEmbed(msg: Message) {
  return composeEmbedMessage(msg, {
    title: `Mochi Bot Commands`,
    author: ["Mochi Bot", thumbnails.HELP],
    image,
  })
}

const commands: Record<
  string,
  {
    emoji: string
    description: string
    features: Array<{ value: string; url: string }>
  }
> = {
  Verify: {
    emoji: getEmoji("approve"),
    description: "Verify your wallet",
    features: [
      {
        value: "verify",
        url: "https://mochibot.gitbook.io/mochi-bot/getting-started/wallet",
      },
    ],
    // features: "`$verify`",
  },
  Telegram: {
    description: "Link Telegram to Discord account",
    features: "`$telegram`",
  },
  Vote: {
    description: "Vote for us and earn more reward",
    features: "`$vote`",
  },
  "Server Insight": {
    description:
      "Gain more server insight of channel, member, emoji, sticker statistic",
    features: "`$stat`",
  },
  "Track NFT": {
    description: "Check NFT rarity, track NFT sales and ranking",
    features: "`$sales`, `$nft`",
  },
  "Develop Community": {
    description: "Set up channels and other add-ins to facilitate activities",
    features: "`$verify`",
  },
  "Manage Member Profile": {
    description: "Tracking member profile and ranking",
    features: "`$profile`, `$top`",
  },
  "Manage Server Memeber": {
    description: "Grow the number of members or remove inactive ones",
    features: "`$invite`, `$prune`",
  },
  "Track Crypto": {
    description: "Tracking crypto market movements and opportunities",
    features: "`$tokens`, `$ticker`, `$watchlist`",
  },
  Transaction: {
    description: "Making transactions among members and in your wallet",
    features: "`$tip`, `$deposit`, `$balances`, `$airdrop`, `$withdraw`",
  },
  "Assign Role": {
    description: "Assign role for members based on different criteria",
    features: "`$defaultrole`, `$reactionrole`, `$levelrole`, `$nftrole`",
  },
}

const command: Command = {
  id: "help",
  command: "help",
  category: "Profile",
  brief: "Help Menu",
  run: async function (msg: Message) {
    const data = await this.getHelpMessage(msg)
    return { messageOptions: data }
  },
  getHelpMessage: async (msg: Message) => {
    const embed = getHelpEmbed(msg)
    Object.entries(commands).forEach((cmd) => {
      const [cmdName, cmdData] = cmd
      embed.addFields({
        name: capFirst(cmdName ?? ""),
        value: `${cmdData.features}\n${cmdData.description}`,
        inline: true,
      })
    })
    embed.addFields(
      {
        name: "Bring the Web3 universe to your Discord",
        value: `[**[Webite]**](${HOMEPAGE_URL})`,
        inline: true,
      },
      {
        name: "**Examples**",
        value: `\`\`\`$help invite\`\`\``,
      },
      {
        name: "**Document**",
        value: `[**Gitbook**](${HELP_GITBOOK})`,
      }
    )

    return { embeds: [embed] }
  },
  allowDM: true,
  colorType: "Game",
}

export default command
