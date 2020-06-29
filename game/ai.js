class Ai {
    constructor() {
        this.getPos = (e) => {
            switch (types[e.type].scared) {
                case true:
                    return normalEntity(e);
                case false:
                    var temp = normalEntity(e)
                    return [temp[0] * -1, temp[1] * -1]
                default:
                    return [0, 0]
            }
        }

        function normalEntity(e) {
            var player = worldEntitys[0];
            if (player.type == "player" || !e.scared) {
                var dist = Math.sqrt(Math.pow(e.x + e.width / 2 - (player.x + player.width / 2), 2) + Math.pow(e.y + e.height / 2 - (player.y + player.height / 2), 2))
                var addX = 0;
                var addY = 0;
                if (dist <= types[e.type].scareRadius) {

                    var xDist = player.x + player.width / 2 - (e.x + e.width / 2)
                    var yDist = player.y + player.height / 2 - (e.y + e.height / 2)

                    if (scareLines) {
                        lineTo(player.x + player.width / 2, player.y + player.height / 2, e.x + e.width / 2, e.y + e.height / 2)
                    }

                    if (xDist > e.height / 2 - 1) {
                        addX = e.movementSpeed * -1;
                    }
                    if (xDist < player.height / 2 * -1 + 1) {
                        addX = e.movementSpeed;
                    }
                    if (yDist > e.height / 2 - 1) {
                        addY = e.movementSpeed * -1;
                    }
                    if (yDist < player.height / 2 * -1 + 1) {
                        addY = e.movementSpeed;
                    }

                    if (e.y + addY < 0) { addY = -1; };
                    if (e.y + addY > worldInfo.maxY - e.height) { addY = 1; }
                    if (e.x + addX < 0) { addX = -1; };
                    if (e.x + addX > worldInfo.maxX - e.height) { addX = 1; }
                    var addSave = [addX, addY];
                    if (!e.scared) return addSave
                    for (let index = 0; index < 6; index++) {
                        var temp = true;
                        if (index == 1) {
                            addX = 0;
                        }
                        if (index == 2) {
                            addY = 0;
                        }
                        if (index == 3) {
                            addX = addSave[0] * -1;
                        }
                        if (index == 4) {
                            addY = addSave[1];
                        }
                        if (index == 5) {
                            s
                            addY = addSave[1] * -1;
                        }
                        if (index == 6) {
                            addX = addSave[0];
                        }

                        var tempEntitys = worldEntitys.filter(key => key != e);
                        for (let index = 1; index < tempEntitys.length; index++) {
                            var en = tempEntitys[index];
                            if (e.x + addX + e.width > en.x && addX + e.x < en.x + en.width && addY + e.y + e.height > en.y && addY + e.y < en.y + en.height) {
                                temp = false;
                                break;
                            }
                        }
                        if (temp) {
                            return [addX, addY]
                        }
                    }

                    return [0, 0]
                } else {
                    return [0, 0];
                }
            } else {
                return [0, 0]
            }
        }
    }
}

function lineTo(x, y, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = "red";
    ctx.stroke();
}