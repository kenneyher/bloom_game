import kaplay from "kaplay"; // uncomment if you want to use without the k. prefix

kaplay({
  global: true
});

loadRoot("./"); // A good idea for Itch.io publishing later
add([
  rect(100, 200),
  pos(center()),
  color(Color.BLUE)
])

onClick(() => addKaboom(mousePos()));