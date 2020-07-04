var canvas = document.getElementById("canvas");
var types;
var ctx = canvas.getContext("2d");
var temp = undefined;
var worldEntitys, gameState, timePassed;
var worldInfo = { maxX: 1000, maxY: 1000 };
var playerView = { maxX: canvas.width / 2, maxY: canvas.height / 2 };
var keysPressed = [];
var random = 70;
var reviseIndex = -1;
var GameLoop;
var scareLines = false;
var drawScreen = true;
var run = 0;
var training = 0;
var keyToIndex = [87, 65, 83, 68, ""]
var output = keyToIndex.length;
var input = (3 + 5 + 2 + 1) * 2 + 1 + 1;
var reward;
var tf = require("@tensorflow/tfjs-node-gpu");
var learning_rate = 0.005;
var points;
var memory = [];
var rewardScaler = 250;
var model;
var maxMemory = 300;
var loadModel = true;
var tempRewardSave = 0;
var maxTimeToContiune = 13;
var scareConnections = 0;
var distReward = 0;
var RandomMaxMax = 7 / 8;
var maxRandom = 300;

var rewardTable = {
    death: -10,
    missile: 0,
    enemy: 0,
    idle: 0
}
var rewardKeys = []
for (k in rewardTable) rewardKeys.push(k);
rewardKeys = rewardKeys.filter(e => e != "idle");





class Entity {

    constructor(x, y, type, color, width, height, movementSpeed, cooldown, special, moveCooldown, updateOnUpdate) {

        this.x = x;
        this.y = y;
        this.type = type;
        this.color = color;
        this.isPlayer = false;
        this.height = height;
        this.width = width;
        this.movementSpeed = movementSpeed;
        this.cooldown = cooldown;
        this.moveCooldown = moveCooldown;

        this.update = () => {
            this.reduceCooldown();
            if (!this.isPlayer) {
                this.move();
            } else if (this.type == "player") {
                this.checkTouch();
            }
            this.updateOnUpdate(this);
        }

        this.updateOnUpdate = updateOnUpdate;

        this.move = () => {
            if (this.moveCooldown == 0) {
                var newCords = getPos(this);
                if (newCords[0] != 0 && newCords[1] != 0) {
                    this.moveCooldown = types[this.type].moveCooldown;
                }
                this.x = this.x + newCords[0];
                this.y = this.y + newCords[1];
            }
        }

        this.reduceCooldown = () => {
            if (this.cooldown != 0) {
                this.cooldown--;
            }
            if (this.moveCooldown > 0) {
                this.moveCooldown--;
            }
        }

        this.checkTouch = () => {
            for (let index = 1; index < worldEntitys.length; index++) {
                var e = worldEntitys[index];
                if (types[e.type].canTransform == false) continue;
                if (this.x + this.width > e.x && this.x < e.x + e.width && this.y + this.height > e.y && this.y < e.y + e.height) {
                    worldEntitys[0] = changeType(e.x, e.y, e.type);
                    worldEntitys = worldEntitys.filter(key => key != e);
                }
            }
        }

        this.doSpecial = () => { special(); this.cooldown = types[this.type].cooldown };

        this.special = special
    }
}

