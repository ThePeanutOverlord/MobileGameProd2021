const WWIDTH = window.innerWidth;
const WHEIGHT = window.innerHeight;
const ASPECT = WWIDTH / WHEIGHT;
const BASE = 450;
const VERTICAL = ASPECT < 1;
const GAME_WIDTH = VERTICAL ? BASE : BASE * ASPECT;
const GAME_HEIGHT = VERTICAL ? BASE / ASPECT : BASE

/** @type {Phaser.Types.Core.GameConfig} */
const config = {
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
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
        activePointers: 2
    },
    scene: [
        // MapScene
        // PlatformScene,
        BasicScene,
        ControlsScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            gravity: {
                y: 250
            }
        }
    }
}
new Phaser.Game(config);