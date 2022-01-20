class TitleScene extends Phaser.Scene {
    constructor() {
        super("TitleScene");
        this.scoresText = null;
        this.username = "";
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('scores')
            .orderBy('score', 'desc')
            .limit(7);
        // HTML stuff
        this.nameInput = null;
        /** @type {HTMLInputElement} */
        this.element = null;
    }

    // init(){
    //     function loadFont(name, url) {
    //         var newFont = new FontFace(name, `url(${url})`);
    //         newFont.load().then(function (loaded) {
    //             document.fonts.add(loaded);
    //             console.log("got font");
    //         }).catch(function (error) {
    //             console.log("can't find font");
    //             return error;
    //         });
    //     }
    // }
    preload() {

        // this.load.image('startbtn', './assets/Start_BTN.png');
        // this.load.image('bg', './assets/BG.png');
        this.load.image('bgimage', './assets/Background.png');
        this.load.image('frame', './assets/scoreframe.png');
        // this.load.('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        // this.load.script('DungeonFont', './assets/DungeonFont.ttf');
    }

    create() {
        // let text2 = this.add.text(250, 250, 'TEXT HERE', { fontFamily: 'DungeonFont', fill: '#00ff00' });
        let bgimage = this.add.image(400, 250, 'bgimage');
        bgimage.setScale(.6);
        let scoreholder = this.add.image(130, 140, 'frame');
        scoreholder.setScale(6.5);
        scoreholder.setOrigin(.5,.5);
        this.input.on('pointerdown', () => {
            this.scene.start('MainScene', {
                username: this.username
            });
        });
        let label = this.add.text(400, 150, "Zomgardia", {
            fontSize: '40px',
            fontFamily: 'Courier New',
            align: 'center',
            // color: 'Gray'
        });
        label.setOrigin(.5, .5);
        // let t = this.add.text(400, 200, "(Beta)",{
        //     fontSize: '20px',
        //     align: 'center'
        // });
        // t.setOrigin(.5,.5);
        // this.input.on('pointerdown', () => {
        //     this.scene.start('MainScene');
        // });
        let text = this.add.text(400, 350, "Tap to Play", {
            fontSize: '36px',
            fontFamily: 'courier new',
            color: 'black'
        });
        text.setOrigin(.5, .5);
        this.tweens.add({
            targets: [text],
            duration: 900,
            alpha: 0,
            yoyo: true,
            repeat: -1
        });
        // console.log("title");
        // Text for the high score table
        let label1 = this.add.text(250, 25, "High Scores:", {
            fontSize: '25px',
            fontFamily: 'Courier New',
            align: 'right'
        });
        label1.setOrigin(1, .25);
        this.scoresText = this.add.text(250, 45, "", {
            fontSize: '25px',
            fontFamily: 'Courier New',
            align: 'right'
        }).setOrigin(1, 0);
        this.getAllScores();
        let label2 = this.add.text(10, 350, "Enter Name:", {
            fontSize: '25px',
            fontFamily: 'Courier New',
            color: 'black',
            align: 'right'
        })
        // Create an input element for username
        this.nameInput = this.add.dom(180, 400, 'input');
        this.nameInput.setScale(2);
        this.element = this.nameInput.node;

    }

    update() {
        this.username = this.element.value;
    }
    async getAllScores() {
        let snap = await this.scoreTable.get();
        snap.forEach(
            (docSnap) => {
                const data = docSnap.data();
                // const name = data.name;
                // const score = data.score;
                const { name, score } = data;
                let scoreString = `${score}`.padStart(5, ' ');
                this.scoresText.text += `${name}: ${scoreString}\n`;
            }
        );
    }

}