types = {
    "player": {
        "color": "#000000",
        "width": 20,
        "height": 20,
        "movementSpeed": 2,
        "cooldown": 100,
        "canTransform": true,
        "moveCooldown": 0,
        "special": () => {
            console.log("player");
        }, updateOnUpdate: (en) => { }
    },
    "enemy": {
        color: "#e50000",
        "population": 3,
        "width": 20,
        "height": 20,
        "movementSpeed": 1,
        "spawnPosCheck": (x, y, width, height) => {
            var player = worldEntitys[
                0
            ];
            var dist = Math.sqrt(Math.pow(x + width - (player.x + player.width),
                2) + Math.pow(y + height - (player.y + player.height),
                    2));
            if (dist <= types[
                "enemy"
            ].scareRadius) {
                return [
                    true, x, y
                ];
            }
            return [
                false, x, y
            ];
        }, "cooldown": 10,
        "moveCooldown": 0,
        "canTransform": false,
        "scared": false,
        "scareRadius": 250,
        "special": () => { },
        "updateOnUpdate": (en) => {
            var entityts = worldEntitys.filter(key => key != en);
            for (let index = 0; index < entityts.length; index++) {
                var e = entityts[index
                ];
                if (en.x + en.width > e.x && en.x < e.x + e.width && en.y + en.height > e.y && en.y < e.y + e.height) {
                    if (index == 0) {
                        death();
                    } else if (!types[e.type
                    ].scared) {
                        worldEntitys = worldEntitys.filter(key => key != e);
                        worldEntitys = worldEntitys.filter(key => key != en);
                        randomSpawnEntity(e.type);
                        randomSpawnEntity(en.type);
                        reward = rewardTable[e.type
                        ] + rewardTable[en.type
                            ];
                        return;
                    }
                }
            }
        }
    },
    "missile": {
        "color": "#ff00ff",
        "population": 2,
        "width": 6,
        "height": 6,
        "movementSpeed": 1.5,
        "cooldown": 10,
        "spawnPosCheck": (x, y, width, height) => {
            if (x == 1 || x == worldInfo.maxX - width - 1 || y == 1 || y == worldInfo.maxY - height - 1) {
                return [
                    false, x, y
                ]
            } else {
                switch (Math.floor(Math.random() * Math.floor(4))) {
                    case 0:
                        return [
                            false,
                            1, y
                        ]
                    case 1:
                        return [
                            false, worldInfo.maxX - width, y - 1
                        ]
                    case 2:
                        return [
                            false, x,
                            1
                        ]
                    case 3:
                        return [
                            false, x, worldInfo.maxY - height - 1
                        ]
                    default:
                        return [
                            false,
                            1, y
                        ]
                }
            }
        },
        "moveCooldown": 2,
        "canTransform": false,
        "scared": false,
        "scareRadius": worldInfo.maxY * 2,
        "special": () => { }, updateOnUpdate: (en) => {
            var entityts = worldEntitys.filter(key => key != en);
            for (let index = 0; index < entityts.length; index++) {
                var e = entityts[index
                ];
                if (en.x + en.width > e.x && en.x < e.x + e.width && en.y + en.height > e.y && en.y < e.y + e.height) {
                    if (index == 0) {
                        death();
                    } else if (!types[e.type
                    ].scared) {
                        worldEntitys = worldEntitys.filter(key => key != e);
                        worldEntitys = worldEntitys.filter(key => key != en);
                        randomSpawnEntity(e.type);
                        randomSpawnEntity(en.type);
                        reward = rewardTable[e.type
                        ] + rewardTable[en.type
                            ];
                        return;
                    }
                }
            }
        }
    },
    "frog": {
        "color": "#00FF00",
        "width": 5,
        "population": 5,
        "height": 5,
        "movementSpeed": 20,
        "spawnPosCheck": (x, y, width, height) => {
            return [
                false, x, y
            ]
        },
        "cooldown": 10,
        "moveCooldown": 50,
        "canTransform": true,
        "scared": true,
        "scareRadius": 100,
        "special": () => { },
        "updateOnUpdate": (en) => { }
    }
}

function death() {
    gameState = false;
    reward = rewardTable["death"];
}


function createEntity(x, y, type) {
    var e = new Entity(x, y, type, types[type].color, types[type].width, types[type].height, types[type].movementSpeed, types[type].cooldown, types[type].special, 0, types[type].updateOnUpdate);
    if (type == "player") {
        e.isPlayer = true;
    }
    return (e);
}

function changeType(x, y, type) {
    var e = createEntity(x, y, type);
    e.isPlayer = true;
    return (e);
}


