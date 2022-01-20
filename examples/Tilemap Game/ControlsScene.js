class ControlsScene extends Phaser.Scene {
    constructor() {
        super("ControlsScene");
        this.signals = SignalManager.get();
        this.joystick = null;
        // Time related stuff
        this.timeLimit = 30000;
        this.startTime = null;
        this.timeText = null;
    }

    create() {
        console.log("ControlsScene");
        // Joystick to control the character
        this.joystick = new VirtualJoystick(this, GAME_WIDTH / 2, GAME_HEIGHT - 100, 50);
        // Time stuff
        this.startTime = new Date().getTime();
        this.timeText = this.add.text(0, 0, "30.00");
        // Game over listener
        this.signals.on('game-over', ()=>{
            this.gameOver();
        });
    }

    update() {
        // Send the joystick data to the game every update
        this.signals.emit('joystick', this.joystick);
        // Get the time that has passed
        let elapsed = new Date().getTime() - this.startTime;
        // let remaining = (this.timeLimit - elapsed) / 1000;
        let remaining = (this.timeLimit - elapsed) / 1000;
        if (remaining > 0) {
            // Update the time text
            this.timeText.setText(remaining.toFixed(2));
        } else {
            // Update the time text
            this.timeText.setText('0.00');
            // Signal when time has run out
            this.signals.emit('game-over');
        }
    }

    gameOver(){
        this.signals.off('game-over');
        this.scene.stop();
    }
}