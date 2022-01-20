class EnemyH extends AI {

    constructor(scene, obj) {
        super(scene, obj, () => { });
        this.change(this.moveDown);
        this.shooting = false;
        this.lastShot = 0;
        this.shotTimeout = 2500;
        this.bullets = 5;
        // this.hp = 2;
    }

    moveDown() {
        this.obj.setVelocity(0, .25 * this.scene.plySpd);
        // Check if we should change states
        if (this.obj.y >= 150) {
            this.change(this.shoot);
        }
    }

    shoot() {
        // If this state just started, go right
        if (!this.shooting) {
            this.shooting = true;
            // Go right
            this.obj.setVelocity(0, 0);
        }

        // Check if we should shoot
        if (this.now() > this.lastShot + this.shotTimeout) {
            this.scene.createBullet(this.obj.x, this.obj.y + 50, true, true);
            this.lastShot = this.now();
            this.bullets--;
        }

        // If out of bullets, change state
        if (this.bullets <= 0) {
            this.shooting = false;
            this.change(this.leave);
        }
    }

    leave() {
        if (this.obj.x <= 225) {
            let angle = Phaser.Math.Angle.Between(this.obj.x, this.obj.y, 0, 400);
            let xSpd = Math.cos(angle) * this.scene.plySpd * .25;
            let ySpd = Math.sin(angle) * this.scene.plySpd * .25;
            this.obj.setVelocity(xSpd, ySpd);
        }

        else if (this.obj.x > 225) {
            let angle = Phaser.Math.Angle.Between(this.obj.x, this.obj.y, 800, 400);
            let xSpd = Math.cos(angle) * this.scene.plySpd * .25;
            let ySpd = Math.sin(angle) * this.scene.plySpd * .25;
            this.obj.setVelocity(xSpd, ySpd);
        }

        if (this.obj.x > 800 || this.obj.x < 0) {
            this.obj.y = 0;
            this.obj.x =(Math.random() * 375) + 50;
            this.bullets = 5;
            this.change(this.moveDown);
        }
    }
    now() {
        return new Date().getTime();
    }

}