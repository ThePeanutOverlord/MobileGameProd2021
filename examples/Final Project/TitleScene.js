class TitleScene extends Phaser.Scene {
    constructor() {
        super("TitleScene");
        this.music = false;
        this.prayedOnce = false;
        this.kneelTimeout = 9425;
        this.loaded = null;
        this.praying = false;
    }
    preload() {
        this.load.image('bckg1','./assets/backgrounds/Grassy_Mountains_Parallax_Background-vnitti/layers_fullcolor/clouds_front_fc.png');
        this.load.image('bckg2','./assets/backgrounds/Grassy_Mountains_Parallax_Background-vnitti/layers_fullcolor/clouds_front_t_fc.png');
        this.load.image('bckg3','./assets/backgrounds/Grassy_Mountains_Parallax_Background-vnitti/layers_fullcolor/clouds_mid_fc.png');
        this.load.image('bckg4','./assets/backgrounds/Grassy_Mountains_Parallax_Background-vnitti/layers_fullcolor/clouds_mid_t_fc.png');
        this.load.image('bckg5','./assets/backgrounds/Grassy_Mountains_Parallax_Background-vnitti/layers_fullcolor/far_mountains_fc.png');
        this.load.image('bckg6','./assets/backgrounds/Grassy_Mountains_Parallax_Background-vnitti/layers_fullcolor/grassy_mountains_fc.png');
        this.load.image('bckg7','./assets/backgrounds/Grassy_Mountains_Parallax_Background-vnitti/layers_fullcolor/hill.png');
        this.load.image('bckg8','./assets/backgrounds/Grassy_Mountains_Parallax_Background-vnitti/layers_fullcolor/sky_fc.png');
        this.load.audio('bckMusicTitle','./assets/sounds/music/Event_Music_3.ogg');
        this.load.image('start', './assets/interface/buttons/start-button.png');
        this.load.image('cloud1', './assets/backgrounds/Cloud 5.png');
        this.load.image('cloud2', './assets/backgrounds/Cloud 13.png');
        this.load.image('cloud3', './assets/backgrounds/Cloud 16.png');
        this.load.image('cloud4', './assets/backgrounds/Cloud 17.png');
        this.load.bitmapFont('text', './assets/fonts/enpostal.png','./assets/fonts/enpostal.xml');

        // Load player animations
        this.load.spritesheet('player-pray', './assets/player/animations/Pray.png', {
            frameWidth: 128,
            frameHeight: 64
        });
        this.load.spritesheet('player-idle', './assets/player/animations/Idle.png', {
            frameWidth: 128,
            frameHeight: 64
        });
        

    }

    create() {
        this.loaded = this.now();

        this.playTitleMusic();

        //background unmoving
        let bckSky = this.add.image(400,225, 'bckg8').setOrigin(0.5);
        bckSky.setScale(2.1);
        bckSky.setDepth(-2)
        let bckMnt = this.add.image(400,225, 'bckg5').setOrigin(0.5);
        bckMnt.setScale(2.1);
        bckMnt.setDepth(-2)
        let mountains = this.add.image(400,225, 'bckg6').setOrigin(0.5);
        mountains.setScale(2.1);
        let hill = this.add.image(400,225, 'bckg7').setOrigin(0.5);
        hill.setScale(2.1);
        hill.setDepth(1)

        // Creates the player sprite
        this.createPlayer();
        
        
        
        
        //very long creation of a very long parallax background 
        this.bckgroundPar = [];
        let bck1 = this.add.tileSprite(0, 0, 800, 450, `bckg1`);
        bck1.setOrigin(0, 0);
        bck1.setTileScale(2.1);
        bck1.setDepth(2);
        this.bckgroundPar.push(bck1);
        let bck2 = this.add.tileSprite(0, 0, 800, 450, `bckg2`);
        bck2.setOrigin(0, 0);
        bck2.setTileScale(2.1);
        bck2.setDepth(2);
        this.bckgroundPar.push(bck2);
        let bck3 = this.add.tileSprite(0, 0, 800, 450, `bckg3`);
        bck3.setOrigin(0, 0);
        bck3.setTileScale(2.1);
        this.bckgroundPar.push(bck3);
        let bck4 = this.add.tileSprite(0, 0, 800, 450, `bckg4`);
        bck4.setOrigin(0, 0);
        bck4.setTileScale(2.1);
        this.bckgroundPar.push(bck4);
        
        //creating start button
        let start = this.add.image(400,370, 'start' ).setOrigin(0.5);
        start.setDepth(3);
        start.setScale(1.5);
        start.setInteractive();
        start.on('pointerdown', () => {
            this.scene.start('LevelScene');   
        });
        //creating effects for the start button
        this.tweens.add({
            targets: [start],
            duration: 1500,
            repeat: -1,
            alpha: 0.6,
            yoyo: true,
            y: 365
        });
        //creating clouds moving in background
        //let cloud1 = this.add.image(800, 155, 'cloud1');
        //cloud1.setScale(1);
        let cloud2 = this.add.image(-75, 100, 'cloud2').setOrigin(0.5,0.5);
        cloud2.setScale(1);
        cloud2.setDepth(-1);
        let cloud3 = this.add.image(870, 15, 'cloud3');
        cloud3.setScale(1);
        let cloud4 = this.add.image(970, 180, 'cloud4');
        cloud4.setScale(1);
        cloud4.setDepth(-1.5)
        //tween animations initiating cloud movement and repeating 
        /*this.tweens.add({
            targets: [cloud1],
            duration: 35000,
            repeat: -1,
            x: 0,
        });
        */
        this.tweens.add({
            targets: [cloud2],
            duration: 95000,
            repeat: -1,
            x: 900,
        });
        this.tweens.add({
            targets: [cloud3],
            duration: 150000,
            repeat: -1,
            x: -80,
        });
        this.tweens.add({
            targets: [cloud4],
            duration: 60000,
            repeat: -1,
            x: -150,
        });

        //creating title text and adding slight animation
        this.title = this.add.bitmapText(400,225,'text','',50).setMaxWidth(500).setOrigin(0.5);
        this.typeWriter('Broken Shell');
        //flashes text
        this.tweens.add({
            targets: [this.title],
            duration: 500,
            alpha: 0.1,
            yoyo: true,
            repeat: 2
        });

    }
    update() {
        this.updateParallax();
        // if (!this.praying) {
        //     this.checkForPray();
        //     this.praying = true;
        // }
    }

    updateParallax() {
        this.bckgroundPar[0].tilePositionX += 1 * 0.2;
        this.bckgroundPar[1].tilePositionX += 1 * 0.2;
        this.bckgroundPar[2].tilePositionX -= 1 * 0.2;
        this.bckgroundPar[3].tilePositionX -= 1 * 0.2;
    }

    playTitleMusic() {
        if(!this.music) {
            this.sound.play('bckMusicTitle', {
                volume: 0.3,
                loop: -1
            });
            this.music = true;
        }
    }

    typeWriter(text) {
        this.title.setText(text);

        const bounds = this.title.getTextBounds(false);
        const wrappedText = bounds['wrappedText'] || text;

        this.title.setText('');

        const length = wrappedText.length
        let i = 0
        this.time.addEvent({
            callback: () => {
                this.title.text += wrappedText[i];
                ++i;


            },
            repeat: length - 1,
            delay: 250
        })
    }

    createPlayer() {
        // Create player sprite
        this.playerTitle = this.add.sprite(370, 310, 'player');
        this.playerTitle.setScale(0.75);
        this.playerTitle.setDepth(1);
        this.generateAnimations();
        // this.playerTitle.anims.play('idle');
        this.checkForPray();

    }

    checkForPray() {
        // Start the player in the praying animation
        // if (this.now() > this.loaded + this.kneelTimeout) {
            if (!this.prayedOnce) {
                this.playerTitle.anims.play('initial-pray');
                this.playerTitle.on('animationcomplete-initial-pray', ()=> {
                    this.playerTitle.anims.play('looping-pray');
                });
                this.prayedOnce = true;
            }else{
                this.playerTitle.anims.play('looping-pray');
            }
        // }
    }

    generateAnimations() {
        // Create the idle animation
        this.playerTitle.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7]
            }),
            frameRate: 8,
            repeat: -1
        });
        // Create the praying animation
        this.playerTitle.anims.create({
            key: 'initial-pray',
            frames: this.anims.generateFrameNumbers('player-pray', {
                frames: [0, 1,]
            }),
            frameRate: 4,
        });
        this.playerTitle.anims.create({
            key: 'looping-pray',
            frames: this.anims.generateFrameNumbers('player-pray', {
                frames: [2, 3, 4, 5, 6, 7, 8, 9]
            }),
            frameRate: 16,
            repeat: -1
        });
    }

    now() {
        return new Date().getTime();
    }

}