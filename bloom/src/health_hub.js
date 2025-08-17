// health_hub.js
export function createHealthHUD(hp) {
  const hud = add([
    fixed(),
    z(100),
  ])

  const maxLives = hp
  const rectWidth = 16
  const rectHeight = 16
  const spacing = 10
  const startPos = vec2(20, 20)

  for (let i = 0; i < maxLives; i++) {
    const heart = hud.add([
      sprite("bullets", {frame: 1}),
      scale(2),
      pos(startPos.x + i * (rectWidth + spacing), startPos.y),
      "hp"
    ])
  }

  return hud
}
