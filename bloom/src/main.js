import kaplay from "kaplay" // uncomment if you want to use without the k. prefi
import loader from "./loader"
import createHUD from "./seed_hud"
import { BLady } from "./bosses"
import { createHealthHUD } from "./health_hub.js" 
import seeds from "./seedInfo.js"

kaplay({
  global: true,
  background: "#0a2e44",
})

loader()

function shotgunBlast(p, dir = 1) {
  const spread = deg2rad(300) // spread angle in radians
  const pellets = 5 // number of bullets

  for (let i = 0; i < pellets; i++) {
    const angleOffset = spread * (i - (pellets - 1) / 2)
    add([
      sprite("bullets", { frame: 11 }),
      pos(p),
      area(),
      scale(0.5),
      opacity(),
      lifespan(0.5),
      move(Vec2.fromAngle(angleOffset), 600), // direction based on angle
      "big bullet",
      { t: 0 },
    ])
  }
}


function machineGun(p, dir = 1, bullets = 10) {
  add([
    sprite("bullets", { frame: 12 }),
    pos(p.pos.add(10, -15)),
    area(),
    scale(0.5),
    opacity(),
    offscreen(),
    move(vec2(dir, 0), 800),
    "big bullet",
    { t: 0 },
  ])

  if (bullets == 0) {
    return
  }

  wait(0.1, () => machineGun(p, dir, bullets - 1))
}

function rubberShot(p) {
  const baseSpeed = 250 // horizontal velocity
  const baseJump = -400 // initial upward push
  const gravity = 900 // pull down
  const bullets = 3

  for (let i = 0; i < bullets; i++) {
    const bullet = add([
      sprite("bullets", { frame: 13 }),
      pos(p),
      area(),
      "big bullet",
      {
        vel: vec2(baseSpeed + i * 100, baseJump + i * 100), // custom velocity
        t: 0,
      },
    ])

    bullet.onUpdate(() => {
      // apply motion
      bullet.pos = bullet.pos.add(bullet.vel.scale(dt()))

      // gravity
      bullet.vel.y += gravity * dt()

      // destroy if offscreen
      if (
        bullet.pos.x > width() ||
        bullet.pos.y > height() ||
        bullet.pos.x < 0
      ) {
        destroy(bullet)
      }
    })
  }
}

