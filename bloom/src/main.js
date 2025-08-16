import kaplay from "kaplay"; // uncomment if you want to use without the k. prefix

kaplay({
  global: true, 
  background: "#0a2e44"
});

loadRoot("./src/"); // A good idea for Itch.io publishing later
loadSprite("player","sprites/player.png",
  {
    sliceX:5,
    sliceY:4,
    anims: {
      idle: {from: 0, to: 1, loop : true, speed: 8},
      run: {from: 2, to: 5, loop : true}, 
      fall: {from: 6, to: 6}, 
      hit: {from: 7, to: 10}, 
      death: {from: 11, to: 16}, 
    }
})
loadSprite("map","sprites/tiles.png", {
    sliceX:4,
    sliceY:4,
})

setGravity(900)

const map = addLevel([
  "                 ",
  "                 ",
  "                 ",
  "                 ",
  "                 ",
  "           (-------)  ",
  "    <>           ",
  "    |#           ",
  "====__==================================",
  "________________________________________",
  "________________________________________",
], {
  tileWidth: 32,  
  tileHeight: 32,
  pos: vec2(0, height() /2),
  tiles: {
    "=": () => [
      sprite("map", { frame: 1 }),
      area(),
      scale(2),
      body({ isStatic: true })
    ],
    "_": () => [
      sprite("map", { frame: choose([3, 7, 7, 5, 7]) }),
      scale(2),
    ],
    "<": () => [
      sprite("map", { frame: 0 }),
      area(),
      scale(2),
      body({ isStatic: true })
    ],
    ">": () => [
      sprite("map", { frame: 2 }),
      area(),
      scale(2),
      body({ isStatic: true })
    ],
    "|": () => [
      sprite("map", { frame: 4 }),
      area(),
      scale(2),
      body({ isStatic: true })
    ],
    "#": () => [
      sprite("map", { frame: 6 }),
      area(),
      scale(2),
      body({ isStatic: true })
    ],
    "(": () => [
      sprite("map", { frame: 11 }),
      area({ scale: vec2(1, 0.5) }),
      scale(2),
      // this one is a tag:
      "oneway"
    ],
    "-": () => [
      sprite("map", { frame: 12 }),
      area({ scale: vec2(1, 0.5) }),
      scale(2),
      // this one is a tag:
      "oneway"
    ],
    ")": () => [
      sprite("map", { frame: 13 }),
      area({ scale: vec2(1, 0.5) }),
      scale(2),
      // this one is a tag:
      "oneway"
    ],
  }
})

const player = add([
  sprite("player"),
  pos(center()),
  scale(2),
  area(),
  body(),
  {
    animate: function(){
      let curAnim = this.curAnim()
      if(!this.isGrounded()){
        if(curAnim != "fall"){
          this.play("fall")
        }
      }
      else if (this.running){
        if (curAnim != "run")
          this.play("run")
      }
      else {
        if (curAnim != "idle"){
          this.play("idle")
        }
      }
    },
    speed: 250,
    dropThrough: false,
  }
])

onKeyDown(['left',"right"], ()=> {player.running = true})
onKeyRelease(['left',"right"], ()=> {player.running = false})

onKeyDown("left", ()=> {
  player.move(-player.speed,0)
})

onKeyDown("right", ()=> {
  player.move(player.speed,0)
})

player.onCollide("oneway", (p) => {
  if (player.dropThrough) return;

  if (player.vel.y > 0 && player.pos.y < p.pos.y) {
    p.use("body") 
    player.pos.y = p.pos.y - player.height / 2
    player.vel.y = 0;
  }
})

onKeyPress("space", ()=>{
  if(player.isGrounded()){
    player.jump(400)
  }
})

onKeyDown("down", () => {
  if (player.isGrounded()) {
    player.dropThrough = true
    wait(0.5, () => player.dropThrough = false)
  }
})

onUpdate("oneway", (plat) => {
  const above = player.pos.y < (plat.pos.y + center().y)
  const falling = player.vel.y > 0

  if (above && falling && !player.dropThrough) {
    plat.use(body({ isStatic: true }))
  } else {
    plat.unuse("body")
  }
})

player.onUpdate(()=>{
  player.animate()
})
