import kaplay from "kaplay" // uncomment if you want to use without the k. prefi
import loader from "./loader"
import createHUD from "./seed_hud"
import { BLady } from "./bosses"
import { createHealthHUD } from "./health_hub.js"
import seeds from "./seedInfo.js"

kaplay({
  global: true,
  background: "#0a2e44",
  font: "spacey",
})

loader()

const BURST_SHOTS = 3
const SHOT_DELAY_RANGE = [0.15, 1.25] // delay between shots in a burst
const LONG_COOLDOWN_RANGE = [6, 10] // "great amount of time"
const SPREAD_DEG = 20 // small aim jitter so it’s not laser-accurate

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
      lifespan(0.25),
      move(Vec2.fromAngle(angleOffset), 500), // direction based on angle
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
  const baseSpeed = 100 // horizontal velocity
  const baseJump = -300 // initial upward push
  const gravity = 800 // pull down
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

function spawnShooter(p) {
  return [
    sprite("bad_flower"),
    pos(p),
    area(),
    anchor("center"),
    "shooters",
    {
      state: "cooldown", // "cooldown" | "burst"
      cooldown: rand(...LONG_COOLDOWN_RANGE) * rand(0.4, 1.2), // desync start
      shotTimer: 0,
      shotsLeft: 0,
    },
  ]
}

function spawnBulletTowardPlayer(origin, player) {
  if (!player || !player.exists()) return

  const toPlayer = player.pos.sub(origin)
  const baseAngle = toPlayer.unit().angle()
  const finalAngle = baseAngle + rand(-SPREAD_DEG, SPREAD_DEG)
  const dir = vec2(1, 0).rotate(finalAngle)

  add([
    sprite("bullets", { frame: 9 }),
    pos(origin),
    area(),
    scale(0.5),
    move(dir, 150),
    rotate(finalAngle + 180), // adjust if your sprite faces left by default
    offscreen({ destroy: true }),
    "danger",
  ])
}

scene("title", () => {
  let zoom = width() / (16 * 40)
  function updateCameraZoom() {
    zoom = width() / (16 * 40)
    camScale(vec2(zoom)) // set camera zoom

    const worldHeight = height() / zoom

    // Move camera so that (0,0) in world space == top-left of the screen
    camPos(vec2(width() / (2 * zoom) + 16, worldHeight / 2))
  }

  // run once on load
  updateCameraZoom()

  // re-run on window resize
  onResize(updateCameraZoom)

  function spawnStars() {
    let size = randi(5, 16)
    let p = vec2(rand(0, width() / zoom), rand(0, height() / zoom))
    let lifetime = randi(1, 5)

    add([
      rect(size, size),
      color("fcffcc"),
      pos(p),
      rotate(0),
      scale(0.1),
      {
        time: 0,
        lifetime: lifetime,
      },
      "star",
    ])

    wait(rand(0.1, 1), spawnStars)
  }

  onUpdate("star", (star) => {
    star.time += dt()
    star.angle += dt() * 10
    const halfLife = star.lifetime - star.lifetime / 3

    if (star.time < halfLife) {
      // grow from 1 → 1.5
      const t = star.time / halfLife
      star.scale = vec2(0.1 + 0.5 * t)
    } else if (star.time < star.lifetime) {
      // shrink from 1.5 → 0
      const t = (star.time - halfLife) / halfLife
      star.scale = vec2(0.5 * (1 - t))
    } else {
      // remove when finished
      star.destroy()
    }
  })

  spawnStars()

  const title = add([
    sprite("opening", { anim: "opening" }),
    anchor("center"),
    scale(2),
    pos(camPos().x, camPos().y - 50), // screen center
  ])

  add([
    text("PRESS SPACE TO START", {
      size: 12,
      letterSpacing: 5,
    }),
    anchor("center"),
    pos(camPos().x, camPos().y + 100),
  ])
  add([
    text("PRESS H TO LEARN HOW TO PLAY ", {
      size: 12,
      letterSpacing: 5,
    }),
    anchor("center"),
    pos(camPos().x, camPos().y + 125),
  ])

  onKeyPress("space", () => {
    go("play")
  })
  onKeyPress("h", () => {
    go("howto")
  })
})