scene("play", () => {
  const TILE_SIZE = 16
  const TILES_X = 40 // how many tiles across you want visible

  camPos(vec2(0, 0))
  const hud = createHUD()
  const seedAtks = {
    "rose barrage": () => machineGun(player, 1),
    "burst leaf": () => shotgunBlast(player.pos.add(10, -15), 1),
    "bean bombs": () => rubberShot(player.pos.add(10, -15))
  }

  setGravity(900)
  const map = addLevel(
    [
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#                              B         |",
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#    @                                   |",
      "#                                        |",
      "#           (-------)                    |",
      "#    <>                                  |",
      "#    |#                                  |",
      "#====__==================================|",
      "_________________________________________|",
      "_________________________________________|",
      "_________________________________________|",
    ],
    {
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      tiles: {
        "@": () => [
          sprite("player"),
          area({
            scale: 0.5
          }),
          anchor('bot'),
          body(),
          health(3),
          "player",
          {
            animate: function () {
              let curAnim = this.curAnim()
              if (!this.isGrounded()) {
                if (curAnim != "fall") {
                  this.play("fall")
                }
              } else if (this.running) {
                if (curAnim != "run") this.play("run")
              } else {
                if (curAnim != "idle") {
                  this.play("idle")
                }
              }
            },
            speed: 150,
            dropThrough: false,
            atkCD: 0.5,
            cd: 0,
            shooting: false,
            seed: Object.keys(seeds)[0],
            growing: false,
            bloom: false,
            seedCD: 0,
          },
        ],
        "B": () => ["boss spawn"],
        "=": () => [
          sprite("map", { frame: 1 }),
          area(),
          body({ isStatic: true }),
        ],
        _: () => [sprite("map", { frame: choose([3, 7, 7, 5, 7]) })],
        "<": () => [
          sprite("map", { frame: 0 }),
          area(),
          body({ isStatic: true }),
        ],
        ">": () => [
          sprite("map", { frame: 2 }),
          area(),
          body({ isStatic: true }),
        ],
        "|": () => [
          sprite("map", { frame: 4 }),
          area(),
          body({ isStatic: true }),
        ],
        "#": () => [
          sprite("map", { frame: 6 }),
          area(),
          body({ isStatic: true }),
        ],
        "(": () => [
          sprite("map", { frame: 11 }),
          area({ scale: vec2(1, 0.5) }),
          // this one is a tag:
          "oneway",
        ],
        "-": () => [
          sprite("map", { frame: 12 }),
          area({ scale: vec2(1, 0.5) }),
          // this one is a tag:
          "oneway",
        ],
        ")": () => [
          sprite("map", { frame: 13 }),
          area({ scale: vec2(1, 0.5) }),
          // this one is a tag:
          "oneway",
        ],
      },
    }
  )

  
  const player = map.get("player")[0]
  const boss = BLady(map.get("boss spawn")[0].pos, player)

  let healthHub = createHealthHUD(player.hp())

  onKeyDown(["left", "right"], () => {
    player.running = true
  })
  onKeyRelease(["left", "right"], () => {
    player.running = false
  })

  onKeyDown("left", () => {
    player.move(-player.speed, 0)
  })

  onKeyDown("right", () => {
    player.move(player.speed, 0)
  })

  player.onCollide("oneway", (p) => {
    if (player.dropThrough) return

    if (player.vel.y > 0 && player.pos.y < p.pos.y) {
      p.use("body")
      player.pos.y = p.pos.y - player.height / 2
      player.vel.y = 0
    }
  })

  player.onCollide("danger", (d) =>{
    player.hurt(1)
    d.destroy()
  })

  player.on("hurt", ()=> {
    const hearts = healthHub.get("hp")
    if (hearts.length > 0) {
      hearts[hearts.length - 1].destroy()
    }
  })

  const switches = ["1", "2", "3"]
  switches.forEach((key) => {
    onKeyPress(key, () => {
      if (!player.growing) {
        player.seed = Object.keys(seeds)[Number(key - 1)]
      }
    })
  })

  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(400)
    }
  })

  onKeyDown("down", () => {
    if (player.isGrounded()) {
      player.dropThrough = true
      wait(0.5, () => (player.dropThrough = false))
    }
  })

  onKeyPress("q", () => {
    if (!player.growing) {
      player.growing = true
    } else {
      if (player.bloom) {
        seedAtks[player.seed]()
        player.seedCD = 0
        player.bloom = false
        player.growing = false
      }
    }
  })

  onCollide("bullet", "boss", (b, bo) => {
    b.destroy()
  })

  onCollide("big bullet", "boss", (b, bo) => {
    b.destroy()
    bo.hurt(seeds[player.seed].dmg)
  })

  onUpdate("oneway", (plat) => {
    const above = player.pos.y <= plat.pos.y + center().y
    const falling = player.vel.y > 0

    if (above && falling && !player.dropThrough) {
      plat.use(body({ isStatic: true }))
    } else {
      plat.unuse("body")
    }
  })

  onUpdate("bullet", (b) => {
    b.t += dt() * 5 // speed of breathing (adjust multiplier)
    const s = 0.5 + 0.2 * Math.sin(b.t)
    // ↑ oscillates between 0.8x and 1.2x original size
    // b.scale = vec2(s)
  })

  onUpdate("seed", (s) => {
    if (s.is(player.seed)) {
      s.scale = vec2(2, 2)
    } else {
      s.scale = vec2(1, 1)
    }
  })

  onUpdate("flower", (f) => {
    if (player.growing) {
      f.hidden = false
      const progress = player.seedCD / seeds[player.seed].cd
      const frameRange = 6 - 1
      const idx = 1 + Math.floor(progress * frameRange)
      f.frame = idx
    } else {
      f.hidden = true
    }
  })

  player.onUpdate(() => {
    player.animate()

    player.cd += dt()
    if (player.cd > player.atkCD) {
      player.cd = 0
      add([
        sprite("bullets", { frame: 0 }),
        move(RIGHT, 250),
        scale(0.5),
        area(),
        opacity(),
        anchor("center"),
        pos(player.pos.add(10, -15)),
        offscreen({ destroy: true }),
        lifespan(2),
        "bullet",
        {
          t: 0,
          dmg: 1,
        },
      ])
    }

    if (player.growing && !player.bloom) {
      player.seedCD += dt()

      if (player.seedCD >= seeds[player.seed].cd) {
        player.bloom = true
      }
    }
  })

  const mapHeight = map.levelHeight()
  function updateCameraZoom() {
    const zoom = width() / (TILE_SIZE * TILES_X)
    camScale(vec2(zoom)) // set camera zoom

    const worldHeight = height() / zoom

    // Move camera so that (0,0) in world space == top-left of the screen
    camPos(
      vec2(
        width() / (2 * zoom) + TILE_SIZE, 
        mapHeight - worldHeight / 2
      )
    )
  }

  // run once on load
  updateCameraZoom()

  // re-run on window resize
  onResize(updateCameraZoom)
})

// Health of player :d



go("play")
