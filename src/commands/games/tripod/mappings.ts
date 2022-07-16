import { PieceEnum } from "triple-pod-game-engine"

export const mappings: Record<
  PieceEnum,
  { name: string; noHighlight?: boolean; image: string }
> = {
  [PieceEnum.EMPTY]: {
    name: "Empty",
    image: "empty.png",
  },
  [PieceEnum.GRASS]: {
    name: "Glitteroot Bud",
    image: "glitteroot-bud.png",
  },
  [PieceEnum.BUSH]: {
    name: "Glitteroot Shrub",
    image: "glitteroot-shrub.png",
  },
  [PieceEnum.SUPER_BUSH]: {
    name: "Glitteroot Shrub Enhanced",
    image: "glitteroot-shrub-enhanced.png",
  },
  [PieceEnum.TREE]: {
    name: "Glitteroot",
    image: "glitteroot.png",
  },
  [PieceEnum.SUPER_TREE]: {
    name: "Glitteroot Enhanced",
    image: "glitteroot-enhanced.png",
  },
  [PieceEnum.HUT]: {
    name: "Pod",
    image: "pod.png",
  },
  [PieceEnum.SUPER_HUT]: {
    name: "Pod Enhanced",
    image: "pod-enhanced.png",
  },
  [PieceEnum.HOUSE]: {
    name: "Shelter",
    image: "shelter.png",
  },
  [PieceEnum.SUPER_HOUSE]: {
    name: "Shelter Enhanced",
    image: "shelter-enhanced.png",
  },
  [PieceEnum.MANSION]: {
    name: "Condo",
    image: "condo.png",
  },
  [PieceEnum.SUPER_MANSION]: {
    name: "Condo Enhanced",
    image: "condo-enhanced.png",
  },
  [PieceEnum.CASTLE]: {
    name: "Apartment",
    image: "apartment.png",
  },
  [PieceEnum.SUPER_CASTLE]: {
    name: "Apartment Enhanced",
    image: "apartment-enhanced.png",
  },
  [PieceEnum.FLOATING_CASTLE]: {
    name: "Soaring Tower",
    image: "soaring-tower.png",
  },
  [PieceEnum.SUPER_FLOATING_CASTLE]: {
    name: "Soaring Tower Enhanced",
    image: "soaring-tower-enhanced.png",
  },
  [PieceEnum.TRIPLE_CASTLE]: {
    name: "Galaxy Fortress",
    image: "galaxy-fortress.png",
  },
  [PieceEnum.BEAR]: {
    name: "Droid",
    image: "droid.png",
  },
  [PieceEnum.NINJA_BEAR]: {
    name: "Rocket Droid",
    image: "rocket-droid.png",
  },
  [PieceEnum.TOMB]: {
    name: "Scarlet Shard",
    image: "scarlet-shard.png",
  },
  [PieceEnum.CHURCH]: {
    name: "Energy Stone",
    image: "energy-stone.png",
  },
  [PieceEnum.CATHEDRAL]: {
    name: "Energy Reactor",
    image: "energy-reactor.png",
  },
  [PieceEnum.CRYSTAL]: {
    name: "Mimic Slime",
    image: "mimic-slime.png",
  },
  [PieceEnum.ROCK]: {
    name: "Marble Piece",
    image: "marble-piece.png",
  },
  [PieceEnum.MOUNTAIN]: {
    name: "Marble Chunk",
    image: "marble-chunk.png",
  },
  [PieceEnum.TREASURE]: {
    name: "Loot Chest",
    image: "loot-chest.png",
  },
  [PieceEnum.LARGE_TREASURE]: {
    name: "Cybercore Crate",
    image: "cybercore-crate.png",
  },
  [PieceEnum.ROBOT]: {
    name: "Bomb",
    image: "bomb.png",
  },
  [PieceEnum.AIRDROPPER]: {
    name: "Airdropper",
    image: "airdropper.png",
    noHighlight: true,
  },
  [PieceEnum.REROLL_BOX]: {
    name: "Reroll Box",
    image: "reroll-box.png",
    noHighlight: true,
  },
  [PieceEnum.TELEPORT_PORTAL]: {
    name: "Teleport Portal",
    image: "teleport-portal.png",
    noHighlight: true,
  },
  [PieceEnum.TERRAFORMER]: {
    name: "Terraformer",
    image: "terraformer.png",
    noHighlight: true,
  },
  [PieceEnum.MEGA_BOMB]: {
    name: "Mega Bomb",
    image: "mega-bomb.png",
    noHighlight: true,
  },
  [PieceEnum.BOMB]: {
    name: "Mini Bomb",
    image: "mini-bomb.png",
    noHighlight: true,
  },
}
