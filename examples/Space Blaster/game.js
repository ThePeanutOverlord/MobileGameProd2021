/** @type {Phaser.Types.Core.GameConfig} */
const config = {
    parent: 'game',
    width: 450,
    height: 800,
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT
    },
    fps: {
        target: 30,
        min: 5
    },
    scene: [
        TitleScene,
        MainScene
    ],
    physics: {
        default: 'arcade',
        // arcade: {
        //     debug: true,
        //     gravity: { y: 200 }
        // }
    },
    pixelArt: true,
    dom: {
        createContainer: true
    }
}
new Phaser.Game(config);