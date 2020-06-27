class Entity {

    constructor(x, y, type, color, width, height, movementSpeed, cooldown, special, moveCooldown, updateOnUpdate) {

        this.x = x;
        this.y = y;
        this.type = type;
        this.color = color;
        this.isPlayer = false;
        this.aiCooldown = 0;
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
        color: "#e50000", width: 20, height: 20, movementSpeed: 1, cooldown: 10, moveCooldown: 0, canTransform: false, scared: false, scareRadius: 250, special: () => { }, updateOnUpdate: (en) => {
            var e = worldEntitys[0];
            if (en.x + en.width > e.x && en.x < e.x + e.width && en.y + en.height > e.y && en.y < e.y + e.height) {
                gameState = false;
            }
        }
    },
    frog: { color: "#00FF00", width: 5, population: 5, height: 5, movementSpeed: 20, cooldown: 10, moveCooldown: 50, canTransform: true, scared: true, scareRadius: 100, special: () => { }, updateOnUpdate: (en) => { } }

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
