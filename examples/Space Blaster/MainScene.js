class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        // Player object
        this.username = "bob";
        this.player = null;
        // Speed of the player
        this.plySpd = 400;
        // Joystick object
        this.joystick = null;
        // Shoot on mobile
        this.shootBtn = null;
        // Lists of stuff
        this.enemies = [];
        this.bullets = [];
        this.bulletEnemyCollider = null;
        this.bulletPlayerCollider = null;
        this.enemyPlayerCollider = null;
        // Timing of enemy spawns
        this.lastSpawned = 0;
        this.spawnTime = 5000;
        this.minSpawnTime = 100;
        //mark if game over
        this.gameover = false;
        this.score = 0;
        this.scoretext = null;
        //firebase stuff

        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('Scores');
    }

    init(){

        this.username = data.username;
        if(this.username == ""){
            this.username = "Dum";
        }
    }

    preload() {
        this.scoretext = this.add.text(225, 10, `${this.score}`,{
            fontSize: '40px'
        });
    
        // Spritesheets must also include width and height of frames when loading
        this.load.spritesheet('explosion', './assets/explosion-1.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        // Load the spaceship
        this.load.spritesheet('player', './assets/ship.png', {
            frameWidth: 16,
            frameHeight: 24
        });
        // Load the lasers
        this.load.spritesheet('lasers', './assets/laser-bolts.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        // Loading enemy ships
        this.load.spritesheet('enemy-m', './assets/enemy-medium.png', {
            frameWidth: 32,
            frameHeight: 16
        });
    }

    create() {
        // this.input.on('pointerdown', () => {
        //     let x = this.input.activePointer.x;
        //     let y = this.input.activePointer.y;
        //     // const {x, y} = this.input.activePointer;
        //     this.createExplosion(x, y);
        // });
        // Create player object
        this.player = this.physics.add.sprite(225, 700, 'player');
        this.player.setScale(4);
        // Create aniamtions
        this.generatePlayerAnimations();
        // Collide with world bounds
        this.player.setCollideWorldBounds(true);
        // Start the player in idle
        this.player.anims.play('idle');
        // Handle clicks on left or right side of screen
        // this.input.on('pointerdown', () => {
        //     if (this.input.activePointer.x < 220) {
        //         this.player.anims.play('left');
        //         this.player.setVelocity(-this.plySpd, 0);
        //     }
        //     else if (this.input.activePointer.x > 230) {
        //         this.player.anims.play('right');
        //         this.player.setVelocity(this.plySpd, 0);
        //     }
        // });
        // this.input.on('pointerup', () => {
        //     this.player.anims.play('idle');
        //     this.player.setVelocity(0);
        // });
        this.joystick = new VirtualJoystick(this, 60, 740, 50);
        // Handle shooting on desktop using spacebar
        this.input.keyboard.on('keydown-SPACE', () => {
            console.log("pew pew");
            this.createBullet(this.player.x, this.player.y - 80);
        });
        this.setBulletColliders();
    }

    update() {
        this.scoretext.setText(`${this.score}`);
        // Handle player movement
        // this.player.setVelocity(this.joystick.joyX() * this.plySpd,
        //     this.joystick.joyY() * this.plySpd);
        this.player.setVelocity(this.joystick.joyX() * this.plySpd, 0);
        // Check for spawning enemies
        if (this.now() >= this.lastSpawned + this.spawnTime) {
            const x = (Math.random() * 350) + 50;
            this.createEnemy(x, 0);
            this.lastSpawned = this.now();
            this.spawnTime *= .9;
            if (this.spawnTime < this.minSpawnTime) {
                this.spawnTime = this.minSpawnTime;
            }
        }
        // Control the enemy ships

        for (let enemy of this.enemies) {
            enemy.ai.update();
        }
        if(this.gameover){
            this.die();
        }
    }

    async saveScore(){
        let result = await this.scoreTable.add({
            Name:this.username,
            Score: this.score
        });
        if(result) console.log("score saved successfully");
        else console.log("score failed to save");
    }

    setBulletColliders() {
        // Destroy any existing collider
        if (this.bulletEnemyCollider != null) {
            this.bulletEnemyCollider.destroy();
        }
        if (this.bulletPlayerCollider != null) {
            this.bulletPlayerCollider.destroy();
        }
        // Add collision with all existing bullets
        this.bulletEnemyCollider =
            this.physics.add.overlap(this.enemies, this.bullets,
                (en, bu) => {
                    bu.destroy();
                    en.anims.play('explode');
                    en.setVelocity(0, this.plySpd / 2);
                    this.bullets = this.bullets.filter((b) => {
                        return b !== bu;
                    });
                    this.enemies = this.enemies.filter((e) => {
                        return e !== en;
                    });
                    this.score++;
                });
        // Add collision with player to all bullets
        this.bulletPlayerCollider =
            this.physics.add.overlap(this.bullets, this.player,
                (bullet, player) => {
                    bullet.destroy();
                    player.anims.play('explode');
                    this.bullets = this.bullets.filter((b) => {
                        return b !== bullet;
                    });
                }
            );
    }

    createBullet(x, y, flipped) {
        // Creat the sprite object
        let bullet = this.physics.add.sprite(x, y, 'lasers');
        bullet.setScale(4);
        // Create the animation
        bullet.anims.create({
            // Name of the animation
            key: 'bullet',
            // Generate all frame numbers between 0 and 7
            frames: this.anims.generateFrameNumbers('lasers', {
                start: 2,
                end: 3
            }),
            // Animation should be slower than base game framerate
            frameRate: 8,
            repeat: -1
        });
        // Run the animation
        bullet.anims.play('bullet');
        // Set the velocity
        if (flipped) {
            bullet.setVelocity(0, 600);
            bullet.setFlipY(true);
        } else {
            bullet.setVelocity(0, -600);
        }
        bullet.setCollideWorldBounds(true);
        // Turning this on will allow you to listen to the 'worldbounds' event
        bullet.body.onWorldBounds = true;
        // 'worldbounds' event listener
        bullet.body.world.on('worldbounds', (body) => {
            // Check if the body's game object is the sprite you are listening for
            if (body.gameObject === bullet) {
                // Destroy the bullet
                bullet.destroy();
            }
        });
        // Add the bullet to the list of bullets
        this.bullets.push(bullet);
        this.setBulletColliders();
    }

    createEnemy(x, y) {
        let enemy = this.physics.add.sprite(x, y, 'enemy-m');
        enemy.setScale(3);
        // enemy.setVelocity(0, .25 * this.plySpd);
        // Idle animation
        enemy.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('enemy-m', {
                start: 0,
                end: 1
            }),
            frameRate: 8,
            repeat: -1
        });
        // Explosion animation
        enemy.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            frameRate: 8
        });
        // At the end of explosion, die.
        enemy.on('animationcomplete-explode', () => {
            enemy.destroy();
        });
        // Play idle by default
        enemy.anims.play('idle');
        // Attach an AI controller to this object
        enemy.ai = new EnemyM(this, enemy);
        // Add the bullet to the list of enemies
        this.enemies.push(enemy);
        this.setBulletColliders();
        // Rebuild the enemy and player collider
        if (this.enemyPlayerCollider != null) {
            this.enemyPlayerCollider.destroy();
        }
        this.enemyPlayerCollider =
            this.physics.add.overlap(this.enemies, this.player,
                (en, ply) => {
                    
                    en.anims.play('explode');
                    ply.anims.play('explode');
                    en.setVelocity(0, this.plySpd / 2);
                    this.enemies = this.enemies.filter((e) => {
                        return e !== en;
                    });
                }
            );
    }

    createExplosion(x, y) {
        // Creat the sprite object
        let explosion = this.add.sprite(x, y, 'explosion');
        explosion.setScale(4);
        // Create the animation
        explosion.anims.create({
            // Name of the animation
            key: 'boom',
            // Generate all frame numbers between 0 and 7
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            // Animation should be slower than base game framerate
            frameRate: 8
        });
        // Run the animation
        explosion.anims.play('boom');
        // Create a callback for animation
        explosion.on('animationcomplete-boom', () => {
            explosion.destroy();
        });
    }

    generatePlayerAnimations() {
        // Create the idle animation
        this.player.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [2, 7]
            }),
            frameRate: 12,
            repeat: -1
        });
        // Create left/right animations
        this.player.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [0, 5]
            }),
            frameRate: 12,
            repeat: -1
        });
        this.player.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [4, 9]
            }),
            frameRate: 12,
            repeat: -1
        });
        // Explosion animation
        this.player.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            frameRate: 8
        });
        // Restart the game if we die
        this.player.on('animationcomplete-explode', () => {
            this.gameover = true;
         
        });
    }
    
    die(){
        this.saveScore();
        this.lastSpawned = 0;
        this.spawnTime = 5000;
        this.player.destroy();
        for(let e of this.enemies){
            e.destroy();
        };
        for(let b of this.bullets){
            b.destroy();
        }
        // Stop running updates on enemies
        this.enemies = [];
        this.bullets = [];
        // Restart the game
        this.gameover = false;
        this.score = 0;
        this.scene.start('TitleScene');
    }
    now() {
        return new Date().getTime();
    }
}