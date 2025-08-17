export default function loader() {
  loadRoot("./src/") // A good idea for Itch.io publishing later
  loadSprite("blady", "sprites/boss1.png", {
    sliceX: 4,
    sliceY: 6,
    anims: {
      idle: { from: 0, to: 3, loop: true, speed: 10 },
      kiss: { from: 4, to: 11 },
      blast: { from: 12, to: 18 },
      death: 19,
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
    anims: {
      heart: { from: 1, to: 4, loop: true, pingpong: true },
      explode: { from: 5, to: 8 }
    }
  })
  loadSprite("seed hud", "sprites/flower_hud.png", {
    sliceX: 7,
    sliceY: 1,
  })
  loadSprite("seeds", "sprites/seeds.png", {
    sliceX: 3,
    sliceY: 1,
    anims: {
      "rose barrage": 0,
      "burst leaf": 1,
      "bean bombs": 2
    }
  })
  loadSprite("opening", "sprites/logo.png", {
    sliceX: 4,
    sliceY: 4,
    anims: {
      opening: {from: 0, to: 12}
    }
  })
  loadBitmapFont("spacey", "sprites/font.png", 16, 16, {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ "
  })
  loadSprite("keys", "sprites/keyboard.png", {
    sliceX: 12,
    sliceY: 7
  })
  loadSprite("bad_flower", "sprites/bad_flower.png")
}
