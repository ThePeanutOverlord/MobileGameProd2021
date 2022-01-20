class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        // Username, implement later
        this.username = "";
        // Player object
        this.player = null;
        // Speed of the player
        this.plySpd = 400;
        // Joystick object
        this.joystick = null;
        // Shooting variables
        this.shooting = false;
        this.lastShot = 0;
        // Time between player shots in ms
        this.shotTimeout = 500;
        // Lists of stuff
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.bulletEnemyCollider = null;
        this.bulletPlayerCollider = null;
        this.enemyPlayerCollider = null;
        // Timing of enemy spawns
        this.lastSpawned = 0;
        this.lastSpawned2 = 0;
        this.spawnTime = 3500;
        this.spawnTime2 = 25000;
        this.minSpawnTime = 1000;
        this.minSpawnTime2 = 2000;
        this.playerdead = false;
        // Variable to mark if the game is over
        this.gameOver = false;
        // Score counter
        this.score = 0;
        this.scoreText = null;
        // Firebase stuff
        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('Scores');
        //this.triplebullets = false;
        this.tbammo = 0; //default at 0, each powerup is 10
        this.plyhp = 3; //default at 2, each powerup is 1
        this.shield = 0; //default at 0, each powerup is 3
        this.hptext = null;
        this.tbtext = null;
        this.shieldtext = null;
    }

    init(data) {
        // Get the username from the title screen
        this.username = data.username;
        if (this.username == "") {
            // No username was provided
            this.username = "Ur Mom";
        }
    }

    preload() {
        // Spritesheets must also include width and height of frames when loading
        /* this.load.spritesheet('explosion', './assets/explosion-1.png', {
             frameWidth: 32,
             frameHeight: 32
         });*/
        this.load.image('bg', './assets/BG.png');
        this.load.image('bar', './assets/Table.png');
        this.load.image('hpicon', './assets/24.png');
        this.load.image('shieldicon', './assets/22.png');
        this.load.image('tbicon', './assets/21.png');
        //load audio
        this.load.audio('bgmusic', './assets/bgmusic.mp3');
        this.load.audio('fire', './assets/DoubleLaserShot.wav');
        this.load.audio('tbfire', './assets/DoubleMegaLaserShot.wav');
        this.load.audio('bounceoffshield', './assets/ElasticShieldAttack2.wav');
        this.load.audio('powerupgot', './assets/GetAPowerUp.wav');
        this.load.audio('boom', './assets/FunkyExplosion.wav');
        this.load.audio('gothit', './assets/MiniHit.wav');

        this.load.spritesheet('bullets', './assets/21.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('health', './assets/24.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('shield', './assets/22.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('explosion2', './assets/explosion-2.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        // Load the spaceship
        this.load.spritesheet('player', './assets/enemy-small.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        // Load the lasers
        this.load.spritesheet('lasers', './assets/spritesheet (1).png', {
            frameWidth: 32,
            frameHeight: 32
        });
        // Loading enemy ships
        this.load.spritesheet('enemy-m', './assets/Spaceship_01_RED.png', {
            frameWidth: 500,
            frameHeight: 500
        });
        this.load.spritesheet('enemy-h', './assets/Spaceship_03_RED.png', {
            frameWidth: 500,
            frameHeight: 500,
            scale: {
                x: 0.35,
                y: 0.35
            }
        });
    }

    create() {
        this.sound.play('bgmusic', {
            volume: 0.4
        });
        let background = this.add.image(225, 400, 'bg');
        background.setScale(.5);
        let statusbar = this.add.image(225, 40, 'bar');
        statusbar.setScale(1.25);
        statusbar.setOrigin(0.5, 0.5);
        statusbar.setDepth(1);
        // Create the text for keeping track of score
        this.scoreText = this.add.text(380, 40, `${this.score}`, {
            fontSize: '50px'
        });
        this.scoreText.setOrigin(.5, .5);
        this.scoreText.setDepth(2);
        // Create player object
        this.createPlayer();

        // A virtual joystick for moving the player
        this.joystick = new VirtualJoystick(this, 60, 740, 50);
        // Set up the shooting controls
        this.createShootingControls();
        // Setup collisions for bullet objects
        this.setCollideBullet();

        let hpicon = this.add.image(50, 40, 'hpicon');
        hpicon.setScale(.75);
        hpicon.setDepth(2);
        this.hptext = this.add.text(85, 25, `${this.plyhp}`, {
            fontSize: '30px',
            fontFamily: 'courier new',
            color: 'white'
        });
        this.hptext.setDepth(2);
        let shieldicon = this.add.image(150, 40, 'shieldicon');
        shieldicon.setScale(.75);
        shieldicon.setDepth(2);
        this.shieldtext = this.add.text(185, 25, `${this.shield}`, {
            fontSize: '30px',
            fontFamily: 'courier new',
            color: 'white'
        });
        this.shieldtext.setDepth(2);
        let tbicon = this.add.image(260, 40, 'tbicon');
        tbicon.setScale(.75);
        tbicon.setDepth(2);
        this.tbtext = this.add.text(305, 25, `${this.tbammo}`, {
            fontSize: '30px',
            fontFamily: 'courier new',
            color: 'white'
        });
        this.tbtext.setDepth(2);

    }

    update() {
        // Update the score text
        this.scoreText.setText(`${this.score}`);
        // Handle player movement
        //         if (cursors.left.isDown)         //taken from phaser docs, should be able to modify into good web controls
        // {
        //     player.setVelocityX(-160);

        //     player.anims.play('left', true);
        // }
        // else if (cursors.right.isDown)
        // {
        //     player.setVelocityX(160);

        //     player.anims.play('right', true);
        // }
        // else
        // {
        //     player.setVelocityX(0);

        //     player.anims.play('turn');
        // }

        // if (cursors.up.isDown && player.body.touching.down)
        // {
        //     player.setVelocityY(-330);
        // }

        this.player.setVelocity(this.joystick.joyX() * this.plySpd, 0);
        // If the player is holding the button, shoot
        if (this.shooting && this.now() > this.lastShot + this.shotTimeout) {
            if (this.tbammo > 0) {
                this.sound.play('tbfire', {
                    volume: 0.4
                });
                this.createBullet(this.player.x - 30, this.player.y - 80, false, false);
                this.createBullet(this.player.x, this.player.y - 80, false, false);
                this.createBullet(this.player.x + 30, this.player.y - 80, false, false);
                this.tbammo--;
            } else {
                this.sound.play('fire', {
                    volume: 0.3
                });
                this.createBullet(this.player.x, this.player.y - 80, false, false);
            }

            this.lastShot = this.now();
        }
        // Check for spawning enemies
        if (this.now() >= this.lastSpawned + this.spawnTime) {
            this.spawnEnemy();
        }

        if (this.now() >= this.lastSpawned2 + this.spawnTime2) {
            this.powerupspawn();
        }
        // Control the enemy ships
        for (let enemy of this.enemies) {
            enemy.ai.update();
        }
        // End the game if necessary
        if (this.gameOver) {
            this.onGameOver();
        }
        this.hptext.setText(`${this.plyhp}`);
        this.shieldtext.setText(`${this.shield}`);
        this.tbtext.setText(`${this.tbammo}`);
        // 2D movement
        // this.player.setVelocity(this.joystick.joyX() * this.plySpd,
        //     this.joystick.joyY() * this.plySpd);
    }

    createPlayer() {
        this.player = this.physics.add.sprite(225, 700, 'player');
        this.player.setScale(4);
        this.player.flipY = true;
        // Create aniamtions for the player
        this.generatePlayerAnimations();
        // Collide the player with world bounds
        this.player.setCollideWorldBounds(true);
        // Start the player in idle
        this.player.anims.play('idle');
    }

    createShootingControls() {
        // Handle shooting on desktop using spacebar
        this.input.keyboard.on('keydown-SPACE', () => {
            this.shooting = true;
        });
        this.input.keyboard.on('keyup-SPACE', () => {
            this.shooting = false;
        });

        // Create a button to shoot with on mobile
        let shootButton = this.add.circle(390, 740, 50, 0xFF0000, 0.4);
        shootButton.setInteractive();
        // When the player hits the button, start shooting
        shootButton.on('pointerdown', () => {
            this.shooting = true;
        });
        // If the player stops clicking, or moves the pointer out of the
        // button, stop shooting
        shootButton.on('pointerup', () => {
            this.shooting = false;
        });
        shootButton.on('pointerout', () => {
            this.shooting = false;
        });
    }

    createBullet(x, y, flipped, e) {
        // Creat the sprite object
        let bullet = this.physics.add.sprite(x, y, 'lasers');
        bullet.setScale(4);
        //bullet.setOrigin(.5,.5);
        bullet.rotation = 1.570796327;
        bullet.enemy = e;
        bullet.body.setSize(7, 32, true);
        // Create the animation
        bullet.anims.create({
            // Name of the animation
            key: 'bullet',
            // Generate all frame numbers between 0 and 7
            frames: this.anims.generateFrameNumbers('lasers', {
                start: 0,
                end: 3
            }),
            // Animation should be slower than base game framerate
            frameRate: 8,
            repeat: -1
        });
        bullet.used = false;
        
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
        this.setCollideBullet();
    }

    createEnemy(x, y, type, name) {
        let enemy = this.physics.add.sprite(x, y, `${name}`);
        enemy.setScale(.35);
        enemy.body.setSize(300, 300, true);
        enemy.dead = false;
        // enemy.setVelocity(0, .25 * this.plySpd);
        // Idle animation
        //this.tween.pause();
        /*  enemy.anims.create({
              key: 'idle',
              frames: this.anims.generateFrameNumbers(`${name}`, {
                  start: 0,
                  end: 0
              }),
              frameRate: 8,
              repeat: -1
          });  */
          enemy.gettinghurt = false;
        if (type == EnemyH) {
            enemy.hp = 3;
        } else {
            enemy.hp = 1;
        }

        // Explosion animation
        enemy.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion2', {
                start: 1,
                end: 15
            }),
            frameRate: 8,
            scaleX: 3,
            scaleY: 3

        });

        enemy.on(Phaser.Animations.Events.ANIMATION_START, function () {
            console.log("beans");
            enemy.setScale(3);

        }, enemy);


        if (enemy.dead) { //could try sticking this in update or bullet collision and sticking the animation start listener in it
            console.log("turds");
            enemy.setScale(3);

        }

        // At the end of explosion, die.
        enemy.on('animationcomplete-explode', () => {
            enemy.destroy();
        });
        // Play idle by default
        // enemy.anims.play('idle');
        // Attach an AI controller to this object
        enemy.ai = new type(this, enemy);     //changed to enemy H for test purposes for now
        // Add the bullet to the list of enemies
        this.enemies.push(enemy);
        this.setCollideBullet();
        // Rebuild the enemy and player collider
        this.setCollidePlayerEnemy();
    }

    createExplosion(x, y) {
        // Creat the sprite object
        let explosion = this.add.sprite(x, y, 'explosion2');
        explosion.setScale(4);
        // Create the animation
        explosion.anims.create({
            // Name of the animation
            key: 'boom',
            // Generate all frame numbers between 0 and 7
            frames: this.anims.generateFrameNumbers('explosion2', {
                start: 1,
                end: 15
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
                frames: [0, 1]
            }),
            frameRate: 12,
            repeat: -1
        });
        // Create left/right animations
        // Explosion animation
        this.player.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion2', {
                start: 1,
                end: 15
            }),
            frameRate: 8
        });
        // After the player is done exploding, we should have a callback
        this.player.on('animationcomplete-explode', () => {
            this.onPlayerExploded();
        });
    }

    /**
     * @returns The current time as a ms timestamp
     */
    now() {
        return new Date().getTime();
    }

    /**
     * Runs during update() if the "gameOver" flag has been set.
     * Resets the game.
     */
    onGameOver() {
        // Save the score
        this.saveScore();
        this.sound.stopAll();
        // Reset timers for enemy spawn
        this.lastSpawned = 0;
        this.spawnTime = 5000;
        // Destroy all the stuff
        this.player.destroy();
        for (let e of this.enemies) {
            e.destroy();
        }
        for (let b of this.bullets) {
            b.destroy();
        }
        // Stop running updates on enemies
        this.enemies = [];
        // Reset the bullets
        this.bullets = [];
        // Reset game over variable
        this.gameOver = false;
        this.playerdead = false;
        this.tbammo = 0;
        this.shield = 0;
        // Reset score
        this.score = 0;
        this.plySpd = 400;
        this.plyhp = 3;
        // Restart the game
        this.scene.start('TitleScene');
    }

    onPlayerExploded() {
        // The game will reset immediately when the player is done exploding.
        // Change this if you want multiple lives...
        this.gameOver = true;
    }

    /**
     * Saves the player's score to the firestore database
     */
    async saveScore() {
        let result = await this.scoreTable.add({
            Name: this.username,
            Score: this.score
        });
        if (result) console.log("Score saved successfully!");
        else console.log("Score failed to save!");
    }

    setCollideBullet() {
        // Destroy any existing colliders
        if (this.bulletEnemyCollider != null) {
            this.bulletEnemyCollider.destroy();
        }
        if (this.bulletPlayerCollider != null) {
            this.bulletPlayerCollider.destroy();
        }
        if (this.bulletpwrupCollider != null) {
            this.bulletpwrupCollider.destroy();
        }
        // Add collision with all existing bullets
        this.bulletEnemyCollider =
            this.physics.add.overlap(this.enemies, this.bullets,
                (en, bu) => {
                    if (bu.enemy == false && en.dead == false) { //not an enemy bullet



                        
                        console.log(en.hp);
                        console.log(en.dead);
                       
                        this.score++;
                        //set enemy as dead
                        en.dead = true;
                        // Destroy the bullet
                        bu.destroy();
                        // Make the enemy explode
                        // en.setScale(3);
                        this.sound.play('boom', {
                            volume: 0.2
                        });
                        en.anims.play('explode');
                        en.gettinghurt = false;
                        // Make the enemy "float" down
                        en.setVelocity(0, this.plySpd / 2);

                            this.enemies = this.enemies.filter((e) => {
                                return e !== en;
                            });
                        
                      
                        // Increase the player's score

                        // Remove the bullet from the list of bullets
                        this.bullets = this.bullets.filter((b) => {
                            return b !== bu;
                        });
                        // Remove the enemy from the list of enemies

                    }
                });

        // Add collision with player to all bullets
        this.bulletPlayerCollider =
            this.physics.add.overlap(this.bullets, this.player,
                (bullet, player) => {
                    // Destroy the bullet
                    if (bullet.enemy && !this.playerdead) {
                        if (this.shield > 0) {
                            this.sound.play('bounceoffshield', {
                                volume: 0.2
                            });
                            this.shield--;
                            console.log(this.shield);
                        } else {
                            this.sound.play('gothit', {
                                volume: 0.3
                            });
                            this.plyhp--;
                            console.log(this.plyhp);
                            if (this.plyhp <= 0) {
                                this.playerdead = true;
                                this.plySpd = 0;
                                // Blow up the player
                                this.sound.play('boom', {
                                    volume: 0.2
                                });
                                player.anims.play('explode');
                            }
                        }

                        bullet.destroy();

                        // Remove the bullet from the list of bullets
                        this.bullets = this.bullets.filter((b) => {
                            return b !== bullet;
                        });
                    }
                }
            );

        this.bulletpwrupCollider =
            this.physics.add.overlap(this.bullets, this.powerups,
                (bullet, pwrup) => {
                    if (!bullet.enemy && !pwrup.used) {
                        this.sound.play('powerupgot', {
                            volume: 0.2
                        });
                        pwrup.used = true;
                        this.poweringup(pwrup.type);
                        pwrup.destroy();
                        bullet.destroy();
                        console.log("powerup got");
                        this.bullets = this.bullets.filter((b) => {
                            return b !== bullet;
                        });
                    }
                }

            );
    }

    setCollidePlayerEnemy() {
        // Destroy any existing collision handler
        if (this.enemyPlayerCollider != null) {
            this.enemyPlayerCollider.destroy();
        }
        // Create a new collision handler
        this.enemyPlayerCollider =
            this.physics.add.overlap(this.enemies, this.player,
                (en, ply) => {
                    if (!en.dead && !this.playerdead) {
                        // Explode player and enemy
                        this.sound.play('boom', {
                            volume: 0.2
                        });
                        en.anims.play('explode');
                        if (this.shield > 0) {
                            this.shield--;
                            console.log(this.shield);
                        } else {
                            this.sound.play('gothit', {
                                volume: 0.3
                            });
                            this.plyhp--;
                            console.log(this.plyhp);
                            if (this.plyhp <= 0) {
                                this.plySpd = 0;
                                this.playerdead = true;
                                this.sound.play('boom', {
                                    volume: 0.2
                                });
                                ply.anims.play('explode');
                            }
                        }


                        // Set the enemy velocity to "float" down
                        en.setVelocity(0, this.plySpd / 2);
                        // Remove the enemy from the list of enemies
                        this.enemies = this.enemies.filter((e) => {
                            return e !== en;
                        });
                    }
                }
            );
    }

    setCollidePlayerPwrup() {
        if (this.pwrupPlayerCollider != null) {
            this.pwrupPlayerCollider.destroy();
        }
        // Create a new collision handler
        this.pwrupPlayerCollider =
            this.physics.add.overlap(this.powerups, this.player,
                (pwrup, ply) => {
                    if (!pwrup.used) {
                        this.sound.play('powerupgot', {
                            volume: 0.2
                        });
                        pwrup.used = true;
                        this.poweringup(pwrup.type);
                        pwrup.destroy();
                        console.log("powerup got");

                    }
                }
            );
    }

    /**
     * Spawns an enemy at a random location and sets spawn timer.
     * Different from createEnemy(), which only creates an enemy.
     */
    spawnEnemy() {
        // Pick a random x coordinate without set bounds
        // x will be between 25 and 425
        const x = (Math.random() * 375) + 50;
        let key = Math.random() * 10;
        if (key >= 5) {
            this.createEnemy(x, 0, EnemyH, 'enemy-h');
        } if (key < 5) {
            this.createEnemy(x, 0, EnemyM, 'enemy-m');
        }
        // Creates the actual enemy object at the given position
        //edit to create some of each type by passing in variables determined in this function randomly
        // Set the spawn timer and time between spawns
        this.lastSpawned = this.now();
        this.spawnTime *= .95;
        // Puts a hard limit on how small spawn time can get
        if (this.spawnTime < this.minSpawnTime) {
            this.spawnTime = this.minSpawnTime;
        }
    }

    poweringup(type) {
        if (type == 'triplebullets') { //stacks lmao
            this.tbammo += 10;
            console.log(this.tbammo);
        } else if (type == 'health') {
            if (this.plyhp < 3) {
                this.plyhp++;
                console.log(this.plyhp); //still need to actually implement player hp
            }

        } else if (type == 'shield') { //shield does stack now bc it's only worth 1pt
            this.shield += 1;
            console.log(this.shield);
        }
    }

    createpowerup(x, y, type, name) {
        console.log("in creator");
        let pwrup = this.physics.add.sprite(x, y, `${name}`);
        pwrup.setScale(.5);
        pwrup.type = type;
        pwrup.used = false;
        pwrup.setVelocity(0, this.plySpd * .15); //was .25 * this.plySpd

        if (pwrup.used) {
            pwrup.destroy();
        }

        this.powerups.push(pwrup);
        this.setCollideBullet();          //change so player can shoot to get it

        this.setCollidePlayerPwrup()
    }

    powerupspawn() {
        let key1 = (Math.random() * 10);
        console.log(key1);
        if (key1 <= 1) {
            let key2 = (Math.random() * 33);
            console.log("spawning");
            const i = (Math.random() * 400) + 25;
            if (key2 < 11) {
                this.createpowerup(i, 0, 'triplebullets', 'bullets')
            } else if (key2 >= 11 && key2 < 22) {
                this.createpowerup(i, 0, 'health', 'health')
            } else if (key2 >= 22) {
                this.createpowerup(i, 0, 'shield', 'shield')
            }
            this.lastSpawned2 = this.now();
            this.spawnTime2 *= .97;
            // Puts a hard limit on how small spawn time can get
            if (this.spawnTime2 < this.minSpawnTime2) {
                this.spawnTime2 = this.minSpawnTime2;
            }
        }

    }
}