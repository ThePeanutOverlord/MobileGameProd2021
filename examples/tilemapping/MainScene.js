class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload(){
        this.load.image('maptiles', './assets/RPG Nature Tileset.png');
        this.load.tilemapTiledJSON('map', './assets/map.json');
    
    }
    create(){
        let tilemap = this.add.tilemap('map');
        let tileset = tilemap.addTilesetImage('nature', 'maptiles');
        let background = tilemap.createLayer('bg', tileset, 0, 0);
        let foreground = tilemap.createLayer('fg', tileset, 0, 0);
        let overhead = tilemap.createLayer('overhead', tileset, 0, 0);
        this.input.on('pointerdown', ()=>{
            this.cameras.main.centerOn(this.input.activerPointer.worldX, this.input.activePointer.worldY);
        })
    }

    update(){
        
    }
}