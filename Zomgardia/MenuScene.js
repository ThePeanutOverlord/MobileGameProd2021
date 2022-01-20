class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
        // Handle signals between scenes
        this.signals = SignalManager.get();
        // Background of the menu
        this.background = null;
        this.balance = null;
        this.prices = [];
        this.meleetext = null;
        this.shootingtext = null;
        this.barriertext = null;
        this.moneytext = null;
        this.baltext = null;
        this.timearrived = null;
        this.signals.on("prices", (data) => {
            console.log(data);
            this.prices = data;
        })
        this.signals.on("balance", (d) => {
            console.log(d);
            this.balance = d;
        })
        // this.signals.on("pausetimer", (d) => {
        //     this.timearrived = d;
        //     console.log(`in menu: ${this.timearrived}`);
        // });
        // this.signals.on("pausetimer", (d) => {
        //     this.timearrived = d;
        //     console.log(this.timearrived);
        // })
    }
    preload() {
        this.load.image('bg', './assets/menubg.png');
        this.load.image('back', './assets/back.png');
        this.load.image('exit', './assets/exit.png');
        this.load.image('itemframe', './assets/itemframe.png');
        this.load.image('moneyholder', './assets/moneyholder.png');
        this.load.image('blankbtn', './assets/blankbtn.png');
        this.load.image('sword', './assets/sword_03c.png');
        this.load.image('wood', './assets/wood_01a.png');
        this.load.image('money', './assets/coin_05d.png');
        this.load.image('arrow', './assets/arrow_02e.png');
        this.load.image('coin', './assets/coin_01d.png');
        this.load.audio('select', './assets/Select.wav');
    }

    create() {
        // this.signals.on("prices", (data) => {
        //     console.log(data);
        //     this.prices = data;
        // })
        // this.signals.on("balance", (d) => {
        //     console.log(d);
        //     this.balance = d;
        // })
        this.add.dom(700, 50).createFromCache('tower-menu');
        this.background = this.add.image(400, 225, 'bg');
        this.background.setScale(13);
        this.createCloseButton();
        this.createPwrUpButtons()
        let moneyframe = this.add.image(227, 120, 'moneyholder');
        moneyframe.setScale(3);
        this.baltext = this.add.text(227, 120, `${this.balance}`, {
            fontSize: '20px',
            fontFamily: 'Courier New',
            align: 'right',
            // color: 'Gray'
        });
        this.baltext.setOrigin(.5, .5);
        let exitbutton = this.add.image(500, 401, 'exit');
        exitbutton.setScale(3);
        exitbutton.setInteractive();
        exitbutton.on('pointerdown', () => {
            // Let the other scenes know that we are closing
            this.signals.emit('end-game', null);
            // Stop this scene
            this.scene.stop("MenuScene");
        });
        // this.signals.on("prices", (data) => {
        //     console.log(data);
        //     this.prices = data;
        // })
        // this.signals.on("balance", (d) => {
        //     console.log(d);
        //     this.balance = d;
        // })
        // this.signals.on('melee-bought', ()=>{
        //     this.prices[0] *= 2;
        //     // this.plyatkdmg *= 1.5;
        // })
        // let balance
        // this.signals.on("pausetimer", (d) => {
        //     this.timearrived = d;
        //     console.log(`in menu: ${this.timearrived}`);
        // });

    }

    update() {
        this.baltext.setText(`${this.balance}`);
        console.log(this.balance);
        this.meleetext.setText(`${this.prices[0]}`);
        this.shootingtext.setText(`${this.prices[1]}`);
        this.barriertext.setText(`${this.prices[2]}`);
        this.moneytext.setText(`${this.prices[3]}`);


    }

    createPwrUpButtons() {
        let meleeframe = this.add.image(225, 200, 'itemframe');
        let meleeicon = this.add.image(225, 200, 'sword');
        let meleelabel = this.add.image(225, 300, 'blankbtn');
        let c = this.add.image(200, 302, 'coin');
        c.setScale(2);
        meleelabel.setScale(3);
        meleelabel.setInteractive();
        this.meleetext = this.add.text(225, 302, `${this.prices[0]}`, {
            fontSize: '20px',
            fontFamily: 'Courier New',
            align: 'right',
            // color: 'Gray'
        });
        this.meleetext.setOrigin(.5, .5);
        meleeicon.setScale(3);
        // meleeicon.setInteractive();
        meleeframe.setScale(3);
        // meleeframe.setInteractive();
        meleelabel.on('pointerdown', () => {
            this.sound.play('select', {
                volume: 0.4
            });
            // Let the other scenes know that we are closing
            this.signals.emit('melee-bought', null);
            // this.prices[0] *= 2;
            // Stop this scene
        });



        let shootingframe = this.add.image(340, 200, 'itemframe');
        let shootingicon = this.add.image(340, 200, 'arrow');
        let shootinglabel = this.add.image(340, 300, 'blankbtn');
        let c2 = this.add.image(315, 302, 'coin');
        c2.setScale(2);
        this.shootingtext = this.add.text(340, 302, `${this.prices[1]}`, {
            fontSize: '20px',
            fontFamily: 'Courier New',
            align: 'right',
            // color: 'Gray'
        });
        this.shootingtext.setOrigin(.5, .5);
        shootinglabel.setScale(3);
        shootinglabel.setInteractive()
        shootingicon.setScale(3);
        // shootingicon.setInteractive();
        shootingframe.setScale(3);
        // shootingframe.setInteractive();
        shootinglabel.on('pointerdown', () => {
            this.sound.play('select', {
                volume: 0.4
            });
            // Let the other scenes know that we are closing
            this.signals.emit('shooting-bought', null);
            // Stop this scene
        });
        let barrierframe = this.add.image(455, 200, 'itemframe');
        let barriericon = this.add.image(455, 200, 'wood');
        let barrierlabel = this.add.image(455, 300, 'blankbtn');
        let c3 = this.add.image(430, 302, 'coin');
        c3.setScale(2);
        this.barriertext = this.add.text(455, 302, `${this.prices[2]}`, {
            fontSize: '20px',
            fontFamily: 'Courier New',
            align: 'right',
            // color: 'Gray'
        });
        this.barriertext.setOrigin(.5, .5);
        barrierlabel.setScale(3);
        barrierlabel.setInteractive();
        barriericon.setScale(3);
        // barriericon.setInteractive();
        barrierframe.setScale(3);
        // barrierframe.setInteractive();
        barrierlabel.on('pointerdown', () => {
            this.sound.play('select', {
                volume: 0.4
            });
            // Let the other scenes know that we are closing
            this.signals.emit('barrier-bought', null);
            // Stop this scene
        });
        let moneyframe = this.add.image(570, 200, 'itemframe');
        let moneyicon = this.add.image(570, 200, 'money');
        let moneylabel = this.add.image(570, 300, 'blankbtn');
        let c4 = this.add.image(545, 302, 'coin');
        c4.setScale(2);
        this.moneytext = this.add.text(570, 302, `${this.prices[3]}`, {
            fontSize: '20px',
            fontFamily: 'Courier New',
            align: 'right',
            // color: 'Gray'
        });
        this.moneytext.setOrigin(.5, .5);
        moneylabel.setScale(3);
        moneylabel.setInteractive();
        moneyicon.setScale(3);
        // moneyicon.setInteractive();
        moneyframe.setScale(3);
        // moneyframe.setInteractive();
        moneylabel.on('pointerdown', () => {
            this.sound.play('select', {
                volume: 0.4
            });
            // Let the other scenes know that we are closing
            this.signals.emit('money-bought', null);
            // Stop this scene
        });
    }
    now() {
        return new Date().getTime();
    }
    createCloseButton() {
        let backbutton = this.add.image(300, 401, 'back');
        backbutton.setScale(3);
        backbutton.setInteractive();
        backbutton.on('pointerdown', () => {
            // Let the other scenes know that we are closing
            // this.timeleft = this.now();
            // console.log(this.timeleft - this.timearrived);
            // console.log(`right b4 main: ${(this.timeleft - this.timearrived)}`);
            this.signals.emit('menu-closed', this.timeleft - this.timearrived);
            // Stop this scene
            this.scene.stop("MenuScene");
        });
    }

}