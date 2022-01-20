class Level1 extends Phaser.Scene {
    /**
     * MapScene Depth Guide:
     * background = 0
     * foreground = 1
     * overhead = 2
     * controls = 3
     */
    constructor(){
        super("Level1");
        // Shortcuts
        this.cam = null;
        this.ptr = null;
        this.Distance = Phaser.Math.Distance;
        // Tilemap stuff
        this.tilemap = null;
        this.tilesetMain = null;
        this.tileLayers = {};
        // Character
        this.player = null;
        this.action = false;
        this.attacking = false;
        this.plyrFalling = false;
        this.atkCounter = 1;
        this.atkCounterTimeout = 1000;
        this.lastSwing = null;
        this.plyrDirection = null;
        this.facingRight = true;
        // Enemies
        // Create enemy stats
        this.enemySkeletonDying = false;
        this.hp = 10;
        this.hpMax = this.hp;
        this.enemySkeletonStats = {
            hp: 10,
            hpMax: null,
        };
    }

    preload() {
        // Load the tilemap
        this.load.image('foreground1set', './assets/tilemap1/Level1/mainlevbuild.png');
        this.load.image('bck1', './assets/backgrounds/bakcground_day1.png');
        this.load.image('bck2', './assets/backgrounds/bakcground_day2.png');
        this.load.image('bck3', './assets/backgrounds/bakcground_day3.png');
        this.load.image('backgroundObjset', './assets/tilemap1/Level1/background_obj.png');
        this.load.tilemapTiledJSON('level-1', './assets/tilemap1/Level1/level-1.json');
        // Load the player animations
        this.load.spritesheet('player-idle', './assets/player/animations/Idle.png', {
            frameWidth: 128,
            frameHeight: 64
        });
        this.load.spritesheet('player-run', './assets/player/animations/Run.png', {
            frameWidth: 128,
            frameHeight: 64
        });
        this.load.spritesheet('player-jump', './assets/player/animations/Jump.png', {
            frameWidth: 128,
            frameHeight: 64
        });
        this.load.spritesheet('player-attack', './assets/player/animations/Attacks.png', {
            frameWidth: 128,
            frameHeight: 64
        });
        // Load the enemy animations
        this.load.spritesheet('enemy-skeleton-idle', './assets/enemies/animations/Skeleton/Idle.png', {
            frameWidth: 150,
            frameHeight: 150
        });
        this.load.spritesheet('enemy-skeleton-hit', './assets/enemies/animations/Skeleton/Take Hit.png', {
            frameWidth: 150,
            frameHeight: 150
        });
        this.load.spritesheet('enemy-skeleton-death', './assets/enemies/animations/Skeleton/Death.png', {
            frameWidth: 150,
            frameHeight: 150
        });
        // Load the player control buttons
        this.load.image('player-right-button', './assets/interface/controls/move-right.png');
        this.load.image('player-left-button', './assets/interface/controls/move-left.png');
        this.load.image('player-jump-button', './assets/interface/controls/jump.png');
        this.load.image('player-attack-button', './assets/interface/controls/attack-button.png');
        // Demo buttons
        this.load.image('spawn-enemy', './assets/interface/buttons/spawn-enemy.png');
        // Load the sounds
        this.load.audio('player-atk', './assets/sounds/player/attacks/metal_078.wav');
    }

    create() {
        // Shortcuts
        this.cam = this.cameras.main;
        this.ptr = this.input.activePointer;
        
        // Creates a parallax background
        this.bckgroundPar = [];
        let bck = this.add.tileSprite(0, 150, 10000, 450, `bck1`);
        bck.setOrigin(0, 0);
        bck.setTileScale(1.1);
        this.bckgroundPar.push(bck);
        let mid = this.add.tileSprite(0, 150, 10000, 450, `bck2`);
        mid.setOrigin(0, 0);
        mid.setTileScale(1.1);
        this.bckgroundPar.push(mid);
        let fore = this.add.tileSprite(0, 150, 10000, 450, `bck3`);
        fore.setOrigin(0, 0);
        fore.setTileScale(1.1);
        this.bckgroundPar.push(fore);
        // Creates the level
        this.createPlayer();
        this.createTilemap();
        this.setCollision(this.player);
        this.player.setDepth(1);
        this.spawnEnemy();
        // Creates the controls
        this.createControls();
        // this.createControlsPC();
        // Camera controls
        this.cam.startFollow(this.player);
        //this.cam.setZoom(4);
        // Set up collisions
        // Debug Stuff
        this.debugStuff();
    }

    update() {
        // Prevents the player from infinitely spamming action buttons
        // such as jumping or attacking
        // if (this.action) {
        //     this.jump.disableInteractive();
        // }
        // else if(!this.action) {
        //     this.jump.setInteractive();
        // }
        // Updates parallax background
        this.updateParallax();
        // Improves the jumping animaiton
        if (this.player.body.velocity.y > 0) {
            this.plyrFalling = true;
            this.player.anims.play('jump-down');
        }
        // Allows controlers to stay on screen
        this.moveRight.x = this.player.x - 250;
        this.moveRight.y = this.player.y + 175;
        this.moveLeft.x = this.player.x - 350;
        this.moveLeft.y = this.player.y + 175;
        this.jump.x = this.player.x + 360;
        this.jump.y = this.player.y + 50;
        this.attack.x = this.player.x + 350;
        this.attack.y = this.player.y + 175;
        this.spawnEnemyButton.x = this.player.x + 350;
        this.spawnEnemyButton.y = this.player.y + -175;
        // console.log(`${this.player.y}`);
        // Gets the players direction
        // console.log(this.player.setFlipX);
        // Updates enemey health bar
        this.healthBar.x = this.enemySkeleton.x;
        this.healthBar.y = this.enemySkeleton.y - 75;
        if (this.hp > 0) {
            this.healthBar.setScale(this.hp/this.hpMax, 1);
        } else {
            this.healthBar.setScale(0);
        }
        // Changes health bar to red
        if (this.hp < this.hpMax * 0.25) {
            this.healthBar.setFillStyle('0xff0000');
        }
        // Changes health bar to orange
        else if (this.hp < this.hpMax * 0.75 && this.hp > this.hpMax * 0.25) {
            this.healthBar.setFillStyle('0xffbf00');
        }
    }

    updateParallax() {
        for (let i = 0; i < 3; i++) {
            if (this.player.body.velocity.x > 0) {
                this.bckgroundPar[i].tilePositionX -= (i + 1) * -0.05;
            }
            else if (this.player.body.velocity.x < 0) {
                this.bckgroundPar[i].tilePositionX -= (i + 1) * 0.05;
            }    
            else {
                this.bckgroundPar[i].tilePositionX -= 0;
            }  
        }
        // this.bckgroundPar.bck.y = this.player.y;
    }

    createTilemap() {
        this.tilemap = this.add.tilemap('level-1');
        this.tilesetBackObj = this.tilemap.addTilesetImage('backgroundObj-set', 'backgroundObjset');
        this.tilesetMain = this.tilemap.addTilesetImage('foreground1-set', 'foreground1set');
        let backgroundObj = this.tilemap
            .createLayer('backgroundObj', this.tilesetBackObj, 0, 0);
        backgroundObj.setDepth(0);
        let background = this.tilemap
            .createLayer('background', this.tilesetMain, 0, 0);
        background.setDepth(0);
        let foreground = this.tilemap
            .createLayer('foreground', this.tilesetMain, 0, 0);
        foreground.setDepth(1);
        let overground = this.tilemap
            .createLayer('overground', this.tilesetMain, 0, 0);
        overground.setDepth(2);

        // Add the layers to layer object
        this.tileLayers = {
            backgroundObj: backgroundObj,
            background: background,
            foreground: foreground,
            overground: overground
        }
    }

    createPlayer() {
        this.player = this.physics.add.sprite(225, 300, 'player');
        this.player.setScale(2);
        this.player.body.setSize(15, 46, true);
        this.player.setOffset(57, 17);
        // Create aniamtions for the player
        this.generatePlayerAnimations();
        // Collide the player with world bounds
        // this.player.setCollideWorldBounds(true);
        // Start the player in idle
        this.player.anims.play('idle');
    }

    playerAttackCycler() {
        if (this.atkCounter == 1 && !this.attacking /*&& this.now() > this.lastSwing + this.atkCounterTimeout*/) {
            this.attacking = true;
            this.player.anims.play('atk1');
            this.createPlayersAttackColliderObj();
            this.atkCounter = 2;
            // this.setLastSwing();
            this.player.on('animationcomplete-atk1', ()=> {
                this.attacking = false;
                this.plrAtkHitbox.destroy();
                console.log("Hitbox destroyed");
                this.player.anims.play('idle');
            });
        }
        else if (this.atkCounter == 2 && !this.attacking /*&& this.now() > this.lastSwing + this.atkCounterTimeout*/) {
            this.attacking = true;
            this.player.anims.play('atk2');
            this.createPlayersAttackColliderObj();
            this.atkCounter = 3;
            // this.setLastSwing();
            this.player.on('animationcomplete-atk2', ()=> {
                this.attacking = false;
                this.plrAtkHitbox.destroy();
                console.log("Hitbox destroyed");
                this.player.anims.play('idle');
            });
        }
        else if (this.atkCounter == 3 && !this.attacking /*&& this.now() > this.lastSwing + this.atkCounterTimeout*/) {
            this.attacking = true;
            this.player.anims.play('atk3');
            this.createPlayersAttackColliderObj();
            this.atkCounter = 4;
            // this.setLastSwing();
            this.player.on('animationcomplete-atk3', ()=> {
                this.attacking = false;
                this.plrAtkHitbox.destroy();
                console.log("Hitbox destroyed");
                this.player.anims.play('idle');
            });
        }
        else if (this.atkCounter == 4 && !this.attacking /*&& this.now() > this.lastSwing + this.atkCounterTimeout*/) {
            this.attacking = true;
            this.player.anims.play('atk4');
            this.createPlayersAttackColliderObj();
            this.atkCounter = 1;
            // this.setLastSwing();
            this.player.on('animationcomplete-atk4', ()=> {
                this.attacking = false;
                this.plrAtkHitbox.destroy();
                console.log("Hitbox destroyed");
                this.player.anims.play('idle');
            });
        }
    }

    createControls() {
        // Move right
        this.moveRight = this.add.image(150, 400, 'player-right-button');
        this.moveRight.setScale(6);
        this.moveRight.setDepth(3);
        this.moveRight.setInteractive();
        this.moveRight.on('pointerdown', ()=> {
            this.player.setFlipX(false);
            this.facingRight = true;
            this.player.setVelocityX(200);
            if (this.player.body.blocked.down) {
                this.player.anims.play('run');
            }
        });
        this.moveRight.on('pointerup', ()=> {
            this.player.setVelocity(0, 0);
            this.player.anims.play('idle');
        });
        // Move left
        this.moveLeft = this.add.image(50, 400, 'player-left-button');
        this.moveLeft.setScale(6);
        this.moveLeft.setDepth(3);
        this.moveLeft.setInteractive();
        this.moveLeft.on('pointerdown', ()=> {
            this.player.setFlipX(true);
            this.facingRight = false;
            this.player.setVelocityX(-200);
            if (this.player.body.blocked.down) {
                this.player.anims.play('run');
            }
        });
        this.moveLeft.on('pointerup', ()=> {
            this.player.setVelocity(0, 0);
            this.player.anims.play('idle');
        });
        // Jump
        this.jump = this.add.image(765, 175, 'player-jump-button');
        this.jump.setDepth(3);
        this.jump.setScale(6);
        this.jump.setInteractive();
        this.jump.on('pointerdown', ()=> {
            if (this.player.body.blocked.down) {
                this.player.setVelocityY(-400);
                this.player.anims.play('jump-up');
                this.player.on('animationcomplete-jump-down', ()=> {
                    if (this.player.body.velocity.x > 0) {
                        this.player.setFlipX(false);
                        this.player.anims.play('run');
                    }
                    else if (this.player.body.velocity.x < 0) {
                        this.player.setFlipX(true);
                        this.player.anims.play('run');
                    }else{
                        this.player.anims.play('idle');
                    }            
                });
            } 
        });
        // this.input.on('pointerup', ()=> {
        // // this.player.setVelocityX(0);
        // });
        // Creates the attack button
        this.attack = this.add.image(765, 300, 'player-attack-button');
        this.attack.setDepth(3);
        this.attack.setScale(2.75);
        this.attack.setInteractive();
        this.attack.on('pointerdown', ()=> {
            this.playerAttackCycler();
        });
    }

    createControlsPC() {
        // Move right
        this.input.keyboard.on('keydown-D', ()=> {
            this.player.setFlipX(false);
            this.player.setVelocityX(200);
            if (this.player.body.blocked.down) {
                this.player.anims.play('run');
            }
        });
        this.input.keyboard.on('keyup-D', ()=> {
            this.player.setVelocity(0, 0);
            this.player.anims.play('idle');
        });
        // Move left
        this.input.keyboard.on('keydown-A', ()=> {
            this.player.setFlipX(true);
            this.player.setVelocityX(-200);
            if (this.player.body.blocked.down) {
                this.player.anims.play('run');
            }
        });
        this.input.keyboard.on('keyup-A', ()=> {
            this.player.setVelocity(0, 0);
            this.player.anims.play('idle');
        });
        // Jump
        this.input.keyboard.on('keydown-W', ()=> {
            if (this.player.body.blocked.down) {
                this.player.setVelocityY(-400);
                this.player.anims.play('jump-up');
                this.player.on('animationcomplete-jump-down', ()=> {
                    if (this.player.body.velocity.x > 0) {
                        this.player.setFlipX(false);
                        this.player.anims.play('run');
                    }
                    else if (this.player.body.velocity.x < 0) {
                        this.player.setFlipX(true);
                        this.player.anims.play('run');
                    }else{
                        this.player.anims.play('idle');
                    }            
                });
            } 
        });
        // this.input.on('pointerup', ()=> {
        // // this.player.setVelocityX(0);
        // });
    }

    createEnemy1(x, y) {
        this.enemySkeleton = this.physics.add.sprite(x, y, 'enemy-skeleton');
        this.enemySkeleton.setScale(2);
        this.enemySkeleton.body.setSize(25, 51, true);
        this.enemySkeleton.setOffset(60, 50);
        this.enemySkeleton.setFlipX(true);
        // Create aniamtions for the player
        this.generateEnemy1Animations();
        // Collide the player with world bounds
        // this.player.setCollideWorldBounds(true);
        // Start the player in idle
        this.enemySkeleton.anims.play('skeleton-idle');
        
        // Creates the health bar for the enemy
        this.healthBar = this.add.rectangle(this.enemySkeleton.x, this.enemySkeleton.y - 50, 30, 7, 0x03fc5a);
        this.healthBar.setOrigin(0.5, 0.5);
        this.healthBar.setDepth(1);
        // this.enemySkeletonStats.hp = 10;
        // this.enemySkeletonStats.hpMax = this.enemySkeletonStats.hp;
    }

    setCollision(obj) {
        // Collision
        this.tileLayers.foreground.setCollisionBetween(0, 10000, true);
        this.physics.add.collider(this.tileLayers.foreground, obj, ()=>{
            // this.player.setVelocity(0);
        });
    }

    createPlayersAttackColliderObj() {
        if (!this.facingRight) {
            this.plrAtkHitbox = this.add.rectangle(this.player.x - 35, this.player.y + 25, 75, 100, 0xffffff, 0);
        }
        else if (this.facingRight) {
            this.plrAtkHitbox = this.add.rectangle(this.player.x + 35, this.player.y + 25, 75, 100, 0xffffff, 0);
        }
        // this.plrAtkHitbox = this.add.rectangle(this.player.x + 35, this.player.y + 25, 75, 100, 0xffffff, 0);
        this.plrAtkCollider = this.physics.add.existing(this.plrAtkHitbox)
        // this.plrAtkHitbox.setImmovable(true);
        // this.plrAtkHitbox.setAllowGravity(false);
        console.log("Hitbox created");
        this.setPlayersAttackCollider();
    }

    setPlayersAttackCollider() {
        // Creates a new collision handler
        this.playersAttackCollider = 
            this.physics.add.overlap(this.plrAtkHitbox, this.enemySkeleton, 
                (playerAtk, enemy) => {
                    // Destroy the collider
                    playerAtk.destroy();
                    console.log("Hit!");
                    // Deal damage to enemy
                    this.hp--;
                    if (!this.enemySkeletonDying) {
                        // Knockback enemy
                        enemy.anims.play('skeleton-hit');
                        // enemy.setVelocity(75, 200);
                        this.sound.play('player-atk', {
                            volume: 0.05,
                            
                        });
                        enemy.on('animationcomplete-skeleton-hit', ()=> {
                            enemy.anims.play('skeleton-idle');
                        });
                        // Destroy enemy if dead
                            if (this.hp <= 0) {
                                enemy.anims.play('skeleton-death');
                                enemy.on('animationcomplete-skeleton-death', ()=> {
                                    enemy.destroy();
                                    this.enemySkeletonDying = false;
                                });
                                this.enemySkeletonDying = true;
                            }
                    }
                });
    }

    generatePlayerAnimations() {
        // Create the idle animation
        this.player.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7]
            }),
            frameRate: 8,
            repeat: -1
        });
        // Create run animation
        this.player.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-run', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7]
            }),
            frameRate: 16,
            repeat: -1
        });
        // Create jump animation
        this.player.anims.create({
            key: 'jump-up',
            frames: this.anims.generateFrameNumbers('player-jump', {
                frames: [0, 1, 2, 3,]
            }),
            frameRate: 16,
        });
        this.player.anims.create({
            key: 'jump-down',
            frames: this.anims.generateFrameNumbers('player-jump', {
                frames: [4, 5, 6, 7]
            }),
            frameRate: 16,
        });
        // Create attack animation
        this.player.anims.create({
            key: 'atk1',
            frames: this.anims.generateFrameNumbers('player-attack', {
                frames: [0, 1, 2, 3, 4, 5, 6]
            }),
            frameRate: 16,
        });
        this.player.anims.create({
            key: 'atk2',
            frames: this.anims.generateFrameNumbers('player-attack', {
                frames: [6, 7, 8, 9,]
            }),
            frameRate: 16,
        });
        this.player.anims.create({
            key: 'atk3',
            frames: this.anims.generateFrameNumbers('player-attack', {
                frames: [10, 11, 12, 13]
            }),
            frameRate: 16,
        });
        this.player.anims.create({
            key: 'atk4',
            frames: this.anims.generateFrameNumbers('player-attack', {
                frames: [14, 15, 16, 17, 18, 19]
            }),
            frameRate: 16,
        });
    }

    generateEnemy1Animations() {
        // Create the idle animation
        this.enemySkeleton.anims.create({
            key: 'skeleton-idle',
            frames: this.anims.generateFrameNumbers('enemy-skeleton-idle', {
                frames: [0, 1, 2, 3]
            }),
            frameRate: 4,
            repeat: -1    
        });
        this.enemySkeleton.anims.create({
            key: 'skeleton-hit',
            frames: this.anims.generateFrameNumbers('enemy-skeleton-hit', {
                frames: [0, 1, 2, 3]
            }),
            frameRate: 8,   
        });
        this.enemySkeleton.anims.create({
            key: 'skeleton-death',
            frames: this.anims.generateFrameNumbers('enemy-skeleton-death', {
                frames: [0, 1, 2, 3]
            }),
            frameRate: 16,   
        });
    }

    spawnEnemy() {
        this.resetEnemyStuff();
        this.createEnemy1(800, 300);
        this.setCollision(this.enemySkeleton);
        this.enemySkeleton.setDepth(1);
    }

    resetEnemyStuff() {
        this.hp = 10;
        this.hpMax = this.hp;
    }
    
    debugStuff() {
        this.spawnEnemyButton = this.add.image(765, 100, 'spawn-enemy');
        this.spawnEnemyButton.setDepth(3);
        this.spawnEnemyButton.setFlipX(true);
        this.spawnEnemyButton.setScale(2.75);
        this.spawnEnemyButton.setInteractive();
        this.spawnEnemyButton.on('pointerdown', ()=> {
            this.spawnEnemy();
        });
    }

    setLastSwing() {
        this.lastSwing = this.now();
    }

    now() {
        return new Date().getTime();
    }
}