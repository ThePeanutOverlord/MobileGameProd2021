class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.player = null;
        this.cam = null;
        this.ptr = null;
        this.Distance = Phaser.Math.Distance;
        // Tilemap stuff
        this.tilemap = null;
        this.tileset = null;
        this.tileset2 = null;
        this.night = 1;
        this.tileLayers = {};
        this.mapObjects = [];
        // Character
        this.moving = 0; //-1 is to the left, 0 is idle, 1 is to the right
        // Speed of the player
        this.plySpd = 300;
        this.plymaxhp = 5;
        this.plyhp = this.plymaxhp;
        this.gethurt = false;
        this.plyatkdmg = 1;
        this.shootdmg = 1;
        this.lasthurt = 0;
        this.hurttimeout = 250;
        this.gameOver = false;
        // Joystick object
        this.joystick = null;
        this.enemies = [];
        // this.enemies = null;
        this.bullets = [];
        this.barriers = [];
        // this.barriers = null;
        this.shooting = false;
        this.lastShot = 0;
        this.attacking = false;
        this.lastattack = 0;
        this.atktimeout = 400;
        this.jumping = false;
        this.lastjump = 0;
        this.jumptimeout = 1000;
        this.jumpSpeed = 450;
        this.lastrepaired = 0;
        this.repaircooldown = 1000;
        // Time between player shots in ms
        this.shotTimeout = 250;
        this.repair = false;
        this.bulletEnemyCollider = null; //for player to shoot enemy
        this.playerEnemyCollider = null; //for player to attack enemy
        this.enemyPlayerCollider = null; //for enemy to attack player
        this.playerBarrierCollider = null;
        this.enemyBarrierCollider = null;
        this.heartPlayerCollider = null;
        this.lastSpawned = 0;
        this.spawnTime = 12000;
        this.minSpawnTime = 3000;
        this.lastmoved = 0;
        this.healthbar = null;
        this.hearts = [];
        this.signals = SignalManager.get();
        this.prices = [5, 5, 5, 5]; //prices of the melee, shooting, barrier upgrades in that order
        this.balance = 0;
        this.moneydropped = 1;
        this.username = "";
        this.startTime = null;
        this.timeText = null;
        this.timesurvived = null;
        this.menugo = null;
        this.menureturn = null;
        this.menutime = null;
        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('scores');
        // this.timeLimit = 180000;
    }

    preload() {
        this.load.audio('hit', './assets/Hurt.wav');
        this.load.audio('breaking', './assets/Crack.wav');
        this.load.audio('broken', './assets/Crack_3.wav');
        this.load.audio('collect', './assets/Collect.wav');
        this.load.audio('stab', './assets/SmoothWeaponAttack.wav');
        this.load.audio('die', './assets/ImpactMini.wav');
        this.load.audio('shoot', './assets/BulletSlam.wav');
        this.load.audio('bgmusic', './assets/Into the Dungeon.wav');

        this.load.image('Terrain winter', './assets/Seasonal Tilesets\/4 - Winter World\/Terrain (16 x 16).png');
        //this.load.image('Winter_entities (16 x 16)', './assets/Seasonal Tilesets\/4 - Winter World\/Winter_entities (16 x 16).png"');
        this.load.tilemapTiledJSON('map', './assets/map.json');
        this.load.image('bgimage', './assets/Background.png');
        this.load.image('repairicon', './assets/hammer icon.png');
        this.load.image('jumpicon', './assets/booticon.png');
        this.load.image('shooticon', './assets/arrowicon.png');
        this.load.image('meleeicon', './assets/knifeicon.png');
        this.load.image('pausebtn', './assets/pausebtn.png');

        this.load.spritesheet('heart', './assets/heart-pulse.png', {
            frameWidth: 15,
            framHeight: 15
        });
        this.load.spritesheet('player', './assets/red hood.png', {
            frameWidth: 112,
            frameHeight: 133,

        });
        this.load.spritesheet('playeridle', './assets/idle sheet.png', {
            frameWidth: 80,
            frameHeight: 80
        });
        this.load.spritesheet('zombie', './assets/Zombie.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('lasers', './assets/plybullet.png', {
            frameWidth: 130,
            frameHeight: 130
        });
        this.load.spritesheet('barrier', './assets/Destructible Objects.png', {
            frameWidth: 63,
            frameHeight: 63
        });
    }
    /**
     *  ██████   █████  ███    ███ ███████     ███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██ ███████ 
       ██       ██   ██ ████  ████ ██          ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██ ██      
       ██   ███ ███████ ██ ████ ██ █████       █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██ ███████ 
       ██    ██ ██   ██ ██  ██  ██ ██          ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██      ██ 
        ██████  ██   ██ ██      ██ ███████     ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████ ███████ 
                                                                                                                  
     */
    create() {
        this.sound.play('bgmusic', {
            volume: 0.3
        });
        let bgimage = this.add.image(400, 250, 'bgimage');
        bgimage.setScale(.6);
        this.healthbar = this.add.rectangle(400, 20, 200, 20, 0xdb5171);
        this.healthbar.setOrigin(0.5, 0.5);
        this.healthbar.setDepth(1);
        this.startTime = new Date().getTime();
        this.timeText = this.add.text(0, 0, "0:00");
        // this.barriers = this.physics.add.group({ immovable: true });
        // this.enemies = this.physics.add.group();
        // this.enemies.ai = new behavior(this, enemy);  
        this.createTilemap();
        this.createMenuButtons()
        this.createPlayer();
        this.joystick = new VirtualJoystick(this, 90, 345, 70);
        this.createButtonControls();
        this.createBarriers();
        // When the player hits the button, start shooting
        // shootButton.on('pointerdown', () => {
        //     this.shooting = true;
        // });
        this.setWorldCollisions();

    }
    init(data) {
        // Get the username from the title screen
        this.username = data.username;
        if (this.username == "") {
            // No username was provided
            this.username = "Some guy";
        }
    }
    /**
 * Saves the player's score to the firestore database
 */
    async saveScore() {
        console.log(this.username);
        console.log(this.timesurvived);
        let result = await this.scoreTable.add({
            name: this.username,
            score: this.timesurvived / 100
        });
        if (result) console.log("Score saved successfully!");
        else console.log("Score failed to save!");
    }
    createMenuButtons() {
        // Create a button to open tower menu
        let pBtn = this.add.image(750, 25, 'pausebtn');
        pBtn.setDepth(3);
        pBtn.setScale(2.5);
        pBtn.setInteractive();
        pBtn.on('pointerdown', () => {
            this.signals.emit("prices", this.prices);
            this.signals.emit("balance", this.balance);
            this.signals.emit("pausetimer", this.now());
            this.menugo = this.now();
            console.log(`timesurvived as leaving ${this.timesurvived}`);
            console.log(`leaving main ${this.menugo}`);

            // Disable this button
            pBtn.setAlpha(0);
            // Launch the menu

            this.scene.launch("MenuScene");
            this.scene.pause("MainScene");
        });
        // Listen for when the tower menu closes
        this.signals.on('menu-closed', (data) => {
            this.scene.resume('MainScene');
            // this.menutime = data;
            this.menureturn = this.now();

            this.menutime += (this.menureturn - this.menugo);
            console.log(`back in main: ${this.menutime}`);
            pBtn.setAlpha(1);
        });

        this.signals.on('end-game', (data) => {
            this.scene.resume('MainScene');
            this.menureturn = this.now();
            this.menutime += (this.menureturn - this.menugo);
            // this.timesurvived = new Date().getTime() - this.startTime - this.menutime;
            this.gameOver = true;
            //this.scene.launch('TitleScene');
            //this.scene.stop('MainScene');
        });

        this.signals.on('melee-bought', () => {
            if (this.balance >= this.prices[0]) {
                this.balance -= this.prices[0];
                this.prices[0] *= 2;
                this.plyatkdmg *= 1.5;
                this.signals.emit("balance", this.balance);
            }

        });
        this.signals.on('shooting-bought', () => {
            if (this.balance >= this.prices[1]) {
                this.balance -= this.prices[1];
                this.prices[1] *= 2;
                this.shootdmg *= 1.5;
                this.signals.emit("balance", this.balance);
            }
        });
        this.signals.on('barrier-bought', () => {
            if (this.balance >= this.prices[2]) {
                this.balance -= this.prices[2];
                this.prices[2] *= 2;

                for (let b of this.barriers) {
                    b.maxhp *= 1.5;
                    // b.hp = b.maxhp;
                }
                this.signals.emit("balance", this.balance);
            }
        });
        this.signals.on('money-bought', () => {
            if (this.balance >= this.prices[3]) {
                this.balance -= this.prices[3];
                this.prices[3] *= 2;
                this.moneydropped *= 2;
                this.signals.emit("balance", this.balance);
            }
        });


    }
    /**
 * @returns The current time as a ms timestamp
 */
    now() {
        return new Date().getTime();
    }
    update() {
        this.timesurvived = (new Date().getTime() - this.startTime) - this.menutime;


        if (!this.gameOver) {
            //from 9pm to 6am\
            // this.menutime = this.menureturn - this.menugo;
            // if(this.menutime != 0){
            // this.timesurvived = (this.timesurvived - this.m);
            // console.log(`menutime ${this.menutime}`);
            // console.log(`timesurvived: ${this.timesurvived}`);
            // this.menutime = 0;

            // this.timeText.setText(`${this.timesurvived.toFixed(2)}`);
            // }

            this.timeText.setText(`${this.timesurvived / 100}`);
            if (this.gethurt) {
                this.player.anims.play('takedmg');
            }
            this.healthbar.setScale((this.plyhp / this.plymaxhp), 1);
            this.Move();
            if (this.shooting && this.now() > this.lastShot + this.shotTimeout) {
                this.createBullet(this.player.x, this.player.y + 25);
                this.lastShot = this.now();
            }
            if (this.attacking && this.now() > this.lastattack + this.atktimeout) {
                this.player.anims.play('slash');
                this.lastattack = this.now();
            }

            if (this.moving > 0 || this.lastmoved == 1) {
                this.player.flipX = true;
            } else if (this.moving < 0 || this.lastmoved == 0) {
                this.player.flipX = false;
            }
            // if (this.joystick.joyY() < -0.2 && this.player.body.blocked.down) {
            //     this.player.setVelocityY(-this.jumpSpeed);
            // }

            for (let enemy of this.enemies) {
                enemy.healthbar.x = enemy.x;
                enemy.healthbar.y = enemy.y - 50;
                // console.log(`zombie velocity: ${enemy.body.velocity.x}`);
                if (enemy != null && enemy.body.velocity.x < 0 && !enemy.attacking && !enemy.dead && !enemy.hurt) {
                    enemy.anims.play('run', true);
                    enemy.flipX = true;
                } else if (enemy != null && enemy.body.velocity.x > 0 && !enemy.attacking && !enemy.dead && !enemy.hurt) {
                    enemy.anims.play('run', true);
                    enemy.flipX = false;
                } else if (enemy.body.velocity.x == 0 && !enemy.attacking && !enemy.dead && !enemy.hurt) {
                    enemy.anims.play('idle', true);
                }
                enemy.ai.update();
            }

            if (this.now() >= this.lastSpawned + this.spawnTime) {
                this.generateEnemies();
            }
        }
        if (this.gameOver) {
            this.onGameOver();
        }

        // console.log(this.player.setVelocity(this.joystick.joyX() * this.plySpd, 0));
    }
    onGameOver() {
        console.log(this.username);
        console.log(this.timesurvived);
        this.saveScore();
        // console.log(`in gameover: ${this.gameOver}`);
        this.sound.stopAll();
        // Reset timers for enemy spawn
        this.lastSpawned = 0;
        this.spawnTime = 15000;
        // Destroy all the stuff
        //this.player.destroy();
        for (let e of this.enemies) {
            e.destroy();
        }
        for (let b of this.bullets) {
            b.destroy();
        }
        for (let ba of this.barriers) {
            ba.destroy();
        }
        for (let h of this.hearts) {
            h.destroy();
        }
        // Stop running updates on enemies
        this.enemies = [];
        // Reset the bullets
        this.bullets = [];
        this.barriers = [];
        // Reset game over variable
        this.balance = 0;
        this.prices = [5, 5, 5, 5];
        this.plyatkdmg = 1;
        this.shootdmg = 1;
        this.moneydropped = 1;
        this.playerdead = false;

        this.plySpd = 300;
        this.plyhp = 5;
        this.startTime = 0;
        this.timeText = 0;
        this.timesurvived = 0;
        this.menugo = 0;
        this.menureturn = 0;
        this.menutime = 0;
        this.signals.destroy();
        this.signals = SignalManager.get();
        // Restart the game
        console.log(`Zombies: ${this.enemies.length}`);
        this.gameOver = false;
        this.scene.start('TitleScene');

    }
    /**
     *   ██████  ██████  ███    ██ ████████ ██████   ██████  ██      ███████ 
        ██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██      ██      
        ██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██      ███████ 
        ██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██           ██ 
         ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████ ███████ 
     * 
     */
    createButtonControls() {
        // Handle shooting on desktop using spacebar
        this.input.keyboard.on('keydown-SPACE', () => {
            this.shooting = true;
        });
        this.input.keyboard.on('keyup-SPACE', () => {
            this.shooting = false;
        });
        let actionicon = this.add.image(700, 320, 'repairicon');
        actionicon.setScale(2);
        actionicon.setDepth(3);
        let jumpicon = this.add.image(700, 420, 'jumpicon');
        jumpicon.setScale(2);
        jumpicon.setDepth(3);
        let shooticon = this.add.image(650, 370, 'shooticon');
        shooticon.setScale(2);
        shooticon.setDepth(3);
        let meleeicon = this.add.image(750, 370, 'meleeicon');
        meleeicon.setScale(2);
        meleeicon.setDepth(3);
        let shootButton = this.add.circle(650, 370, 30, 0x00FF00, 0.25);
        let atkButton = this.add.circle(750, 370, 30, 0xFF0000, 0.25);
        let itmButton = this.add.circle(700, 320, 30, 0x0000FF, 0.25);
        let jumpButton = this.add.circle(700, 420, 30, 0x00FFFF, 0.25);
        shootButton.setInteractive();
        shootButton.setDepth(3);
        atkButton.setInteractive();
        atkButton.setDepth(3);
        itmButton.setInteractive();
        itmButton.setDepth(3);
        jumpButton.setInteractive();
        jumpButton.setDepth(3);


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

        atkButton.on('pointerdown', () => {
            this.sound.play('stab', {
                volume: 0.2
            });
            this.attacking = true;
        });
        // If the player stops clicking, or moves the pointer out of the
        // button, stop shooting
        atkButton.on('pointerup', () => {
            this.attacking = false;
        });
        atkButton.on('pointerout', () => {
            this.attacking = false;
        });

        itmButton.on('pointerdown', () => {
            if (this.now() > this.lastrepaired + this.repaircooldown) {
                this.repair = true;
            }


        });
        // If the player stops clicking, or moves the pointer out of the
        // button, stop shooting
        itmButton.on('pointerup', () => {
            this.repair = false;
        });
        itmButton.on('pointerout', () => {
            this.repair = false;
        });

        jumpButton.on('pointerdown', () => {
            if (this.player.body.blocked.down) {
                this.jumping = true;
                this.player.anims.play("jump",true);
                this.player.setVelocityY(-this.jumpSpeed);
            }
        });

        jumpButton.on('pointerup', () => {
            this.jumping = false;
        });
        jumpButton.on('pointerout', () => {
            this.jumping = false;
        });
    }

    Move() {    //add web controls later probably
        if (!this.gameOver) {
            if (!this.gethurt) {
                this.moving = this.joystick.joyX();
                this.player.setVelocityX(this.moving * this.plySpd);
            }

            // if(!this.shooting && !this.gethurt && !this.attacking && !this.jumping){
            //     if(this.moving > 0){
            //         this.lastmoved = 1;
            //         this.player.anims.play('run', true);
            //     }else if( this.moving < 0){
            //         this.lastmoved = 0; 
            //         this.player.anims.play('run', true);
            //     }else if(this.moving == 0){
            //         this.player.anims.play('idle unbroken', true);
            //     }
            // }

            // if (cursors.left.isDown)         //taken from phaser docs, should be able to modify into good web controls
            // {
            //     player.setVelocityX(-this.plySpd);

            //     // player.anims.play('left', true);
            // }
            // else if (cursors.right.isDown) {
            //     player.setVelocityX(this.plySpd);

            //     // player.anims.play('right', true);
            // }
            // else {
            //     player.setVelocityX(0);

            //     // player.anims.play('turn');
            // }

            // if (cursors.up.isDown && player.body.touching.down) {
            //     player.setVelocityY(-this.jumpSpeed);
            // }
            if (this.moving > 0 && !this.shooting && !this.gethurt && !this.attacking && !this.jumping) {
                //this.player.anims.pause('idle');
                this.lastmoved = 1;
                this.player.anims.play('run', true);

            } else if (this.moving < 0 && !this.shooting && !this.gethurt && !this.attacking && !this.jumping) {
                // this.player.anims.pause('idle');
                this.lastmoved = 0;
                this.player.anims.play('run', true);

            } else if (!this.shooting && !this.gethurt && !this.attacking && !this.jumping) {
                //this.player.flipX = true;
                //this.player.body.Y += 53;
                this.player.anims.play('idle unbroken', true);
            }

        }

        // console.log(`moving ${this.moving}`);
    }
    generateEnemies() {
        if (!this.gameOver) {
            let key = Math.floor(Math.random() * 5 + 1);
            //console.log(key);
            let Object = this.mapObjects.filter((obj) => {
                return obj.name == `z${key}`;
            })[0];
            //const x = (Math.random() * 375) + 50;
            this.createEnemy(Object.x, Object.y);

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
    }

    enemyAttack(en, bar) {
        if (!en.dead && !bar.dead) {
            // console.log("attacking");
            en.setVelocityX(0);

            en.onCollide = true;
            en.attacking = true;
            if (this.now() > en.lastattack + en.atktimeout) {
                this.sound.play('breaking', {
                    volume: 0.2
                });
                en.lastattack = this.now();

                en.anims.play('atk');
                //  console.log(en.lastattack);
                //  en.colliding = true;
                // Explode player and enemy
                //timedEvent = this.time.addEvent({ delay: 2000, callback: attack, callbackScope: this, repeat: 4 });

                // let i = setInterval(() => {
                bar.hp--;
                bar.healthbar.setScale((bar.hp / bar.maxhp), 1);
                bar.anims.play('gethit');
                console.log(`barrier: ${bar.hp}`);


                if (bar.hp <= 0) {
                    //en.setVelocity(0, 0);
                    this.sound.play('broken', {
                        volume: 0.2
                    });
                    bar.dead = true;
                    bar.anims.play('break', true);
                    bar.anims.play('dead', true);
                    en.attacking = false;
                    en.onCollide = false;
                    en.body.resetFlags();
                    // clearInterval(i);
                    //en.setVelocityX(.25 * this.plySpd)
                }
            }
            //en.attacking = false;

        } else if (bar.dead) {
            en.attacking = false;
            en.onCollide = false;
        }
    }
    playerGetHurt(en) {
        this.gethurt = true;
        this.player.setVelocityX(0);
        this.plyhp--;
        this.sound.play('hit', {
            volume: 0.2
        });
        // this.player.anims.stop('idle unbroken');
        en.anims.play('atk', true);
        this.player.anims.play('takedmg', true);
        en.lastattack = this.now();


        en.attacking = true;
        this.gethurt = false;

        //console.log(en.lastattack);
    }
    /**
     *   ██████ ██████  ███████  █████ ████████  ██████  ██████  ███████ 
        ██      ██   ██ ██      ██   ██   ██    ██    ██ ██   ██ ██      
        ██      ██████  █████   ███████   ██    ██    ██ ██████  ███████ 
        ██      ██   ██ ██      ██   ██   ██    ██    ██ ██   ██      ██ 
         ██████ ██   ██ ███████ ██   ██   ██     ██████  ██   ██ ███████                                                            
     */

    createTilemap() {
        this.tilemap = this.add.tilemap('map');
        this.tileset = this.tilemap
            .addTilesetImage('Terrain winter', 'Terrain winter');
        //this.tileset2 = this.tilemap.addTilesetImage('Winter_entities (16 x 16)', 'Winter_entities (16 x 16)');
        let background = this.tilemap
            .createLayer('bg', this.tileset, 0, 0);
        background.setDepth(0);
        let foreground = this.tilemap
            .createLayer('fg', this.tileset, 0, 0);
        foreground.setDepth(1);
        // let overhead = this.tilemap
        //     .createLayer('overhead', this.tileset, 0, 0);
        // overhead.setDepth(2);
        // Add the layers to layer object
        this.tileLayers = {
            bg: background,
            fg: foreground,
            // overhead: overhead
        }
        // Process objects
        let objectLayer = this.tilemap.getObjectLayer('spawn');
        this.mapObjects = objectLayer.objects;
    }
    setWorldCollisions() {
        // Collision
        this.tileLayers.fg.setCollisionBetween(0, 10000, true);
        this.physics.add.collider(this.tileLayers.fg, this.player);
        // this.physics.add.collider(this.tileLayers.fg, this.enemies);
        this.physics.add.collider(this.tileLayers.fg, this.barriers);
    }

    createPlayer() {
        let playerObject = this.mapObjects.filter((obj) => {
            return obj.name == "player";
        })[0];
        this.player = this.physics.add.sprite(playerObject.x, playerObject.y, 'player');
        // this.player = this.physics.add.sprite(400, 225, 'player', {
        //     // displayOriginX: .5,
        //     //  displayOriginY: .5,
        //     // displayHeight: 50,
        //     // displayWidth: 20 
        // });
        this.player.setScale(2);
        //this.player.setGravityY(100);
        this.player.body.setOffset(47, 65);
        // this.player.body.y -= 20;

        this.player.body.setSize(20, 32, false);

        // this.player.flipY = true;
        // Create aniamtions for the player
        this.generatePlayerAnimations();
        // Collide the player with world bounds
        this.player.setCollideWorldBounds(true);
        // Start the player in idle
        this.player.anims.play('idle unbroken');
        this.collideBarrier();

    }
    createBarriers() {
        for (let i = 1; i < 6; i++) {
            let Object = this.mapObjects.filter((obj) => {
                return obj.name == `b${i}`;
            })[0];
            // let bar = this.barriers.create(Object.x, Object.y, 'barrier');
            // this.physics.add.existing(bar);
            // bar.body.setImmovable();
            let bar = this.physics.add.sprite(Object.x, Object.y, `b${i}`);
            bar.body.setOffset(20, 22);
            let healthb = this.add.rectangle(Object.x + 8, Object.y - 35, 60, 10, 0x00AA00);
            healthb.setOrigin(0.5, 0.5);
            healthb.setDepth(1);
            bar.healthbar = healthb;
            // this.player.body.y -= 20;
            bar.setScale(3);
            bar.body.setSize(30, 25, false);
            bar.maxhp = 6;
            bar.hp = bar.maxhp;
            bar.setDepth(2);
            bar.dead = false;
            bar.setImmovable(true);
            bar.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('barrier', {
                    frames: [0]

                }),
                frameRate: 12,
                repeat: -1
            });

            bar.anims.create({
                key: 'gethit',
                frames: this.anims.generateFrameNumbers('barrier', {
                    // frames: [0, 0]
                    start: 0,
                    end: 2
                }),
                frameRate: 6,
                repeat: 1
            });
            bar.anims.create({
                key: 'break',
                frames: this.anims.generateFrameNumbers('barrier', {
                    // frames: [0, 0]
                    start: 7,
                    end: 13
                }),
                frameRate: 8,
                repeat: 0
            });
            bar.anims.create({
                key: 'dead',
                frames: this.anims.generateFrameNumbers('barrier', {
                    frames: [13]
                    // start: 8,
                    // end: 14
                }),
                frameRate: 4,
                repeat: -1
            });
            bar.anims.create({
                key: 'repair',
                frames: this.anims.generateFrameNumbers('barrier', {
                    // frames: []
                    start: 13,
                    end: 7
                }),
                frameRate: 4,
                repeat: 0
            });

            bar.anims.play('idle');
            this.barriers.push(bar);
            this.collideBarrier();
            // console.log(this.barriers);
        }

    }

    createEnemy(x, y) {
        // let enemy = this.enemies.create(x, y, 'zombie');
        // this.physics.add.existing(enemy);
        // enemy.body.setImmovable();
        let enemy = this.physics.add.sprite(x, y, 'zombie');
        enemy.setScale(2);
        let bar = this.add.rectangle(x, y - 50, 60, 10, 0x00FF00);
        bar.setOrigin(0.5, 0.5);
        bar.setDepth(1);
        enemy.healthbar = bar;
        //enemy.body.setSize(300, 300, true);
        enemy.dead = false;
        enemy.attacking = false;
        enemy.hurt = false;
        enemy.lastattack = 0;
        enemy.atktimeout = 2000;
        enemy.moving = false;
        enemy.setDepth(1);
        enemy.maxhp = 5;
        enemy.hp = enemy.maxhp;
        enemy.onCollide = false;
        if (enemy.x > 400) {
            enemy.flipX = true;
            // enemy.setVelocityX(-.25*this.plySpd);
        } else if (enemy.x < 400) {
            enemy.flipX = false;
            // enemy.setVelocityX(.25*this.plySpd);
        }
        // enemy.setVelocity(0, .25 * this.plySpd);
        this.generateEnemyAnimations(enemy);
        // Play idle by default
        enemy.anims.play('run');
        this.player.setCollideWorldBounds(true);
        // Attach an AI controller to this object
        enemy.ai = new behavior(this, enemy);     //changed to enemy H for test purposes for now
        // Add the bullet to the list of enemies
        // this.physics.add.collider(this.barriers, enemy);
        enemy.on('animationcomplete-die', () => {
            //setInterval(() => {
            this.tweens.add({
                // List of things to affect
                targets: [enemy],
                // Duration of animation in ms
                duration: 1000,
                // Alpha is transparency, 0 means invisible
                alpha: 0,

                onComplete:
                    () => {
                        this.enemies = this.enemies.filter((e) => {
                            return e !== enemy;
                        });
                        //enemy.ai.destroy();
                        let key = Math.floor(Math.random() * 5 + 1);
                        console.log(key);
                        if (key <= 3) {
                            this.createHeart(enemy.x, enemy.y);
                        }

                        enemy.healthbar.destroy();
                        enemy.destroy();
                    }
            });
            //clearInterval(i);
            // }, 3000);

        });
        this.physics.add.collider(this.tileLayers.fg, enemy);
        this.enemies.push(enemy);
        // this.healthbars.push(healthbar);
        this.setCollideBullet();
        this.collideBarrier();
        // Rebuild the enemy and player collider
        this.setCollidePlayerEnemy();
        console.log(`Zombies: ${this.enemies.length}`);
    }


    createBullet(x, y) {
        // Creat the sprite object
        // if (this.moving > 0 || this.lastmoved == 1) {
        //     x += 40;
        // } else if (this.moving < 0 || this.lastmoved == 0) {
        //     x -= 40;
        // }
        this.player.anims.play('shoot');
        let bullet = this.physics.add.sprite(x, y, 'lasers');
        bullet.body.setAllowGravity(false);
        bullet.setDepth = 1;
        // bullet.flipY = true;
        bullet.setScale(1.5);
        //bullet.setOrigin(.5,.5);
        if (this.moving > 0 || this.lastmoved == 1) {

            bullet.flipX = true;
            bullet.setVelocity(600, 0);
        } else if (this.moving < 0 || this.lastmoved == 0) {

            bullet.flipX = false;
            bullet.setVelocity(-600, 0);
        }

        bullet.body.setSize(32, 7, true);
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
        // Run the animation
        bullet.anims.play('bullet');

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
        this.sound.play('shoot', {
            volume: 0.2
        });
        // Add the bullet to the list of bullets
        this.bullets.push(bullet);
        this.setCollideBullet();
    }

    createHeart(x, y) {
        let h = this.physics.add.sprite(x, y, 'heart');
        h.setDepth(1);
        h.setScale(1.5);

        h.anims.create({
            // Name of the animation
            key: 'float',
            // Generate all frame numbers between 0 and 7
            frames: this.anims.generateFrameNumbers('heart', {
                start: 0,
                end: 5
            }),
            // Animation should be slower than base game framerate
            frameRate: 4,
            repeat: -1
        });
        let i = setInterval(() => {
            this.tweens.add({
                // List of things to affect
                targets: [h],
                // Duration of animation in ms
                duration: 5000,
                // Alpha is transparency, 0 means invisible
                alpha: 0,

                onComplete:
                    () => {
                        this.hearts = this.hearts.filter((e) => {
                            return e !== h;
                        });

                        h.destroy();
                    }
            });
            clearInterval(i);
        }, 10000);
        console.log("heart made");
        // this.tweens.play
        h.anims.play('float');
        this.collideHearts();
        this.physics.add.collider(this.tileLayers.fg, h);
        this.hearts.push(h);
    }

    /**
     *   ██████  ██████  ██      ██      ██ ███████ ██  ██████  ███    ██ ███████ 
        ██      ██    ██ ██      ██      ██ ██      ██ ██    ██ ████   ██ ██      
        ██      ██    ██ ██      ██      ██ ███████ ██ ██    ██ ██ ██  ██ ███████ 
        ██      ██    ██ ██      ██      ██      ██ ██ ██    ██ ██  ██ ██      ██ 
         ██████  ██████  ███████ ███████ ██ ███████ ██  ██████  ██   ████ ███████ 
     */

    collideHearts() {
        if (this.heartPlayerCollider != null) {
            this.heartPlayerCollider.destroy();
        }

        this.heartPlayerCollider =
            this.physics.add.overlap(this.player, this.hearts,
                (ply, h) => {
                    console.log("heart got");
                    this.sound.play('collect', {
                        volume: 0.2
                    });
                    if (this.plyhp < this.plymaxhp) {
                        this.plyhp++;
                    }

                    this.hearts = this.hearts.filter((j) => {
                        return j !== h;
                    });
                    h.destroy();
                });

    }
    collideBarrier() {
        if (this.enemyBarrierCollider != null) {
            this.enemyBarrierCollider.destroy();
        }
        if (this.playerBarrierCollider != null) {
            this.playerBarrierCollider.destroy();
        }

        // Create a new collision handler
        this.enemyBarrierCollider =
            this.physics.add.overlap(this.enemies, this.barriers,
                (en, bar) => {
                    // if(en){
                    // console.log("overlap collider activated");
                    this.enemyAttack(en, bar);
                    // // }
                    // if (!en.dead && !bar.dead) {
                    //     // en.body.embedded = true;
                    //     // bar.body.embedded = true;
                    //     en.colliding = true;
                    //     // Explode player and enemy
                    //     //timedEvent = this.time.addEvent({ delay: 2000, callback: attack, callbackScope: this, repeat: 4 });

                    //     // let i = setInterval(() => {
                    //         bar.hp--;
                    //         bar.anims.play('gethit');
                    //         console.log(bar.hp);


                    //         if (bar.hp <= 0) {
                    //             //en.setVelocity(0, 0);
                    //             bar.dead = true;
                    //             bar.anims.play('break');
                    //             bar.anims.play('dead');
                    //             en.attacking = false;
                    //             en.colliding = false;
                    //             // clearInterval(i);
                    //             //en.setVelocityX(.25 * this.plySpd)
                    //         }
                    //         // if(en.dead){
                    //         //   clearInterval(i);
                    //         // }
                    //     // }, 2000);
                    //     //this.plySpd = 0;
                    //     //this.moving = 0;



                    //     // console.log(this.plySpd);
                    //     // this.plySpd = 400;

                    //     // this.gethurt = false;
                    //     // en.setVelocity(0, 0);
                    // }

                }
            );

        this.playerBarrierCollider =
            this.physics.add.overlap(this.player, this.barriers,
                (ply, bar) => {
                    if (this.repair && bar.hp < bar.maxhp) {
                        // Explode player and enemy
                        this.sound.play('collect', {
                            volume: 0.2
                        });
                        bar.hp = bar.maxhp;

                        bar.healthbar.setScale((bar.hp / bar.maxhp), 1);
                        // bar.dead = false;
                        if (bar.dead) {
                            bar.anims.play('repair');
                            bar.dead = false;
                        }
                        console.log(`barrier repaired: ${bar.hp}`);
                    }
                }
            );
    }
    setCollideBullet() {
        if (this.bulletEnemyCollider != null) {
            this.bulletEnemyCollider.destroy();
        }
        if (this.playerEnemyCollider != null) {
            this.bulletEnemyCollider.destroy();
        }
        // Add collision with all existing bullets
        this.bulletEnemyCollider =
            this.physics.add.overlap(this.enemies, this.bullets,
                (en, bu) => {
                    if (en.dead == false) { //not an enemy bullet
                        // Increase the player's score
                        //  this.score++;
                        //set enemy as dead
                        this.sound.play('hit', {
                            volume: 0.2
                        });
                        en.hurt = true;
                        en.hp -= this.shootdmg;
                        if (en.hp >= 0) {
                            en.healthbar.setScale((en.hp / en.maxhp), 1);
                        }

                        en.anims.play('dmg');
                        if (en.hp <= 0) {
                            en.healthbar.setScale(0, 1);
                            this.sound.play('die', {
                                volume: 0.2
                            });
                            this.balance += this.moneydropped;
                            en.anims.play('die');
                            en.setVelocity(0, 0);
                            en.dead = true;


                            // en.destroy();
                        }

                        // Destroy the bullet
                        bu.destroy();
                        // Make the enemy explode
                        // en.setScale(3);

                        en.hurt = false;
                        // Make the enemy "float" down

                        // Remove the bullet from the list of bullets
                        this.bullets = this.bullets.filter((b) => {
                            return b !== bu;
                        });
                        // Remove the enemy from the list of enemies

                    }
                });
        //enemy.hurt = false;

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

                        en.onCollide = true;
                        en.setVelocityX(0);
                        if (this.now() > en.lastattack + en.atktimeout && !this.attacking) {
                            en.anims.play('atk', true);
                            this.playerGetHurt(en);

                        }
                        // this.player.setVelocityX()

                        if (this.now() > this.lastattack + this.atktimeout && this.attacking) {
                            console.log("player attacking");
                            this.sound.play('stab', {
                                volume: 0.2
                            });
                            this.gethurt = false;
                            en.attacking = false;
                            en.hurt = true;
                            //  console.log(en.hp);

                            en.hp -= this.plyatkdmg;
                            en.healthbar.setScale((en.hp / en.maxhp), 1);

                            en.anims.play('dmg', true);
                            if (en.hp <= 0) {
                                this.sound.play('die', {
                                    volume: 0.2
                                });
                                this.balance += this.moneydropped;
                                en.setVelocity(0, 0);
                                en.dead = true;
                                en.onCollide = false;
                                en.anims.play('die');
                                // en.destroy();
                            }
                        }

                        // console.log(this.plySpd);
                        // this.plySpd = 400;
                        // en.attacking = false;


                        // en.setVelocity(0, 0);


                        console.log(this.plyhp);
                        if (this.plyhp <= 0) {
                            this.sound.play('die', {
                                volume: 0.2
                            });
                            this.plySpd = 0;
                            this.playerdead = true;
                            this.gameOver = true;
                            this.gethurt = false;
                            en.onCollide = false;
                            //ply.anims.play('die');
                        }
                        en.hurt = false;
                        en.onCollide = false;
                        en.attacking = false;
                        this.gethurt = false;
                        console.log(en.attacking);
                        // Remove the enemy from the list of enemies
                        // this.enemies = this.enemies.filter((e) => {
                        //     return e !== en;
                        // });
                    }
                }
            );

    }

    /**
     *   █████  ███    ██ ██ ███    ███  █████ ████████ ██  ██████  ███    ██ ███████ 
        ██   ██ ████   ██ ██ ████  ████ ██   ██   ██    ██ ██    ██ ████   ██ ██      
        ███████ ██ ██  ██ ██ ██ ████ ██ ███████   ██    ██ ██    ██ ██ ██  ██ ███████ 
        ██   ██ ██  ██ ██ ██ ██  ██  ██ ██   ██   ██    ██ ██    ██ ██  ██ ██      ██ 
        ██   ██ ██   ████ ██ ██      ██ ██   ██   ██    ██  ██████  ██   ████ ███████ 
     */

    generateEnemyAnimations(enemy) {
        enemy.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('zombie', {
                // frames: [0, 0]
                start: 0,
                end: 7
            }),
            frameRate: 12,
            repeat: -1
        });

        enemy.anims.create({
            key: 'atk',
            frames: this.anims.generateFrameNumbers('zombie', {
                // frames: [0, 0]
                start: 13,
                end: 19
            }),
            frameRate: 19,
            repeat: 0
        });

        enemy.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('zombie', {
                // frames: [0, 0]
                start: 26,
                end: 33
            }),
            frameRate: 7,
            repeat: 0
        });
        enemy.anims.create({
            key: 'dierunning',
            frames: this.anims.generateFrameNumbers('zombie', {
                // frames: [0, 0]
                start: 39,
                end: 60
            }),
            frameRate: 12,
            repeat: 0
        });
        enemy.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNumbers('zombie', {
                // frames: [0, 0]
                start: 64,
                end: 72
            }),
            frameRate: 7,
            repeat: 0
        });
        enemy.anims.create({
            key: 'dmg',
            frames: this.anims.generateFrameNumbers('zombie', {
                frames: [64, 65, 66, 0]
                //  start: 64,
                // end: 66
            }),
            frameRate: 7,
            repeat: 0
        });
    }
    generatePlayerAnimations() {
        // Create the idle animation
        this.player.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('playeridle', {
                //frames: [0, 17]
                start: 0,
                end: 17
            }),
            frameRate: 12,
            repeat: -1
        });
        this.player.anims.create({
            key: 'idle unbroken',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [0, 0]
                // start: 0,
                // end: 17
            }),
            frameRate: 12,
            repeat: 0
        });
        this.player.anims.create({ //make sure to flip if going the other way
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', {
                start: 1,
                end: 24
            }),
            frameRate: 24,
            repeat: 0
        });

        this.player.anims.create({ //make sure to flip if going the other way
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('player', {
                start: 25,
                end: 33
            }),
            frameRate: 12,
            repeat: 0
        });

        this.player.anims.create({ //could also turn this into a good falling anim
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player', {
                // frames: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]
                start: 34,
                end: 51
            }),
            frameRate: 15,
            repeat: 0
        });

        this.player.anims.create({
            key: 'slide',
            frames: this.anims.generateFrameNumbers('player', {
                //frames: [0, 17]
                start: 52,
                end: 55
            }),
            frameRate: 12,
            repeat: -1
        });

        this.player.anims.create({ //could maybe separate into different anims to diversify
            key: 'slash',
            frames: this.anims.generateFrameNumbers('player', {
                //frames: [0, 17]
                start: 56,
                end: 79
            }),
            frameRate: 20,
            repeat: 0
        });
        this.player.anims.create({
            key: 'bighit',
            frames: this.anims.generateFrameNumbers('player', {
                //frames: [0, 17]
                start: 80,
                end: 119
            }),
            frameRate: 20,
            repeat: 0
        });
        this.player.anims.create({
            key: 'takedmg',
            frames: this.anims.generateFrameNumbers('player', {
                //frames: [0, 17]
                start: 120,
                end: 126
            }),
            frameRate: 10,
            repeat: 0
        });

    }
}