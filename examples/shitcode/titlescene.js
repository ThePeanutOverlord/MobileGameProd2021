class titlescene extends Phaser.Scene{
    constructor(){
        super("titlescene");

    }

    create(){
        let text = this.add.text(225, 400, "play now", {
            fontFamily: 'impact',
            fontSize: '60px',
            
            
        });
        text.setOrigin(0.5, 0.5); //origins go from 0 to 1 with 0 being top left and 1 being bottom right
        text.setInteractive();
        text.on('pointerdown', ()=>{
            this.scene.start('MainScene');
        });
        this.tweens.add({
            targets: [text],
            duration: 700,
            alpha: 0,
            yoyo: true,
            repeat: -1
        })
    }
}