if (!loadModel) {
    model = tf.sequential()
    model.add(tf.layers.dense({ units: 80, activation: 'sigmoid', inputShape: input }))
    model.add(tf.layers.dropout(0.15))
    model.add(tf.layers.dense({ units: 60, activation: 'sigmoid' }))
    model.add(tf.layers.dropout(0.15))
    model.add(tf.layers.dense({ units: 60, activation: 'sigmoid' }))
    model.add(tf.layers.dropout(0.15))
    model.add(tf.layers.dense({ units: output, activation: 'softmax' }))
    var opt = tf.train.adam(learning_rate);
    model.compile({ loss: 'meanSquaredError', optimizer: opt });
    startGame();

} else {

    load();
}





function startGame() {
    run++;
    timePassed = 0;
    points = 0;
    worldEntitys = [createEntity(500, 500, "player")];
    gameState = true;
    var keys = [];
    for (var k in types) keys.push(k);
    for (let i = 1; i < keys.length; i++) {
        for (let index = 0; index < types[keys[i]].population; index++) {
            randomSpawnEntity(keys[i]);
        }
    }
    gameLoop();
}

doMoveTf();

function doMoveTf(state) {
    reward = rewardTable["idle"];
    var keys = [];
    if (Math.floor(Math.random() * maxRandom) > random) {
        for (let index = 0; index < Math.floor(Math.random() * keyToIndex.length); index++) {
            keys.push(0);
        }
        keys.push(1);
        while (keys.length != keyToIndex.length) {
            keys.push(0);
        }
    } else {
        keys = model.predict(tf.tensor(state, [1, input])).dataSync();
    }

    addKeys(keys)

}

function getState() {
    var state = [];
    var player = worldEntitys[0];
    for (let index = 1; index < worldEntitys.length; index++) {
        var e = worldEntitys[index];
        state.push(e.x)
        state.push(e.y)
    }
    state.push(player.x);
    state.push(player.y);
    state.push(points);
    var keys = [];
    for (var k in types) keys.push(k);
    state.push(keys.indexOf(worldEntitys[0].type));

    return state;
}

function gameLoop() {
    scareConnections = 0;
    distReward = 0;
    timePassed += 1 / 60;
    if (!gameState) {
        stopGame();
        return;
    }
    var oldState = getState();

    doMoveTf(oldState);

    doKeyStuff();

    worldEntitys[0].update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let index = 1; index < worldEntitys.length; index++) {
        var e = worldEntitys[index]
        e.update();
        var dist = Math.sqrt(Math.pow(e.x + e.width / 2 - (worldEntitys[0].x + worldEntitys[0].width / 2), 2) + Math.pow(e.y + e.height / 2 - (worldEntitys[0].y + worldEntitys[0].height / 2), 2))
        if (dist <= types[e.type].scareRadius) {
            distReward = distReward + dist;
            scareConnections++;
        }
        if (drawScreen) {
            ctx.fillStyle = e.color
            ctx.fillRect(e.x, e.y, e.width, e.height);
        }
    }

    var newState = getState();

    if (drawScreen) {
        var e = worldEntitys[0];
        ctx.fillStyle = e.color
        ctx.fillRect(e.x, e.y, e.width, e.height);

        ctx.fillStyle = "#000000";
        ctx.font = "20px Arial";
        ctx.fillText(Math.floor(timePassed), 20, 20);
    }

    train(oldState, newState);
}

function Predict() {
    console.log(model.predict(tf.tensor(getState(), [1, input])).dataSync())
}