scene("howto", () => {
  let zoom = width() / (16 * 40)
  function updateCameraZoom() {
    zoom = width() / (16 * 40)
    camScale(vec2(zoom)) // set camera zoom

    const worldHeight = height() / zoom

    // Move camera so that (0,0) in world space == top-left of the screen
    camPos(vec2(width() / (2 * zoom) + 16, worldHeight / 2))
  }

  // run once on load
  updateCameraZoom()

  // re-run on window resize
  onResize(updateCameraZoom)

  const msgs = [
    "MOVE THE CHARACTER WITH THE ARROW KEYS, JUMP WITH SPACE. YOUR CHARACTER SHOOTS AUTOMATICALLY.",
    "YOUR CHARACTER CAN PLANT SEEDS. USE Q TO PLANT A SEED AND WATCH IT GROW ON THE LEFT SIDE OF THE SCREEN. ONCE THE SEED HAS BLOOMED, USE Q AGAIN TO TRIGGER THE SPECIAL ABILITY OF THE SEED.",
    "EACH SEED TRIGGERS A DIFFERENT ATTACK. THE ROSE SHOOTS SEVERAL THORNS THAT DEAL LOW DAMAGE\nTHE BURST LEAF TRIGGERS A SHOTGUN LIKE BLAST\nTHE BEAN BOMBS DEAL HIGH DAMAGE IN A SHORT RANGE",
    "YOU CANT USE A SEED UNTIL ITS FLOWER HAS BLOOMED. YOU CANT PLANT ANOTHER SEED UNTIL YOU HAVE USED THE CURRENT ONE",
  ]
  const imgs = [
    { sprite: "player", frame: null, anim: "run" },
    { sprite: "seed hud", frame: 6, anim: "run"  },
    { sprite: "seeds", frame: 0, anim: "run"  },
    { sprite: "seeds", frame: 1, anim: "run"  },
  ]

  for (let i=0; i<msgs.length; i++) {
    add([
      text(msgs[i], { size: 10, lineSpacing: 5,  width: width() / (2 * zoom) }),
      pos(200, 25 + (120 * i))
    ])

    if (i == 0) {
      add([
        sprite(imgs[i].sprite, { anim: imgs[i].anim }),
        pos(100, 25 + (120 * i))
      ])
    } else {
      add([
        sprite(imgs[i].sprite, { frame: imgs[i].frame }),
        pos(100, 25 + (120 * i))
      ])
    }
  }

  add([
      text("PRESS SPACE TO GO BACK", { size: 10, lineSpacing: 5,  width: width() / (2 * zoom) }),
      pos(10, 10)
    ])

    onKeyPress("space", () => go("title"))
})

