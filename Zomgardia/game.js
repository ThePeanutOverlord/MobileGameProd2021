/** @type {Phaser.Types.Core.GameConfig} */
const config = {
    parent: 'game',
    width: 800,
    height: 450,
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT
    },
    fps: {
        target: 30,
        min: 5
    },
    pixelArt: true,
    dom: {
        createContainer: true
    },
    input: {
        activePointers: 3
    },
    scene: [
       TitleScene,
        MainScene,
        MenuScene
    ],
    backgroundColor: '#FFFFFF',
    physics: {
        default: 'arcade',
        arcade: {
        //    debug: true,
            gravity: {
                y: 1000
            },
        }
    }
}
new Phaser.Game(config);