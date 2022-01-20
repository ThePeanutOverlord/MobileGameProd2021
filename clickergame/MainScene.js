class MainScene extends Phaser.Scene {

    // This is where we define data members
    constructor() {
        super("MainScene");
        // Monster variables
        this.monsterImage = null;
        this.hp = 5;
        this.name = null;
        this.hpText = null;
        this.crystalsText = null;
        // Levels in upgrades
        this.levels = {
            tap: 1,
            knight: 0
        }

        this.bg = null;
        // Status of monster
        this.alive = false;
        this.stage = 0;
        this.levelup = false;
        this.lvltext = null;
        this.maxlevel = 9;
        this.tween;
        this.lvlprice = null;
        this.lvlpricelabel = null;
        this.taplvllabel = null;
        this.tappricelabel = null;
        this.knightlvllabel = null;
        this.knightpricelabel = null;
    }

    // Runs before entering the scene, LOAD IMAGES AND SOUND HERE
    preload() {
        for (let i = 0; i < LEVELDATA.length; i++) {
            this.load.image("bgimage", `./assets/${LEVELDATA[i].bg}`)
        }
        // this.load.image('kraken', './assets/kraken.png');
        // Loop through monster configuration and load each image
        for (let j = 0; j < MONSTERS.length; j++) {
            for (let i = 0; i < MONSTERS[j].length; i++) {
                this.load.image(MONSTERS[j][i].name, `./assets/${MONSTERS[j][i].image}`);
            }
        }

        this.load.image('knight', './assets/knighthelmet.png'); //gonna change these
        this.load.image('chest', './assets/chest.png');
        this.load.image('crystals', './assets/crystals.png');
        this.load.image('sword', './assets/sword.png');
        // Load sound effects
        this.load.audio('hit', './assets/DefiniteHit.wav');
        this.load.audio('powerup', './assets/NewAbilityOrUpgradeAvailable.wav');
        this.load.audio('death', './assets/DestroyMonster2.wav');
        //this.load.spritesheet("test", "./assets/01-neutral.png", { frameWidth: 30, frameHeight: 30 })
    }

    // Runs when we first enter this scene
    create() {
        // Load game data
        this.loadGame();
        this.lvlprice = 100 * (Math.pow(this.stage + 1, 2));
        /*this.anims.create({
            key: "test",
            frameRate: 5,
            frames: this.anims.generateFrameNumbers("test", { start: 0, end: 3 }),
            repeat: -1
        }); */
        // Set the starting monster
        //console.log(`${this.stage}`);
        let background = this.add.image(225, 400, "bgimage", `./assets/${LEVELDATA[this.stage].bg}`); //change to take from array
        background.setScale(2.5);
        let n = MONSTERS[this.stage].length;
        let index = Math.floor(Math.random() * n);

        this.lvltext = this.add.text(225, 100, "Level Up", {
            fontSize: '30px',
            fontFamily: 'impact',
            color: 'gray'
        });
        this.setMonster(MONSTERS[this.stage][index]);
        this.stageText = this.add.text(225, 25, `Level ${this.stage + 1}`, {
            fontSize: '24px',
            fontFamily: 'impact',
        })
        /*if(crystals >= (100*(this.stage+1)) && this.stage < this.maxlevel){

        }*/
        // Create hp text
        this.hpText = this.add.text(225, 700, "", {
            fontSize: '24px',
            fontFamily: 'impact',
            //color: 'yellow'
        });
        this.monsterText = this.add.text(225, 650, "", {
            fontSize: '30px',
            fontFamily: 'impact',
            //color: 'yellow'
        });
        this.monsterText.setOrigin(0.5, 0.5);
        this.hpText.setOrigin(0.5, 0.5);
        this.stageText.setOrigin(0.5, 0.5);
        this.lvltext.setOrigin(0.5, 0.5);
        // Create the crystals text
        this.crystalsText = this.add.text(60, 30, "0", {
            fontSize: '24px',
            color: 'cyan'
        });
        let crystalimg = this.add.image(30, 40, 'crystals');
        crystalimg.setScale(1.5);
        //text to go to next level

        // this.lvltext.setOrigin(0.5, 0.5);

        // Create an upgrade icon for the knight upgrade
        this.knightpricelabel = this.add.text(400, 10, `Cost: ${this.levels.knight * 5}`, {
            fontSize: '12px'
        });
        this.knightpricelabel.setOrigin(.5, .5);
        this.knightlvllabel = this.add.text(400, 100, `${this.levels.knight}`, {
            fontSize: '20px'
        });
        this.knightlvllabel.setOrigin(.5, .5);
        let knight = this.add.image(400, 50, 'knight');
        knight.setScale(2.5);
        knight.setInteractive();
        knight.on('pointerdown', () => {
            // If we have enough money
            if (this.crystals >= this.levels.knight * 5) {
                // pay the money
                this.crystals -= this.levels.knight * 5;
                // gain a level
                this.levels.knight++;
                this.sound.play('powerup', {
                    volume: 0.4
                });
            }
        });
        this.tappricelabel = this.add.text(325, 10, `Cost: ${this.levels.tap * 2}`, {
            fontSize: '12px'
        });
        this.tappricelabel.setOrigin(.5, .5);
        this.taplvllabel = this.add.text(325, 100, `${this.levels.tap}`, {
            fontSize: '20px'
        });
        this.taplvllabel.setOrigin(.5, .5);
        let sword = this.add.image(325, 50, 'sword');
        sword.setScale(2.5);
        sword.setInteractive();
        sword.on('pointerdown', () => {
            // If we have enough money
            if (this.crystals >= this.levels.tap * 2) {
                // pay the money
                this.crystals -= this.levels.tap * 2;
                // gain a level
                this.levels.tap++;
                this.sound.play('powerup', {
                    volume: 0.4
                });
            }



        });
        // Create an interval to use knight damage
        setInterval(() => {
            this.damage(this.levels.knight);
        }, 1000);

        // Save button
        let chest = this.add.image(50, 750, 'chest');
        chest.setScale(2.5);
        chest.setInteractive();
        chest.on('pointerdown', () => {
            this.saveGame();
            this.scene.start("TitleScene");
        });

        // Save every 60s
        setInterval(() => {
            this.saveGame();
        }, 60000);
        // Save once on startup, to set the time
        this.saveGame();
        this.tween = this.tweens.add({
            targets: [this.lvltext],
            duration: 500,
            alpha: 0,
            yoyo: true,
            repeat: -1
        });
        this.tween.pause();
        this.lvltext.on('pointerdown', () => {

            if ((this.crystals >= this.lvlprice) && (this.stage < this.maxlevel)) {
                this.lvltext.disableInteractive();
                // this.stage = this.stage + 1;
                this.crystals -= this.lvlprice;
                this.stage++;
                console.log(`${this.stage}`);
                this.levelup = false;
                this.tween.restart();
                this.tween.pause();
                this.lvltext.setColor('gray');
            }
        });



        this.lvlpricelabel = this.add.text(225, 125, `Cost: ${this.lvlprice}`, {
            fontSize: '20px',
            alpha: 1
        });
        this.lvlpricelabel.setOrigin(.5, .5);



        /*test = this.add.sprite(225, 600, "test"); //i was testing animations
        test.play("test");*/
        /*if(this.levelup){
            console.log("fuck");
            this.tweens.add({
                targets: [this.lvltext],
                duration: 500,
                alpha: 0,
                yoyo: true,
                repeat: -1
            });
        }*/
        //
    }

    levelUp() {
        if ((this.crystals >= this.lvlprice) && (this.stage < this.maxlevel)) {
            this.levelup = true;
            //return true;
        } else {
            this.levelup = false;
            //return false;
        }


        //console.log(`${this.levelup}`)
    }
    // Runs every frame
    update() {
        /* if(this.stage >= this.maxlevel){ //  FOR TESTING ONLY PLS DELETE BEFORE SUBMISSION
             this.stage = 0;
          }*/
        if (this.hp > 0) {
            this.hpText.setText(`${this.hp}`);
        } else {
            this.hpText.setText("0");
        }
        this.crystalsText.setText(`${this.crystals}`);

        this.knightlvllabel.setText(`Lvl ${this.levels.knight}`);
        this.taplvllabel.setText(`Lvl ${this.levels.tap}`);
        if (this.levels.knight == 0) {
            this.knightpricelabel.setText(`Cost: 5`);
        } else {
            this.knightpricelabel.setText(`Cost: ${this.levels.knight * 5}`);
        }
        this.tappricelabel.setText(`Cost: ${this.levels.tap * 2}`);

        this.monsterText.setText(`${this.name}`);
        this.levelUp();
        if (this.levelup) {
            this.lvltext.setColor('yellow');
            this.lvltext.setInteractive();
            this.tween.play();
            this.lvlpricelabel.alpha = 1;
        }
        this.stageText.setText(`Level ${this.stage + 1}`);
        this.lvlprice = 100 * (Math.pow(this.stage + 1, 2));
        //console.log(`${this.lvlprice}`);
        //console.log(`${this.levelup}`);
        if (!this.levelup) {
            this.tween.pause();
            this.lvltext.setColor('gray');
            this.lvlpricelabel.alpha = 0.5;
        }
        this.lvlpricelabel.setText(`Cost: ${this.lvlprice}`);


    }



    damage(amount) {

        // Lower the hp of the current monster
        this.hp -= amount;
        // Check if monster is dead
        if (this.hp <= 0 && this.alive) {
            console.log("You killed the monster!");
            this.sound.play('death', {
                volume: 0.4
            });
            // Set monster to no longer be alive
            this.alive = false;
            // Play a death animation
            this.tweens.add({
                // List of things to affect
                targets: [this.monsterImage],
                // Duration of animation in ms
                duration: 750,
                // Alpha is transparency, 0 means invisible
                alpha: 0,
                // Scale the image down during animation
                scale: 0.1,
                // Set the angle
                angle: 359,
                // Runs once the death animation is finsihed
                onComplete:
                    () => {
                        let num = MONSTERS[this.stage].length;
                        // Choose a random new monster to replace the dead one
                        let index = Math.floor(Math.random() * num);
                        this.setMonster(MONSTERS[this.stage][index]);
                        // Gain a soul
                        this.crystals++;
                        // Save game (and soul gained)
                        this.saveGame();
                    }

            });
        }


    }

    loadGame() {
        // Load the soul count from local storage
        /* let savedcrystals = localStorage.getItem('crystals');
         // Convert string to number
         this.crystals = parseInt(savedcrystals);
         let savedstage = localStorage.getItem('stage');
         // Convert string to number
         this.stage = parseInt(savedstage);
         // If soul count could not be loaded, set it to 0*/
        loadObjectFromLocal();
        if (isNaN(this.crystals)) {
            this.crystals = 0;
        }
        if (isNaN(this.stage)) {
            this.stage = 0;
        }

        // Account for idle progression based on time last played
        let lastTime = localStorage.getItem('lastPlayed');
        // Convert string to numeric timestamp
        let lastStamp = parseInt(lastTime);
        /* let json = localStorage.getItem('levels');
         this.levels = JSON.parse(json);*/
        if (this.levels == null) {
            this.levels = {
                tap: 1,
                knight: 0
            }
        }
        // If the last time played is a valid number, we will add progress
        if (!isNaN(lastStamp)) {
            // Get the current date-time object (NOW)
            let now = new Date();
            // Get a timestamp (miliseconds since January 1970)
            let nowStamp = now.getTime();
            // Subtract the last played timestamp from the NOW timestamp to
            // get miliseconds since last played
            let ms = nowStamp - lastStamp;
            // Convert to seconds
            let s = ms / 1000;
            console.log(`seconds: ${s}`);
            // We will gain 1 soul per 15 seconds. Is this a good system? No.
            // Replace it later...
            let k = Math.floor(MONSTERS[this.stage][0].hp / this.levels.knight);
            let crystalsGained = Math.floor(s / k);
            console.log(`crystals got: ${crystalsGained}`);
            this.crystals += crystalsGained;
        }

        // Try to load the levels object


        console.log(`${this.levels.tap}`)
        console.log(`${this.levels.knight}`)

    }

    saveGame() {
        // Save last time that the user played
        let date = new Date();
        let numDate = date.getTime();
        saveObjectToLocal(date);
        saveObjectToLocal(numDate);
        saveObjectToLocal(this.crystals);
        saveObjectToLocal(this.stage);
        saveObjectToLocal(this.levels);
        /*
        localStorage.setItem('lastPlayed', `${numDate}`);
        // Save the number of crystals
        localStorage.setItem('crystals', `${this.crystals}`);
        localStorage.setItem('stage', `${this.stage}`);
       // localStoreage.setItem('knightlevels', `${this.levels.knight}`);
        // Save levels object as JSON formatted string
        localStorage.setItem('levels', JSON.stringify(this.levels)); //for powerups*/
    }

    setMonster(monsterConfig) {
        // Destroy the old monster's game object
        if (this.monsterImage != null) this.monsterImage.destroy();
        // Reset hp of the monster
        this.hp = monsterConfig.hp;
        this.name = monsterConfig.name;
        this.alive = true;
        // Create a image of monster at position x:225,y:400
        this.monsterImage = this.add.image(225, 400, monsterConfig.name);
        // Set the size of the monster
        this.monsterImage.setScale(1);
        // Make the monster clickable
        this.monsterImage.setInteractive();

        // Handler/callback for the 'pointer down' event
        this.monsterImage.on('pointerdown',
            () => {
                // Play a hit sound
                this.sound.play('hit', {
                    volume: 0.1
                });
                this.damage(this.levels.tap);
            });

    }
}