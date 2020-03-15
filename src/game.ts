import 'phaser';

const PERSON_VELOCITY = 160;
export default class Game extends Phaser.Scene {
    person = null;
    cursors = null;

    constructor() {
        super('Game');
    }

    preload() {
        this.load.image('background', 'assets/v1/background.png');
        this.load.spritesheet('person', 'assets/v1/person-animated.png', {
            frameWidth: 127, frameHeight: 220
        });
        this.load.image('house1', 'assets/v1/house1.png');
    }

    create() {
        this.add
            .image(400, 300, 'background')
            .setScale(0.5);

        const person = this.physics.add
            .sprite(400, 300, 'person')
            .setScale(0.4)
            .setCollideWorldBounds(true);


        this.anims.create({
            key: 'stay',
            frames: [{key: 'person', frame: 0}],
            frameRate: 20
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('person', {start: 0, end: 1}),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.person = person;
    }

    update(time: number, delta: number): void {
        const cursors = this.cursors;
        const person = this.person;

        if (
            cursors.left.isDown ||
            cursors.right.isDown ||
            cursors.up.isDown ||
            cursors.down.isDown
        ) {
            person.anims.play('walk', true);
        } else {
            person.anims.play('stay', true);
        }
        let velocityX = 0;
        if (cursors.left.isDown) {
            velocityX = -1 * PERSON_VELOCITY
        } else if (cursors.right.isDown) {
            velocityX = PERSON_VELOCITY
        }

        let velocityY = 0;
        if (cursors.up.isDown) {
            velocityY = -1 * PERSON_VELOCITY
        } else if (cursors.down.isDown) {
            velocityY = PERSON_VELOCITY
        }


        person.setVelocity(velocityX, velocityY);
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    canvasStyle: 'border: 1px solid red;',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    },
    scene: Game
};

const game = new Phaser.Game(config);
