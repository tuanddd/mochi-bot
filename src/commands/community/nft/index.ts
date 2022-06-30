import { EmbedFieldData, Message } from "discord.js"
import { Command } from "types/common"
import { getAllAliases, getCommandArguments } from "utils/commands"
import { PREFIX } from "utils/constants"
import { composeEmbedMessage, justifyEmbedFields } from "utils/discordEmbed"
import add from "./add"
import ticker from "./ticker"
import volume from "./top"
import list from "./list"
import newListed from "./newListed"
import community from "adapters/community"
import { getEmoji } from "utils/common"

const actions: Record<string, Command> = {
  add,
  volume,
  ticker,
  list,
  newListed,
}
const commands: Record<string, Command> = getAllAliases(actions)

function getEmojiRarity(rarity: string) {
  const rarities = ["common", "rare", "uncommon", "legendary", "mythic"]
  rarity = !rarities.includes(rarity.toLowerCase()) ? "common" : rarity
  return (
    getEmoji(`${rarity}1`) + getEmoji(`${rarity}2`) + getEmoji(`${rarity}3`)
  )
}

async function composeNFTDetail(
  msg: Message,
  collectionSymbol: string,
  tokenId: string
) {
  const res = await community.getNFTDetail(collectionSymbol, tokenId)
  const data = res.data
  // handle case record not found
  switch (res.error) {
    case "database: record nft collection not found": {
      const embed = composeEmbedMessage(msg, {
        title: "NFT",
        description: `Collection has not been added.`,
      })
      return justifyEmbedFields(embed, 1)
    }
    case "indexer: record nft not found": {
      const embed = composeEmbedMessage(msg, {
        title: "NFT",
        description: `Token not found.`,
      })
      return justifyEmbedFields(embed, 1)
    }
    case "indexer: data not in sync": {
      const embed = composeEmbedMessage(msg, {
        title: "NFT",
        description: `Sync data in progress.`,
      })
      return justifyEmbedFields(embed, 1)
    }
  }

  // case token not found, token_id == null
  if (data.token_id == undefined) {
    const errorEmbed = composeEmbedMessage(msg, {
      title: "NFT",
      description: "Token not found.",
    })
    return justifyEmbedFields(errorEmbed, 1)
  }
  const dataCollection = await community.getNFTCollectionDetail(
    collectionSymbol
  )
  const {
    name,
    attributes,
    rarity,
    image,
  }: { name: string; attributes: any[]; rarity: any; image: string } = data
  const title = `${dataCollection.name
    .charAt(0)
    .toUpperCase()}${dataCollection.name.slice(1)}`

  // set rank, rarity score empty if have data
  let description = name ? `**${name}**` : ""
  let rarityRate = ""
  // handle for case collection not have rariry
  if (rarity.rarity) {
    rarityRate = `**・** ${getEmojiRarity(rarity.rarity)}`
  }
  if (rarity) {
    if (rarity.rank == 0 || rarity.total == 0 || rarity.score == "") {
      description += ``
    } else {
      description += `\n\n🏆** ・ Rank: ${rarity.rank} ** ${rarityRate}`
    }
  }

  const fields: EmbedFieldData[] = attributes
    ? attributes.map((attr) => ({
        name: attr.trait_type,
        value: `${attr.value}${attr.frequency ? "\n" + attr.frequency : ""}`,
        inline: true,
      }))
    : []

  // handle some nft, the value of attribute is "" -> this cannot handle
  for (const field of fields) {
    if (field.value == "") {
      field.value = "0"
    }
  }

  const embed = composeEmbedMessage(msg, {
    title,
    description,
    image,
  }).addFields(fields)
  return justifyEmbedFields(embed, 3)
}

const command: Command = {
  id: "nft",
  command: "nft",
  brief: "Check an NFT token info",
  category: "Community",
  run: async function (msg, action) {
    const actionObj = commands[action]
    if (actionObj) {
      return actionObj.run(msg)
    }

    const args = getCommandArguments(msg)
    if (args.length < 3) {
      return { messageOptions: await this.getHelpMessage(msg, action) }
    }

    const [symbol, tokenId] = args.slice(1)
    const embed = await composeNFTDetail(msg, symbol, tokenId)

    return {
      messageOptions: {
        embeds: [embed],
      },
    }
  },
  getHelpMessage: async (msg, action) => {
    const actionObj = commands[action]
    if (actionObj) {
      return actionObj.getHelpMessage(msg)
    }
    return {
      embeds: [
        composeEmbedMessage(msg, {
          usage: `${PREFIX}nft <collection_symbol> <token_id>`,
          examples: `${PREFIX}nft neko 1`,
          footer: [`Type ${PREFIX}help nft <action> for a specific action!`],
        }),
      ],
    }
  },
  canRunWithoutAction: true,
  actions,
  colorType: "Market",
}

export default command
