const config = require("../../config.js");
const { User , Map , Op} = require(config.LOGIC + "/helpers/DB.js");

const admin = async (io , socket , id) => {
    let user = await User.findOne({
        where: {
            user_id: id
        }
    });
    
    if(!user || user.accLevel < 2) return;
    
    socket.on("a-create-map" , (data) => {
        const map = await Map.create({
            map_id : data.map_id,
            name: data.name,
            size: JSON.stringify(data.size),
            defaultTerrain: data.defaultTerrain
        });
        
        if(map) return socket.emit("a-create-map" , true);
        return socket.emit("a-create-map" , false);
    });
    
    socket.on("a-teleport" , async (data) => {
        const map = await Map.findOne({
            where: {
                [Op.or] : [{
                    map_id : data},
                    {name: data
                }]
            }
        });
        
        if(!map) return socket.emit("a-teleport" , "TELE_NOT_FOUND");
        
        user = await User.findOne({
            where: {
                user_id : id
            }
        });
        
        user.setData({
            map: map.map_id,
            pos: {
                x: parseInt(map.getData(["size"]).size.x / 2) * config.GAME.tile_size,
                y: parseInt(map.getData(["size"]).size.y / 2) * config.GAME.tile_size,
                a: 0
            }
        });
        
        return socket.emit("a-teleport" , true)
    });
    
    socket.on("a-delete-map" , async (data) => {
        const map = await Map.findOne({
            where: {
                [Op.or] : [{
                    map_id : data},
                    {name: data
                }]
            }
        });
        
        if(map){
            await map.destroy();
            return socket.emit("a-delete-map" , true);
        }
        
        return socket.emit("a-delete-map" , false);
    });
}
