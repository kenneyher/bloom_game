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

setGravity(10)

const player = add([
  sprite("player"),
  pos(center()),
  scale(2),
  body(),
  {
    animate: function(){
      let curAnim = this.curAnim()
      if (this.running){
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

player.onUpdate(()=>{
  player.animate()
})

onClick(() => addKaboom(mousePos()));