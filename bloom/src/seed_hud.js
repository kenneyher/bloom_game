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

  const seeds = ['machinegun', 'shotgun', 'rubbershot' ]
  for (let i=0; i<3; i++) {
    hud.add([
      sprite('seeds', { frame: i }),
      pos(-400 + 100 * (i+1), 20),
      scale(1),
      anchor('center'),
      "seed",
      seeds[i]
    ])
  }

  return hud;
}