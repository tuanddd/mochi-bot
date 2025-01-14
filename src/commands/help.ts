import { Message, MessageEmbed } from "discord.js"
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
    features: Array<{
      value: string
      slashId?: string
      onlySlash?: boolean
      url: string
    }>
  }
> = {
  Verify: {
    emoji: getEmoji("approve"),
    description: "Verify your wallet",
    features: [
      {
        value: "verify",
        url: "https://mochibot.gitbook.io/mochi-bot/getting-started/wallet",
        slashId: "</verify info:1017319180166500374>",
      },
    ],
  },
  Telegram: {
    emoji: "<:telegram:970991964474445834>",
    description: "Link Telegram to Discord account",
    features: [
      {
        value: "telegram",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/config-to-telegram-account",
      },
    ],
  },
  Vote: {
    emoji: getEmoji("like"),
    description: "Vote for us and earn more reward",
    features: [
      {
        value: "vote",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/vote-for-mochi",
        slashId: "</vote:1016984541291888662>",
      },
    ],
  },
  "Server Insight": {
    emoji: getEmoji("prediction"),
    description:
      "Gain more server insight of channel, member, emoji, sticker statistic",
    features: [
      {
        value: "stat",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/server-stats",
      },
    ],
  },
  "Track NFT": {
    emoji: getEmoji("nfts"),
    description: "Check NFT rarity, track NFT sales and ranking",
    features: [
      {
        value: "sales",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/nft-rarity-ranking-and-volume/sales-tracker",
      },
      {
        value: "nft",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/nft-rarity-ranking-and-volume",
      },
    ],
  },
  Welcome: {
    emoji: "<:hello:899666094112010350>",
    description: "Send welcome message automatically",
    features: [
      {
        value: "welcome",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/welcome-message",
        slashId: "</welcome info:1019526882972143696>",
        onlySlash: true,
      },
    ],
  },
  "Develop Community": {
    emoji: getEmoji("fellowship"),
    description: "Set up channels and other add-ins to facilitate activities",
    features: [
      {
        value: "gm",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/gm-gn",
      },
      {
        value: "starboard",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/starboard",
      },
      {
        value: "log",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/log-channels",
        slashId: "</log info:1017017855134400512>",
      },
      {
        value: "poe",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/twitter-tweet-watcher-poe",
      },
    ],
  },
  "Manage Member Profile": {
    emoji: getEmoji("exp"),
    description: "Tracking member profile and ranking",
    features: [
      {
        value: "profile",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/users-profiles",
      },
      {
        value: "top",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/list-of-commands",
      },
    ],
  },
  "Manage Server Memeber": {
    emoji: "<a:pepepolicedog:974757344900681758>",
    description: "Grow the number of members or remove inactive ones",
    features: [
      {
        value: "invite",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/invite-tracker",
      },
      {
        value: "prune",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/prune-inactive-users",
        slashId: "</prune inactive:1022427257819643924>",
      },
    ],
  },
  "Track Crypto": {
    emoji: "📈",
    description: "Tracking crypto market movements and opportunities",
    features: [
      {
        value: "tokens",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/crypto-management/supported-tokens",
      },
      {
        value: "ticker",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/crypto-management/crypto-ticker",
        slashId: "</ticker:1016610378542764082>",
      },
      {
        value: "watchlist",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/crypto-management/token-watchlist",
        slashId: "</watchlist view:1017319180166500375>",
      },
    ],
  },
  Transaction: {
    emoji: getEmoji("tip"),
    description: "Making transactions among members and in your wallet",
    features: [
      {
        value: "tip",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/crypto-management/tip-bot",
      },
      {
        value: "deposit",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/crypto-management/deposit-and-withdraw",
      },
      {
        value: "withdraw",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/crypto-management/deposit-and-withdraw",
      },
      {
        value: "balances",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/crypto-management/check-balance",
      },
      {
        value: "airdrop",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/crypto-management/airdrop-tokens",
      },
    ],
  },
  "Assign Role": {
    emoji: "<:pawlord:917358832269795388>",
    description: "Assign role for members based on different criteria",
    features: [
      {
        value: "defaultrole",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/default-roles",
        slashId: "</defaultrole info:1017636940406857789>",
      },
      {
        value: "reactionrole",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/reaction-roles",
      },
      {
        value: "levelrole",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/level-roles",
        slashId: "</levelrole list:1017636940406857790>",
      },
      {
        value: "nftrole",
        url: "https://mochibot.gitbook.io/mochi-bot/functions/server-administration/nft-roles",
      },
    ],
  },
}

export function buildHelpInterface(
  embed: MessageEmbed,
  version: "$" | "/" = "$"
) {
  Object.entries(commands)
    .filter((c) => {
      if (version === "$") {
        const [, cmdData] = c
        // if viewing text version but only slash available then exclude it out
        if (cmdData.features.every((f) => f.onlySlash)) return false
      }
      return true
    })
    .forEach((cmd) => {
      const [cmdName, cmdData] = cmd
      embed.addFields({
        name: `${cmdData.emoji} ${capFirst(cmdName)}`,
        value: `${cmdData.features
          .map((f) => {
            if (f.slashId) {
              return f.slashId
            } else {
              return `[\`${version}${f.value}\`](${f.url})`
            }
          })
          .join(" ")}\n${cmdData.description}\n${getEmoji("blank")}`,
        inline: true,
      })
    })
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
    buildHelpInterface(embed)
    embed.addFields(
      {
        name: "\u200b",
        value: getEmoji("blank"),
        inline: true,
      },
      {
        name: "**Examples**",
        value: `\`\`\`$help invite\`\`\``,
      },
      {
        name: "**Document**",
        value: `[**Gitbook**](${HELP_GITBOOK})`,
        inline: true,
      },
      {
        name: "**Bring the Web3 universe to your Discord**",
        value: `[**Website**](${HOMEPAGE_URL})`,
        inline: true,
      }
    )

    return { embeds: [embed] }
  },
  allowDM: true,
  colorType: "Game",
}

export default command
