import seeds from "./seedInfo"

export default function createHUD () {
  const hud = add([
    fixed(),
    anchor("center"),
    pos(width() - 50, 50)
  ])

  hud.add([
    sprite('seed hud', { frame: 0 }),
    pos(0, 25),
    anchor('center'),
    scale(3)
  ])

  hud.add([
    sprite('seed hud', { frame: 4 }),
    pos(0, 0),
    anchor('center'),
    scale(2),
    "flower"
  ])

  const names = Object.keys(seeds)
  for (let i=0; i<names.length; i++) {
    hud.add([
      sprite('seeds', { anim: names[i] }),
      pos(-100 * (names.length + 1) + 100 * (i+1), 0),
      scale(1),
      anchor('center'),
      "seed",
      names[i]
    ])
  }

  return hud;
}