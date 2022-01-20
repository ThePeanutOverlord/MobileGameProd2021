class TitleScene extends Phaser.Scene{
    constructor(){
        super("TitleScene");
        this.scoresText = null;
        this.username = "";
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();
        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('Scores')
            .orderBy('Score', 'desc')
            .limit(4);
        //html stuff
        this.nameInput = null;
        /**
         * @type {HTMLInputElement}
         */
        this.element = null;
    }

    create(){
        let button = this.add.rectangle(225, 600, 340, 70, 0x00FF00, 0.3);
        button.setInteractive();
        button.on('pointerdown', ()=>{
            this.scene.start('MainScene');
        });
        this.add.text(225, 600, "PLAY").setOrigin(0.5);
        this.scoresText = this.add.text(440, 10, "", {
            align: 'right'
        }).setOrigin(1,0);
        // run database query
        this.getAllScores();

        //create an input element for username
        this.nameInput = this.add.dom(225,400, 'input');
        this.nameInput.setScale(2);
        this.element = this.nameInput.node;
    }

    update(){
        this.username = this.element.value;
    }

    async getAllScores(){
        let snap = await this.scoreTable.get();
        snap.forEach(
            (docSnap)=>{
            const data = docSnap.data();
            const{Name, Score} = data; //extracts name and score from firebase data
            this.scoresText.text += `${Name}: ${Score}\n`
            console.log(data);
        }
        );
    }
}