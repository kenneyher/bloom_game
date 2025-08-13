import kaplay from "kaplay"; // uncomment if you want to use without the k. prefix

kaplay({
  global: true, 
  background: [236,236,236]
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

setGravity(300)

const map = addLevel([
  "                 ",
  "                 ",
  "                 ",
  "                 ",
  "                 ",
  "                 ",
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
    speed: 100
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

onKeyPress("space", ()=>{
  if(player.isGrounded()){
    player.jump(300)
  }
})

player.onUpdate(()=>{
  player.animate()
})

onClick(() => addKaboom(mousePos()));