function BLady() {
  const boss = add([
    sprite("blady", { anim: 'idle' }),
    area(),
    body(),
    scale(3),
    pos(width() - 400, 200),
    "boss",
    "lady"
  ])

  return boss
}

export { BLady }