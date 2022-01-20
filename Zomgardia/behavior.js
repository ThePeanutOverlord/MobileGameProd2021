class behavior extends AI {
    constructor(scene, obj) {
        super(scene, obj, () => { });
        this.change(this.move);
        this.step = null;
    }

    move() {

        // console.log(this.obj.attacking);
        this.step = 0;
        // if (this.obj != null && this.obj.body.velocity.x < 0 && !this.obj.attacking && !this.obj.dead && !this.obj.hurt) {
        //     this.obj.anims.play('run', true);
        //     this.obj.flipX = true;
        // } else if (this.obj != null && this.obj.body.velocity.x > 0 && !this.obj.attacking && !this.obj.dead && !this.obj.hurt) {
        //     this.obj.anims.play('run', true);
        //     this.obj.flipX = false;
        // }
        // console.log(this.step);
        if (!this.obj.dead && !(this.obj.body.touching.right) && !(this.obj.body.touching.left)) {
            let angle = Phaser.Math.Angle.BetweenPoints(this.obj, this.scene.player);
            let xSpd = Math.cos(angle) * this.scene.plySpd * .25;
            let ySpd = Math.sin(angle) * this.scene.plySpd * .25;
            this.obj.setVelocityX(xSpd);
            if (this.obj.body.velocity.x == 0 && !this.obj.attacking) {
                this.change(this.move);
            }
            if (this.obj.x - this.scene.player.x < 50) {
                this.obj.anims.play('atk');
            }
        } else if ((this.obj.body.touching.right) || (this.obj.body.touching.left) && this.obj.attacking) {
            // console.log("detected touch");
            this.obj.onCollide = true;
            this.change(this.attack);
        }

        if (this.obj.body.velocity.x == 0 && !this.obj.attacking) {
            this.change(this.move);
        }


    }
    attack() {
        this.step = 1;
        // console.log(this.step);
        //this.obj.setVelocityX(0);
        // console.log("in atk");
        if (!this.obj.onCollide && !this.obj.attacking) {
            // console.log("leaving atk");
            // this.obj.attacking = false;
            this.change(this.move);
        }
        // this.scene.enemyAttack();

    }

    now() {
        return new Date().getTime();
    }
}