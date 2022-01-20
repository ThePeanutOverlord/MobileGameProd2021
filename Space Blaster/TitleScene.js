class TitleScene extends Phaser.Scene {
    constructor() {
        super("TitleScene");
        this.scoresText = null;
        this.username = "";
        // Firebase stuff
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('Scores')
            .orderBy('Score', 'desc')
            .limit(10);
        // HTML stuff
        this.nameInput = null;
        /** @type {HTMLInputElement} */
        this.element = null;
    }
    preload() {
        this.load.image('startbtn', './assets/Start_BTN.png');
        this.load.image('bg', './assets/BG.png');
    }

    create() {
        let background = this.add.image(225, 400, 'bg');
        let button = this.add.image(225, 600, 'startbtn');
        button.setScale(0.75);
        button.setInteractive();
        button.on('pointerdown', () => {
            this.scene.start('MainScene', {
                username: this.username
            });
        });

        // Text for the high score table
        let label = this.add.text(340, 10, "High Scores:", {
            fontSize: '25px',
            fontFamily: 'Courier New',
            align: 'left'
        });
        label.setOrigin(1, .25);
        this.scoresText = this.add.text(340, 30, "", {
            fontSize: '25px',
            fontFamily: 'Courier New',
            align: 'right'
        }).setOrigin(1, 0);
        // Run our database query to get scores
        this.getAllScores();
        let label2 = this.add.text(50, 350, "Enter Name:", {
            fontSize: '25px',
            fontFamily: 'Courier New',
            align: 'right'
        })
        // Create an input element for username
        this.nameInput = this.add.dom(225, 400, 'input');
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
                const { Name, Score } = data;
                let scoreString = `${Score}`.padStart(5, ' ');
                this.scoresText.text += `${Name}: ${scoreString}\n`;
            }
        );
    }
}