scene("play", () => {
  const TILE_SIZE = 16
  const TILES_X = 40 // how many tiles across you want visible

  camPos(vec2(0, 0))
  const hud = createHUD()
  const seedAtks = {
    "rose barrage": () => machineGun(player, 1),
    "burst leaf": () => shotgunBlast(player.pos.add(10, -15), 1),
    "bean bombs": () => rubberShot(player.pos.add(10, -15)),
  }

  setGravity(900)
  const map = addLevel(
    [
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#                                        |",
      "#     (---)                              |",
      "#                 <>                     |",
      "#             <===_#     f          B    |",
      "#             [....]    ()               |",
      "#                                        |",
      "#         (-)                            |",
      "#    @                                   |",
      "#                          f             |",
      "#         (-)       (-------)            |",
      "#    <>                                  |",
      "#    |#                      f           |",
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
            scale: 0.5,
          }),
          anchor("bot"),
          body(),
          health(3),
          "player",
          {
            animate: function () {
              let curAnim = this.curAnim()
              if (this.hp < 1) {
                if (curAnim != "death") {
                  this.play("death")
                }
              } else if (!this.isGrounded()) {
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
        f: () => spawnShooter(),
        B: () => ["boss spawn"],
        "=": () => [
          sprite("map", { frame: 1 }),
          area(),
          body({ isStatic: true }),
          "wall",
        ],
        "[": () => [
          sprite("map", { frame: 8 }),
          area(),
          body({ isStatic: true }),
          "wall",
        ],
        "]": () => [
          sprite("map", { frame: 10 }),
          area(),
          body({ isStatic: true }),
          "wall",
        ],
        ".": () => [
          sprite("map", { frame: 9 }),
          area(),
          body({ isStatic: true }),
          "wall",
        ],
        _: () => [sprite("map", { frame: choose([3, 7, 7, 5, 7]) })],
        "<": () => [
          sprite("map", { frame: 0 }),
          area(),
          body({ isStatic: true }),
          "wall",
        ],
        ">": () => [
          sprite("map", { frame: 2 }),
          area(),
          body({ isStatic: true }),
          "wall",
        ],
        "|": () => [
          sprite("map", { frame: 4 }),
          area(),
          body({ isStatic: true }),
          "wall",
        ],
        "#": () => [
          sprite("map", { frame: 6 }),
          area(),
          body({ isStatic: true }),
          "wall",
        ],
        "(": () => [
          sprite("map", { frame: 11 }),
          area({ scale: vec2(1, 0.5) }),
          body({ isStatic: true }),
          platformEffector(),
        ],
        "-": () => [
          sprite("map", { frame: 12 }),
          area({ scale: vec2(1, 0.5) }),
          body({ isStatic: true }),
          platformEffector(),
        ],
        ")": () => [
          sprite("map", { frame: 13 }),
          area({ scale: vec2(1, 0.5) }),
          body({ isStatic: true }),
          platformEffector(),
        ],
      },
    }
  )

  const player = map.get("player")[0]
  const boss = BLady(map.get("boss spawn")[0].pos, player)

  let healthHub = createHealthHUD(player.hp)

  onKeyDown(["left", "right"], () => {
    player.running = true
  })
  onKeyRelease(["left", "right"], () => {
    player.running = false
  })

  onKeyDown("left", () => {
    if (player.hp >= 1) {
      player.move(-player.speed, 0)
    }
  })

  onKeyDown("right", () => {
    if (player.hp >= 1) {
      player.move(player.speed, 0)
    }
  })

  player.onCollide("danger", (d) => {
    if (player.invincible) return
    else {
      player.hp--
      d.destroy()
    }
  })

  player.on("hurt", () => {
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
    if (player.hp >= 1) {
      if (player.isGrounded()) {
        player.jump(325)
      }
    }
  })

  onKeyDown("down", () => {
    const p = player.curPlatform()
    if (p != null && p.has("platformEffector")) {
      p.platformIgnore.add(player)
    }
  })

  onKeyPress("q", () => {
    if (player.hp >= 1) {
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
    }
  })

  onCollide("bullet", "boss", (b, bo) => {
    bo.hp--
    b.destroy()
  })
  onCollide("danger", "wall", (b, w) => {
    b.destroy()
  })
  onCollide("bullet", "wall", (b, w) => {
    b.destroy()
  })
  onCollide("big bullet", "wall", (bb, w) => {
    bb.destroy()
  })

  onCollide("big bullet", "boss", (b, bo) => {
    b.destroy()
    bo.hp--
  })

  onUpdate("seed", (s) => {
    if (s.is(player.seed)) {
      s.scale = vec2(2, 2)
    } else {
      s.scale = vec2(1, 1)
    }
  })

  onUpdate("shooters", (s) => {
    if (!s.exists()) return

    if (s.state === "cooldown") {
      s.cooldown -= dt()
      if (s.cooldown <= 0) {
        s.state = "burst"
        s.shotsLeft = BURST_SHOTS
        s.shotTimer = 0 // fire immediately
      }
      return
    }

    if (s.state === "burst") {
      s.shotTimer -= dt()
      if (s.shotTimer <= 0) {
        // Fire one shot
        spawnBulletTowardPlayer(s.pos, player)

        s.shotsLeft -= 1
        if (s.shotsLeft > 0) {
          // Schedule next shot in the burst (randomized)
          s.shotTimer = rand(...SHOT_DELAY_RANGE)
        } else {
          // Burst finished → long cooldown
          s.state = "cooldown"
          s.cooldown = rand(...LONG_COOLDOWN_RANGE)
        }
      }
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

  player.onHurt(() => {
    if (player.invincible || player.hp <= 0) return

    player.invincible = true

    // Visual: blink by toggling visibility
    let blinkLoop = loop(0.08, () => {
      player.hidden = !player.hidden
    })

    // End i-frames after duration
    wait(1.5, () => {
      player.invincible = false
      if (blinkLoop) {
        blinkLoop.cancel()
        blinkLoop = null
      }
      player.hidden = false
    })
  })

  player.onDeath(() => {
    if (player.curAnim() != "death") {
      player.play("death")
      wait(1.5, () => go("title"))
    }
  })

  player.onUpdate(() => {
    if (player.hp >= 1 && player.curAnim() != "death") {
      player.animate()
    }

    if (player.hp >= 1) {
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
    camPos(vec2(width() / (2 * zoom) + TILE_SIZE, mapHeight - worldHeight / 2))
  }

  // run once on load
  updateCameraZoom()

  // re-run on window resize
  onResize(updateCameraZoom)
})

// Health of player :d

go("title")
