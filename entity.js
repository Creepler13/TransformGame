class Entity {

    constructor(x, y, type, color, width, height, movementSpeed, cooldown, special, moveCooldown) {

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
            } else {
                this.checkTouch();
            }
            this.updateOnUpdate();
        }

        this.updateOnUpdate = () => {
        }

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

    player: { color: "#000000", width: 20, height: 20, movementSpeed: 2, cooldown: 100, canTransform: true, moveCooldown: 0, special: () => { console.log("player"); } },
    enemy: { color: "#e50000", width: 20, height: 20, movementSpeed: 4, cooldown: 10, moveCooldown: 15, canTransform: false, scared: false, scareRadius: 100, special: () => { } },
    frog: { color: "#00FF00", width: 5, population: 5, height: 5, movementSpeed: 20, cooldown: 10, moveCooldown: 50, canTransform: true, scared: true, scareRadius: 100, special: () => { } }

}

function createEntity(x, y, type) {


    var color = types[type].color;
    var width = types[type].width;
    var height = types[type].height;
    var cooldown = types[type].cooldown;
    var movementSpeed = types[type].movementSpeed;
    var special = types[type].special;
    var moveCooldown = 0;
    var e = new Entity(x, y, type, color, width, height, movementSpeed, cooldown, special, moveCooldown);
    if (type == "player") {
        e.isPlayer = true;
    }
    return (e);
}

function changeType(x, y, type) {
    var moveCooldown = types[type].moveCooldown;
    var color = types[type].color;
    var width = types[type].width;
    var height = types[type].height;
    var cooldown = types[type].cooldown;
    var movementSpeed = types[type].movementSpeed;
    var special = types[type].special;
    var e = new Entity(x, y, type, color, width, height, movementSpeed, cooldown, special, moveCooldown);
    e.isPlayer = true;
    return (e);

}