class LevelScene extends Phaser.Scene {
    constructor() {
        super("LevelScene");
    }
    preload() {
        this.load.image('borderBckGround1', './assets/interface/borders/Dragonbun-ItemBorder33.png')
        this.load.image('borderBckGround2', './assets/interface/borders/Dragonbun-ItemBorder32.png')
        this.load.image('borderBckGround3', './assets/interface/borders/Dragonbun-ItemBorder34.png')
        this.load.image('treeBackground', './assets/interface/borders/background_12.png');
        this.load.image('level1Background', './assets/interface/borders/Level_1_Cover_Image.jpg')
        this.load.image('level2Background', './assets/interface/borders/comingSoon.png')
        this.load.image('level3Background', './assets/interface/borders//comingSoon.png')

        

        this.load.bitmapFont('text', './assets/fonts/enpostal.png','./assets/fonts/enpostal.xml');


    }
    create() {

        
        
        let backgroundLevelScene = this.add.image(400, 225, 'treeBackground').setOrigin(0.5);
        backgroundLevelScene.setScale(1.2);
        
        
        //adding border images
        let lvl1border = this.add.image(150,225, 'borderBckGround1').setOrigin(0.5); 
        lvl1border.setScale(0.7);
        let lvl2border = this.add.image(400,225, 'borderBckGround2').setOrigin(0.5);
        lvl2border.setScale(0.7);
        let lvl3border = this.add.image(650,225, 'borderBckGround3').setOrigin(0.5);
        lvl3border.setScale(0.7);

        //adding level text
        let lvl1Text = this.add.bitmapText(150,375,'text','|Level One|',35).setOrigin(0.5);
        lvl1Text.setScale(1);
        let lvl2Text = this.add.bitmapText(400,375,'text','|Level Two|',35).setOrigin(0.5);
        lvl2Text.setScale(1);
        let lvl3Text = this.add.bitmapText(650,375,'text','|Level Three|',35).setOrigin(0.5);
        lvl3Text.setScale(1);

        //adding level preview images
        let lvl1Bck = this.add.image(150,225,'level1Background');
        lvl1Bck.setScale(.265);
        let lvl2Bck = this.add.image(400,225,'level2Background');
        lvl2Bck.setScale(.265);
        let lvl3Bck = this.add.image(650,225,'level3Background');
        lvl3Bck.setScale(.265);

    
        //Changes the scene to level one
        lvl1Bck.setInteractive();
        lvl1Bck.on('pointerdown', () => {
            this.scene.start("Level1");
        });

        
        // let comingSoon = this.add.image(400, 225, 'level2Background');
        // let comingSoon2 = this.add.image(650, 225, 'level3Background');
        
        
        let back = this.add.text(100,420, 'back').setOrigin(0.5);
        back.setInteractive();
        back.on('pointerdown', () => {
            this.scene.start("TitleScene");
        })
    }
}