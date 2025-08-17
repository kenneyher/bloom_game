// health_hub.js
export function createHealthHUD(hp) {
  const hud = add([
    fixed(),
    z(100),
  ])

  const maxLives = hp
  const rectWidth = 30
  const rectHeight = 10
  const spacing = 10
  const startPos = vec2(20, 20)

  for (let i = 0; i < maxLives; i++) {
    const heart = hud.add([
      rect(rectWidth, rectHeight),
      color(255, 0, 0),
      pos(startPos.x + i * (rectWidth + spacing), startPos.y),
      "hp"
    ])
  }

  return hud
}
