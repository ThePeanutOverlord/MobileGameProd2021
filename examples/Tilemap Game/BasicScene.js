class BasicScene extends Phaser.Scene {
    constructor() {
        super("BasicScene");
        // Shortcuts
        this.cam = null;
        this.ptr = null;
        this.Distance = Phaser.Math.Distance;
        // Signals from other scenes
        this.signals = SignalManager.get();
        // Tilemap stuff
        this.tilemap = null;
        this.tileset = null;
        this.tileLayers = {};
        this.mapObjects = [];
        // Character
        this.clown = null;
        this.walkSpeed = 100;
        this.jumpSpeed = 175;
    }

    preload() {
        this.load.image('clown', './assets/clown.png');
        this.load.image('basic-set', './assets/basic.png');
        this.load.tilemapTiledJSON('basic-map', './assets/basic.json');
    }

    create() {
        console.log("BasicScene");
        // Shortcuts
        this.cam = this.cameras.main;
        this.ptr = this.input.activePointer;
        // Start the controls overlay
        this.scene.launch("ControlsScene");
        this.signals.on('joystick', (data) => {
            this.movePlayer(data);
        });
        // Create things
        this.createTilemap();
        this.createPlayer();
        // Collision handlers
        this.setCollisions();
        // Set the camera
        this.cam.startFollow(this.clown);
        this.cam.setZoom(3.5);
        this.cam.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
        // Listen for game over
        this.signals.on('game-over', ()=>{
            this.gameOver();
        });

        // Create more clowns
        let otherClown = this.physics.add.image(150, 300, 'clown');
        otherClown.body.setImmovable(true).setAllowGravity(false);
        this.physics.add.overlap(this.clown, otherClown, ()=>{
            console.log("Some kind of score increase here");
            otherClown.destroy();
        })
    }

    update(){
        if(this.clown.y > this.tilemap.heightInPixels){
            this.signals.emit('game-over');
        }
    }

    createTilemap() {
        this.tilemap = this.add.tilemap('basic-map');
        this.tileset = this.tilemap
            .addTilesetImage('basic', 'basic-set');
        let background = this.tilemap
            .createLayer('background', this.tileset, 0, 0);
        background.setDepth(0);
        let foreground = this.tilemap
            .createLayer('foreground', this.tileset, 0, 0);
        foreground.setDepth(1);
        let overhead = this.tilemap
            .createLayer('overhead', this.tileset, 0, 0);
        overhead.setDepth(2);
        // Add the layers to layer object
        this.tileLayers = {
            background: background,
            foreground: foreground,
            overhead: overhead
        }
    }

    createPlayer() {
        this.clown = this.physics.add.image(100, 300, 'clown');
    }

    gameOver(){
        this.signals.off('game-over');
        this.scene.restart();
    }

    movePlayer(joystick) {
        // if (this.clown.body.blocked.down) {
        this.clown.setVelocityX(this.walkSpeed * joystick.joyX());
        // }
        if (joystick.joyY() < -0.2 && this.clown.body.blocked.down) {
            this.clown.setVelocityY(-this.jumpSpeed);
        }
    }

    setCollisions() {
        // Collision
        this.tileLayers.foreground.setCollisionBetween(0, 10000, true);
        this.physics.add.collider(this.tileLayers.foreground, this.clown);
    }
}