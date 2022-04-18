import { Command } from "types/common"
import { workInProgress } from "utils/discord-embed"

const command: Command = {
  id: "chat",
  command: "chat",
  name: "Chat",
  category: "Community",
  run: async (msg) => ({ messageOptions: await workInProgress(msg) }),
  getHelpMessage: workInProgress,
  canRunWithoutAction: true,
  experimental: true,
}

export default command
