class MainScene extends Phaser.Scene{
    
    // this is where we define data members
    constructor(key){
        super(key); //calls parent version of function that's defined in both (like a constructor)
        //this.datamember = "placeholder"; //example datamember
       // this.initializelater = null;
        this.hp = 10;
        let hpText = null;  
        this.monsterimage = null; 
        //souls collected
        this.souls = 0; 
        //this.souls.text = null;
        /*this.levels = {
            powerup
        }*/
        this.alive = false;
    }
    
    preload(){ //runs b4 entering scene. load images and sound here
        for(let i = 0; i < monsters.length; i++){ //loop and load
            this.load.image(monsters[i].name, `./assets/${monsters[i].image}`);
        }
       //this.load.image('unicorn', './assets/unicorn.png'); // ./ means same folder we're in
       //this.load.audio('hit', './assets/whatever);
        //this.load.image(stuff for powerups or whatever)
    }

    create(){ // runs when we first enter the scene
       let index = Math.floor(Math.random() * monsters.length); //generates rand num btween 0 and 1 less than arr size
        
        this.setmonster(monsters[index]);


        this.hpText = this.add.text(225, 100, "10");
        this.soulstext = this.add.text(50,50, "souls: 0",{
            fontSize: 2,
            color: red
        });
    }
    update(){ //runs every time
        if(this.hp > 0){
           this.hpText.setText(`${this.hp}`); 
        }else{
            this.hpText.setText("0");
        }
        this.soulstext.setText(`souls: ${this.souls}`);
    }

    damage(amount){
        this.hp -= amount;//lower hp 
        if(this.hp <=0 && this.alive){
                console.log("you killed the monster");
                this.alive = false;
                //play death animation
                this.tweens.add({
                    targets: [this.monsterimage],
                    duration: 750,     //in miliseconds
                    alpha: 0,    //transparency
                    //scale down during animation
                    scale: 0.1,
                    //set angle
                    angle: 359,
                    onComplete: () => {
                        let index = Math.floor(Math.random() * monsters.length); //generates rand num btween 0 and 1 less than arr size
        
                        this.setmonster(monsters[index]);
                        this.souls++;
                    }
                });


            }
    }

    setmonster(monsterconfig){
        //destroy old monster
        if(this.monsterimage != null) this.monsterimage.destroy();
        //reset monster hp
        this.hp = monsterconfig.hp;
        this.alive = true;
        //create monster
        this.monsterimage = this.add.image(225, 400, monsterconfig.name); //create image at position (225,400)
        this.monsterimage.setScale(16); //sets scale of image
        //make unicorn clickable
        this.monsterimage.setInteractive();
        //handler = callback. this is for pointer down (click) event
        this.monsterimage.on('pointerdown', ()=>{
            console.log("neigh");
            this.damage(1);
            //play hit sound
            //this.sound.play('hit');
            //check if dead
           
        });

    }
}

