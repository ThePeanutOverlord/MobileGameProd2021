class MapScene extends Phaser.Scene {
    /**
     * MapScene Depth Guide:
     * background = 0
     * foreground = 1
     * overhead = 2
     */
    constructor() {
        super("MapScene");
        // Shortcuts
        this.cam = null;
        this.ptr = null;
        this.Distance = Phaser.Math.Distance;
        // Tilemap stuff
        this.tilemap = null;
        this.tileset = null;
        this.tileLayers = {};
        // Character
        this.clown = null;
    }

    preload() {
        this.load.image('clown', './assets/clown.png');
        this.load.image('map-bg', './assets/gameboy.png');
        this.load.tilemapTiledJSON('map', './assets/map.json');
    }

    create() {
        // Shortcuts
        this.cam = this.cameras.main;
        this.ptr = this.input.activePointer;
        // Create the character
        this.clown = this.physics.add.image(50, 50, 'clown');
        this.clown.dest = null;
        this.clown.setDepth(1);
        // Tilemap
        this.createTilemap();
        // Callbacks
        this.input.on('pointerdown', () => {
            // this.cam.centerOn(this.ptr.worldX, this.ptr.worldY);
            this.clown.dest = {
                x: this.ptr.worldX,
                y: this.ptr.worldY
            }
            this.physics.moveTo(this.clown, this.ptr.worldX, this.ptr.worldY, 75);
        });
        // Camera controls
        this.cam.startFollow(this.clown);
        this.cam.setZoom(4);
    }

    update() {
        if (this.clown.dest != null
            && this.Distance.BetweenPoints(this.clown, this.clown.dest) < 4) {
                this.clown.setVelocity(0);
        }
    }

    createTilemap() {
        this.tilemap = this.add.tilemap('map');
        this.tileset = this.tilemap
            .addTilesetImage('map-set', 'map-bg');
        let background = this.tilemap
            .createLayer('background', this.tileset, 0, 0);
        background.setDepth(0);
        let foreground = this.tilemap
            .createLayer('foreground', this.tileset, 0, 0);
        foreground.setDepth(1);
        let overhead = this.tilemap
            .createLayer('overhead', this.tileset, 0, 0);
        overhead.setDepth(2);
        // Collision
        foreground.setCollisionBetween(0, 10000, true);
        this.physics.add.collider(foreground, this.clown, ()=>{
            this.clown.setVelocity(0);
        });
        // Add the layers to layer object
        this.tileLayers = {
            background: background,
            foreground: foreground,
            overhead: overhead
        }
    }
}