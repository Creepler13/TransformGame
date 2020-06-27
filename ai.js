class Ai {


    constructor() {


        this.getPos = (e) => {
            switch (types[e.type].scared) {
                case true:
                    return normalEntity(e);
                default:
                    return [0, 0]
            }
        }

        function normalEntity(e) {
            var player = worldEntitys[0];
            var dist = Math.sqrt(Math.pow(e.x - player.x, 2) + Math.pow(e.y - player.y, 2))
            var addX = 0;
            var addY = 0;
            if (dist <= types[e.type].scareRadius) {
                var xDist = player.x - e.x
                var yDist = player.y - e.y
                if (xDist > e.height) {
                    addX = e.movementSpeed * -1;
                }
                if (xDist < player.height * -1) {
                    addX = e.movementSpeed;
                }
                if (yDist > e.height) {
                    addY = e.movementSpeed * -1;
                }
                if (yDist < player.height * -1) {
                    addY = e.movementSpeed;
                }
                if (e.y + addY < 0 || e.y + addY > worldInfo.maxY - e.height) {
                    addY = 0;
                }
                if (e.x + addX < 0 || e.x + addX > worldInfo.maxX - e.width) {
                    addX = 0;
                }
                return [addX, addY]
            } else {
                return [0, 0];
            }




            //   var tempEntitys = worldEntitys.filter(key => key != e);
            //  for (let index = 1; index < tempEntitys.length; index++) {
            //       var en = tempEntitys[index];
            //        if (addX + e.width > en.x && addX < en.x + en.width && addY + e.height > en.y && addY < en.y + en.height) {
            //           return [0, 0];
            //       }
            //     }
            //     return [toAddX, toAddY];
            //  } else {
            //      return [0, 0];
            // }
        }
    }

}