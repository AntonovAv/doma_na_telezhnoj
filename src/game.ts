import 'phaser';

import LoadingScene from "./LoadingScene";
import StartScene from "./StartScene";
import GameScene from "./GameScene";
import GameEndScene from "./GameEndScene";

// @ts-ignore
const development = DEVELOPMENT_MODE
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    canvasStyle: development ? 'outline: 1px solid red;' : '',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: development
        }
    },
    parent: document.getElementById('container'),
    resolution: window.devicePixelRatio,
    scene: [
        LoadingScene,
        StartScene,
        GameScene,
        GameEndScene
    ]
};

const game = new Phaser.Game(config);
