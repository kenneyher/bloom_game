export default function loader() {
  loadRoot("./src/") // A good idea for Itch.io publishing later
  loadSprite("blady", "sprites/boss1.png", {
    sliceX: 4,
    sliceY: 5,
    anims: {
      idle: { from: 0, to: 3, loop: true, speed: 10 },
      kiss: { from: 4, to: 11 },
      blast: { from: 12, to: 18 },
    },
  })
  loadSprite("player", "sprites/player.png", {
    sliceX: 5,
    sliceY: 4,
    anims: {
      idle: { from: 0, to: 1, loop: true, speed: 8 },
      run: { from: 2, to: 5, loop: true },
      fall: { from: 6, to: 6 },
      hit: { from: 7, to: 10 },
      death: { from: 11, to: 16 },
    },
  })
  loadSprite("map", "sprites/tiles.png", {
    sliceX: 4,
    sliceY: 4,
  })
  loadSprite("bullets", "sprites/bullets.png", {
    sliceX: 4,
    sliceY: 4,
  })
  loadSprite("seed hud", "sprites/flower_hud.png", {
    sliceX: 7,
    sliceY: 1,
  })
  loadSprite("seeds", "sprites/seeds.png", {
    sliceX: 3,
    sliceY: 1,
  })
}
