class TitleScene extends Phaser.Scene{
    constructor(){
        super("TitleScene");
    }

    preload(){
        this.load.image("spacebg", "./assets/space6_4-frames.gif");
        this.load.audio("bgmusic", "./assets/titlemusic.mp3");
        //this.load.spritesheet("bg", "./assets/space6_4-frames.png", { frameWidth: 64, frameHeight: 64 })
    }
    create(){
        /*this.anims.create({
            key: "bg",
            frameRate: 7,
            frames: this.anims.generateFrameNumbers("bg", { start: 0, end: 3 }),
            repeat: -1
        });
        bg = this.add.sprite(225, 400, "bg"); //i was testing animations
        bg.play("bg");*/
        let bg = this.add.image(225,400, "spacebg");
        bg.setScale(2.5);
        let music = this.sound.play("bgmusic", {
            volume: 0.5,
            loop: true
        });
       // music.loop = true;
       // music.play();
        let text = this.add.text(225, 400, "Click/Tap to Play", {
            fontSize: '36px',
            fontFamily: 'impact'
        });
        text.setOrigin(0.5, 0.5);
        text.setInteractive();
        this.input.on('pointerdown', ()=>{
            this.scene.start('MainScene');
        });
        this.tweens.add({
            targets: [text],
            duration: 900,
            alpha: 0,
            yoyo: true,
            repeat: -1
        });
    }
}