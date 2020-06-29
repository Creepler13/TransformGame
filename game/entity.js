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
                var newCords = ai.getPos(this);
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

var types = {

    player: { color: "#000000", width: 20, height: 20, movementSpeed: 2, cooldown: 100, canTransform: true, moveCooldown: 0, special: () => { console.log("player"); }, updateOnUpdate: (en) => { } },
    enemy: {
        color: "#e50000", population: 3, width: 20, height: 20, movementSpeed: 1, spawnPosCheck: (x, y, width, height) => {
            var player = worldEntitys[0];
            var dist = Math.sqrt(Math.pow(x + width - (player.x + player.width), 2) + Math.pow(y + height - (player.y + player.height), 2));
            if (dist <= types["enemy"].scareRadius) {
                return [true, x, y];
            }
            return [false, x, y];
        }, cooldown: 10, moveCooldown: 0, canTransform: false, scared: false, scareRadius: 250, special: () => { }, updateOnUpdate: (en) => {
            var entityts = worldEntitys.filter(key => key != en);
            for (let index = 0; index < entityts.length; index++) {
                var e = entityts[index];
                if (en.x + en.width > e.x && en.x < e.x + e.width && en.y + en.height > e.y && en.y < e.y + e.height) {
                    if (index == 0) {
                        gameState = false;
                    } else if (!types[e.type].scared) {
                        worldEntitys = worldEntitys.filter(key => key != e);
                        worldEntitys = worldEntitys.filter(key => key != en);
                        randomSpawnEntity(e.type);
                        randomSpawnEntity(en.type);
                        return;
                    }
                }
            }
        }
    }, missile: {
        color: "#ff00ff", population: 2, width: 6, height: 6, movementSpeed: 3, cooldown: 10, spawnPosCheck: (x, y, width, height) => {
            if (x == 1 || x == worldInfo.maxX - width - 1 || y == 1 || y == worldInfo.maxY - height - 1) {
                return [false, x, y]
            } else {
                switch (Math.floor(Math.random() * Math.floor(4))) {
                    case 0:
                        return [false, 1, y]
                    case 1:
                        return [false, worldInfo.maxX - width, y - 1]
                    case 2:
                        return [false, x, 1]
                    case 3:
                        return [false, x, worldInfo.maxY - height - 1]
                    default:
                        return [false, 1, y]
                }
            }
        }, moveCooldown: 2, canTransform: false, scared: false, scareRadius: 1000, special: () => { }, updateOnUpdate: (en) => {
            var entityts = worldEntitys.filter(key => key != en);
            for (let index = 0; index < entityts.length; index++) {
                var e = entityts[index];
                if (en.x + en.width > e.x && en.x < e.x + e.width && en.y + en.height > e.y && en.y < e.y + e.height) {
                    if (index == 0) {
                        gameState = false;
                    } else if (!types[e.type].scared) {
                        worldEntitys = worldEntitys.filter(key => key != e);
                        worldEntitys = worldEntitys.filter(key => key != en);
                        randomSpawnEntity(e.type);
                        randomSpawnEntity(en.type);
                        return;
                    }
                }
            }
        }
    },
    frog: { color: "#00FF00", width: 5, population: 5, height: 5, movementSpeed: 20, spawnPosCheck: (x, y, width, height) => { return [false, x, y] }, cooldown: 10, moveCooldown: 50, canTransform: true, scared: true, scareRadius: 100, special: () => { }, updateOnUpdate: (en) => { } }

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
