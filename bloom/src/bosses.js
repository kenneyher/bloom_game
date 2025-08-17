function BLady(p, player) {
  const boss = add([
    sprite("blady", { anim: "idle" }),
    area({ scale: vec2(0.5, 0.8) }),
    body(),
    anchor("bot"),
    health(500),
    pos(p),
    state("wait", ["wait", "kiss", "blast", "death"]),
    "boss",
    "lady",
    {
      bulletTimer: 0.5,
      bulletSpread: 5
    }
  ])

  boss.onStateEnter("kiss", () => {
    boss.play("kiss", {
      onEnd: () => {
        boss.enterState("wait", rand(2, 5))
      },
    })
  })

  boss.onStateEnter("death", () => {
    boss.play("death")
    wait(1, () => go('title'))
  })

  boss.onStateEnter("wait", (time = 2) => {
    boss.play("idle")
    wait(time, () => boss.enterState(choose(["blast", "kiss", "wait"])))
  })

  function createThorns(p, count = 15) {
    debug.log(count)
    for (let i = 0; i < count; i++) {
      const target = vec2(
        rand(player.pos.x - 200, player.pos.x + 200),
        player.pos.y + rand(-100, 100)
      )

      const dir = target.sub(p).unit()

      add([
        sprite("bullets", { frame: 9 }),
        pos(p),
        area(),
        scale(0.5),
        move(dir, 150),
        rotate(dir.angle() + 180),
        offscreen({ destroy: true }),
        "danger",
      ])
    }
  }

  boss.onStateUpdate("kiss", () => {
    if (boss.frame == 8 && get("kiss").length < 1) {
      add([
        sprite("bullets", { anim: "heart" }),
        pos(boss.pos.sub(25, 100)),
        move(LEFT, 100),
        "kiss",
      ])
    }
  })
  onUpdate("kiss", (kiss) => {
    if (!kiss.exploded && kiss.pos.x <= player.pos.x) {
      kiss.exploded = true // <-- custom flag
      kiss.unuse("move")
      createThorns(kiss.pos, 3 * boss.bulletSpread)
      kiss.play("explode", {
        onEnd: () => kiss.destroy(),
      })
    }
  })

  function spawnBullet(origin) {
    // choose a random angle within ±45° of the player
    const target = vec2(
      player.pos.x,
      rand(player.pos.y - 100, player.pos.y + 100)
    )

    const dir = target.sub(origin).unit()

    const bullet = add([
      sprite("bullets", { frame: 9 }),
      pos(origin),
      area(),
      rotate(dir.angle() + 180), // make sprite face dir
      move(dir, 200),
      scale(0.5),
      offscreen({ destroy: true }),
      "danger",
    ])
  }

  boss.onStateEnter("blast", () => {
    boss.play("blast")
  })

  boss.onStateUpdate("blast", () => {
    // Stop animation at frame 15
    if (boss.frame === 15 && !boss.spawning) {
      boss.stop() // freeze on frame 15
      boss.spawning = true // custom flag

      // spawn bullets in intervals
      boss.spawnTimer = loop(boss.bulletTimer, () => {
        spawnBullet(boss.pos.add(0, -120)) // custom function
      })

      // end phase after X seconds
      wait(randi(3, 6), () => {
        if (boss.exists()) {
          boss.spawnTimer.cancel()
          boss.spawning = false
          boss.play("blast") // resume animation
          boss.enterState("wait", rand(2, 4))
        }
      })
    }
  })

  boss.onUpdate(() => {
    if (boss.hp <= 250) {
      boss.bulletTimer = 0.15
      boss.bulletSpread = 10
    }
    if (boss.hp <= 0) {
      boss.enterState("death")
      debug.log (boss.hp)
    }
  })

  return boss
}

export { BLady }