function train(oldState, newState) {
    if (distReward < tempRewardSave) {
        tempRewardSave = distReward;
        distReward = distReward * -1;
    } else {
        tempRewardSave = distReward;
    }


    reward = reward + distReward / rewardScaler / scareConnections
    if (timePassed > maxTimeToContiune && random < maxRandom * RandomMaxMax) {
        random++;
    }

    var maxQ = getMaxQ(newState, true);
    var Qs = maxQ[1]

    var targetF;
    var target;
    if (reward == rewardTable["death"] + distReward / rewardScaler / scareConnections) {
        targetF = reward;
    } else {
        targetF = reward + Qs[maxQ[0]];
    }

    Qs[maxQ[0]] = targetF;
    target = Qs

    //  for (let index = 0; index < rewardKeys.length; index++) {
    //     if (reward == rewardTable[rewardKeys[index]] + distReward / scareConnections) {
    //         remember(oldState, newState, reward);
    //         break;
    //     }
    // }

    model.fit(tf.tensor(oldState, [1, input]), tf.tensor(target, [1, output])).then(info => {
        training++;
        if (reward == rewardTable["death"] + distReward / rewardScaler / scareConnections) {
            remember(oldState, newState, reward, true);
            revise();
        } else {
            gameLoop();
        }
    });
}



function revise() {
    reviseIndex++;
    reward = memory[reviseIndex].r;
    newState = memory[reviseIndex].n;
    oldState = memory[reviseIndex].o;

    var maxQ = getMaxQ(newState, true);
    var Qs = maxQ[1]


    var targetF;
    var target;
    if (memory[reviseIndex].d) {
        targetF = reward;
    } else {
        targetF = reward + learning_rate * Qs[maxQ[0]];
    }

    Qs[maxQ[0]] = targetF;
    target = Qs

    model.fit(tf.tensor(oldState, [1, input]), tf.tensor(target, [1, output])).then(info => {
        training++;
        if (reviseIndex >= memory.length - 1) {
            reviseIndex = -1;
            startGame();
        } else {
            revise();
        }
    });
}


function remember(oldS, newS, reward, death) {
    if (memory.length >= maxMemory) {
        memory[Math.floor(Math.random() * maxMemory)] = { o: oldS, n: newS, r: reward };
    } else {
        memory.push({ o: oldS, n: newS, r: reward, d: death });
    }
}

function getQValues(state) {
    return model.predict(tf.tensor(state, [1, input])).dataSync();
}

function getMaxQ(state, index) {
    if (!index) {
        return Math.max(...getQValues(state))
    }
    var Qs = getQValues(state);
    return [Qs.indexOf(Math.max(...Qs)), Qs];
}

async function save() {
    await model.save('file://models');
}

async function load(compile) {
    model = await tf.loadLayersModel("file://models/model.json");
    var opt = tf.train.adam(learning_rate);
    model.compile({ loss: 'meanSquaredError', optimizer: opt });
    startGame();
}

document.onkeyup = function KeyEventHandler(e) {
    if (e.keyCode == 82) //r to save game
    {
        save();
    }
    // var code = e.keyCode;
    //keysPressed = keysPressed.filter(key => key != code);
}

/** 
document.onkeydown = function KeyEventHandler(e) {
    var code = e.keyCode;
    if (!keysPressed.includes(code)) {
        keysPressed.push(code);
    }
}

*/


function addKeys(arr) {
    keysPressed = [keyToIndex[arr.indexOf(Math.max(...arr))]];
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



function stopGame() {
    console.log("game end")
    ctx.font = "50px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("Game Over \n r to restart", playerView.maxY, playerView.maxX);
    clearInterval(gameLoop);

}


// AI ------------------------------------------------------
function getPos(e) {
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

// Util ----------------------------
function lineTo(x, y, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = "red";
    ctx.stroke();
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
        var width = types[type].width;
        var height = types[type].height
        var x = Math.floor(Math.random() * Math.floor(worldInfo.maxX - width));
        var y = Math.floor(Math.random() * Math.floor(worldInfo.maxY - height));
        var funct = types[type].spawnPosCheck;
        var req = funct(x, y, width, height);
        makeNew = req[0]
        x = req[1];
        y = req[2];
        if (makeNew) continue;
        for (let index = 0; index < worldEntitys.length; index++) {
            var e = worldEntitys[index];
            if (x + width > e.x && x < e.x + e.width && y + height > e.y && y < e.y + e.height) {
                makeNew = true;
            }
        }

    }
    worldEntitys.push(createEntity(x, y, type));
}