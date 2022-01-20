class mainscene extends Phaser.Scene{
    constructor(){
        super("mainscene");
      //  this.app = firebase.initializeApp(firebaseConfig);
        this.player = null;
    }

    preload(){
       this.load.spritesheet('bg', './space5_4-frames.png',{
            frameWidth: 64,
            framHeight: 64
        });
        this.load.spritesheet('explosion', './Explosion_2_64x64.png',{
            frameWidth: 64,
            framHeight: 64
        });
        this.load.spritesheet('player', './ship.png',{
            frameWidth: 16,
            framHeight: 24
        });
    }
    create(){
      let bg = this.add.sprite(225, 225);
        bg.setScale(7);
        bg.anims.create({
            key: 'bg',
            frames: this.anims.generateFrameNumbers('bg', {
                start: 0,
                end: 3
            }),
            frameRate: 7,
            repeat: -1
        });
        let bg2 = this.add.sprite(225, 600);
        bg2.setScale(7);
        bg2.anims.create({
            key: 'bg',
            frames: this.anims.generateFrameNumbers('bg', {
                start: 0,
                end: 3
            }),
            frameRate: 7,
            repeat: -1
        });
        //this.player = this.add.sprite(225, 750);
        this.player = this.physics.add.sprite(225, 750, 'player');
        this.player.setScale(4);
        this.generateplayeranimations();
       // let explosion = this.add.sprite(200,200, 'explosion');
       /* explosion.setScale(3);
        explosion.anims.create({
            key: 'boom',
            frames: this.anims.generateFrameNumbers('explosion', { //could also list all frames
                start:0,
                end: 43 
            }),
            frameRate: 20,
            repeat: -1
           
        });*/
        bg.anims.play('bg');
        bg2.anims.play('bg');
        this.player.anims.play('left');
        //explosion.anims.play('boom');
    }


    generateplayeranimations(){
        this.player.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player',{
                frames: [2,7]}),
            frameRate: 10,
            repeat: -1
        });
        this.player.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player',{
                frames: [0,5]}),
            frameRate: 10,
            repeat: -1
        });
        this.player.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player',{
                frames: [4,9]}),
            frameRate: 10,
            repeat: -1
        });
    }
}