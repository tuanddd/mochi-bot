import { Command } from "types/common"
import { NFT_GITBOOK, PREFIX } from "utils/constants"
import { composeEmbedMessage } from "utils/discordEmbed"
import add from "./add"
import ticker from "./ticker"
import volume from "./top"
import list from "./list"
import recent from "./recent"
import query from "./query"
import stats from "./stats"
import config from "./config"
import integrate from "./integrate"
import { getEmoji } from "utils/common"

const actions: Record<string, Command> = {
  add,
  volume,
  ticker,
  list,
  recent,
  stats,
  config,
  integrate,
}

const command: Command = {
  id: "NFT",
  command: "nft",
  brief: "NFT",
  category: "Community",
  run: async (msg) => query.run(msg),
  featured: {
    title: `${getEmoji("nfts")} NFT`,
    description:
      "Show NFT rarity checker in real-time, including volume, ticker, and sales",
  },
  getHelpMessage: async (msg) => ({
    embeds: [
      composeEmbedMessage(msg, {
        usage: `${PREFIX}nft <collection_symbol> <token_id>\n${PREFIX}nft <action>`,
        footer: [`Type ${PREFIX}help nft <action> for a specific action!`],
        description:
          "Show NFT rarity checker in real-time, including volume, ticker, and sales",
        examples: `${PREFIX}nft list\n${PREFIX}nft MUTCATS 1\n${PREFIX}mochi bayc 1`,
        document: NFT_GITBOOK,
        includeCommandsList: true,
      }),
    ],
  }),
  actions,
  colorType: "Market",
  minArguments: 3,
  canRunWithoutAction: true,
  aliases: ["mochi"],
}

export default command
