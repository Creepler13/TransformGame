var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var temp = undefined;
var worldEntitys, gameState, timePassed;
var worldInfo = { maxX: 1000, maxY: 1000 };
var playerView = { maxX: canvas.width / 2, maxY: canvas.height / 2 };
var ai = new Ai();
var keysPressed = [];


startGame();

function startGame() {
    timePassed = 0;
    worldEntitys = [createEntity(100, 100, "player")];
    gameState = true;
    var keys = [];
    for (var k in types) keys.push(k);
    for (let i = 1; i < keys.length; i++) {
        for (let index = 0; index < types[keys[i]].population; index++) {
            randomSpawnEntity(keys[i]);
        }
    }

    setInterval(() => {
        timePassed += 1 / 60;
        if (!gameState) {
            console.log("game end")
            //round ends / game over
            return;
        }

        doKeyStuff();

        worldEntitys[0].update();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let index = 1; index < worldEntitys.length; index++) {
            var e = worldEntitys[index]
            e.update();
            ctx.fillStyle = e.color
            ctx.fillRect(e.x, e.y, e.width, e.height);
        }

        var e = worldEntitys[0];
        ctx.fillStyle = e.color
        ctx.fillRect(e.x, e.y, e.width, e.height);

        ctx.fillStyle = "#000000";
        ctx.font = "20px Arial";
        ctx.fillText(Math.floor(timePassed), 20, 20);

    }, 16.6);
}

document.onkeyup = function KeyEventHandler(e) {
    var code = e.keyCode;
    keysPressed = keysPressed.filter(key => key != code);
}

document.onkeydown = function KeyEventHandler(e) {
    var code = e.keyCode;
    if (!keysPressed.includes(code)) {
        keysPressed.push(code);
    }
}

function doKeyStuff() {
    var addX = 0;
    var addY = 0;
    for (let index = 0; index < keysPressed.length; index++) {

        switch (keysPressed[index]) {
            case 87://w
                if (worldEntitys[0].y > 0) {
                    addY += -worldEntitys[0].movementSpeed;
                }
                break;
            case 65://a
                if (worldEntitys[0].x > 0) {
                    addX += -worldEntitys[0].movementSpeed;
                }
                break;
            case 83://s
                if (worldEntitys[0].y < worldInfo.maxY - worldEntitys[0].height) {
                    addY += worldEntitys[0].movementSpeed;
                }
                break;
            case 68://d
                if (worldEntitys[0].x < worldInfo.maxX - worldEntitys[0].width) {
                    addX += worldEntitys[0].movementSpeed;
                }
                break;
            case 81://q
                if (worldEntitys[0].cooldown <= 0) {
                    worldEntitys[0].doSpecial();
                }
                break;
            case 69://e
                if (worldEntitys[0].type != "player") {
                    var temp = worldEntitys[0].type;
                    console.log(temp)
                    worldEntitys[0] = changeType(worldEntitys[0].x, worldEntitys[0].y, "player");
                    randomSpawnEntity(temp);
                }
                break;
        }
    }
    movePlayer(addX, addY)
}

function movePlayer(addToX, addToY) {
    if (worldEntitys[0].moveCooldown == 0) {
        worldEntitys[0].y += addToY;
        worldEntitys[0].x += addToX;
        worldEntitys[0].moveCooldown = types[worldEntitys[0].type].moveCooldown;
    }
}

function randomSpawnEntity(type) {
    var makeNew = true;
    while (makeNew) {
        makeNew = false;
        var x = Math.floor(Math.random() * Math.floor(worldInfo.maxX));
        var y = Math.floor(Math.random() * Math.floor(worldInfo.maxY));
        var width = types[type].width;
        var height = types[type].height
        if (type == "enemy") {
            var player = worldEntitys[0];
            var dist = Math.sqrt(Math.pow(x + width - (player.x + player.width), 2) + Math.pow(y + height - (player.y + player.height), 2))
            if (dist <= types["enemy"].scareRadius) {
                makeNew = true;
            }
        } else {
            for (let index = 0; index < worldEntitys.length; index++) {
                var e = worldEntitys[index];
                if (x + width > e.x && x < e.x + e.width && y + height > e.y && y < e.y + e.height) {
                    makeNew = true;
                }
            }
        }
    }
    worldEntitys.push(createEntity(x, y, type));
}