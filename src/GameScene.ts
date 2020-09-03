import Destructor from "./Destructor";
import Timer from "./Timer";
import GameState from "./GameState";
import POINTER_UP = Phaser.Input.Events.POINTER_UP;

const PERSON_VELOCITY = 260;
const DESTRUCTOR_VELOCITY = 70;
const VOTE_STOP_DELAY_MS = 2000;

export default class GameScene extends Phaser.Scene {
    person = null;
    destructors: Destructor[];
    houses: Phaser.Physics.Arcade.StaticGroup = null;

    soundIcon: Phaser.GameObjects.Image;
    sendLetterIcon: Phaser.GameObjects.Image;
    voteStopIcon: Phaser.GameObjects.Image;
    resetIcon: Phaser.GameObjects.Image;

    timer: Timer = null;

    cursorKeys = null;
    moveKeys = null;
    pointer: Phaser.Input.Pointer;

    constructor() {
        super('game_scene');
    }

    create() {
        this.add.image(400, 300, 'background')

        this.houses = this.physics.add.staticGroup();
        const housesYOffset = 50;
        const h1 = this.houses
            .create(220, 95 + housesYOffset, 'house1');
        h1.body.setSize(h1.body.width - 36, h1.body.height).setOffset(0, 0)
        const h2 = this.houses
            .create(h1.x + h1.displayWidth - 42, 126.5 + housesYOffset, 'house2');
        h2.body.setSize(h2.body.width - 27, h2.body.height).setOffset(0, 0)
        const h3 = this.houses
            .create(h2.x + h2.displayWidth - 22, 104 + housesYOffset, 'house3');
        h3.body.setSize(h3.body.width - 35, h3.body.height).setOffset(0, 0)
        const h4 = this.houses
            .create(h3.x + h3.displayWidth - 57, 113 + housesYOffset, 'house4')

        h4.body
            .setSize(h4.body.width - 40, h4.body.height)
            .setOffset(0, 0);

        this.person = this.physics.add
            .sprite(700, 300, 'person')
            .setScale(0.9)
            .setCollideWorldBounds(true);

        Destructor.initAnimations(this.anims)
        this.destructors = [
            new Destructor(this, 100, 650, 'destructor1', DESTRUCTOR_VELOCITY - 10),
            new Destructor(this, 300, 650, 'destructor2', DESTRUCTOR_VELOCITY),
            new Destructor(this, 800, 750, 'destructor3', DESTRUCTOR_VELOCITY + 40),
            new Destructor(this, 500, 1000, 'destructor2', DESTRUCTOR_VELOCITY + 60, null, true)
        ];

        // interactions of game objects
        this.physics.world.on('worldbounds', () => {
            console.log('bum')
        });
        this.physics.add.collider(this.person, this.houses, this.personOverlapHouse);
        this.destructors.forEach(d => {
            this.physics.add.collider(d, this.houses, this.destructorOverlapHouse);
            this.physics.add.collider(this.person, d, this.personOverlapDestructor);
        });


        this.anims.create({
            key: 'person_stay',
            frames: [{key: 'person', frame: 0}],
            frameRate: 20
        });

        this.anims.create({
            key: 'person_walk',
            frames: this.anims.generateFrameNumbers('person', {start: 0, end: 1}),
            frameRate: 10,
            repeat: -1
        });

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.moveKeys = this.input.keyboard.addKeys('W,A,S,D');
        this.pointer = this.input.pointer1; // touch screen

        // additional controls
        this.sendLetterIcon = this.add.image(40, 45, 'send_letter').setInteractive();
        this.sendLetterIcon.on(POINTER_UP, () => this._processSendLetter())
        this.input.keyboard.once('keyup-ONE', () => this._processSendLetter())

        this.voteStopIcon = this.add.image(40, 95, 'vote_stop').setInteractive();
        this.voteStopIcon.on(POINTER_UP, () => this._processVoteStop())
        this.input.keyboard.once('keyup-TWO', () => this._processVoteStop())

        //sound
        const music = this.sound.add('music', {volume: 0.7, loop: true, rate: 1.2});
        music.play()
        const destructorSound = this.sound.add('destructor_sound', {volume: 0.8, loop: true, rate: 1, delay: 2});
        destructorSound.play()
        this.soundIcon = this.add.image(773, 25, 'music_on').setInteractive();
        const toggleSound = (on) => {
            if (on) {
                this.sound.resumeAll()
                this.soundIcon.setTexture('music_on');
            } else {
                this.sound.pauseAll()
                this.soundIcon.setTexture('music_off');
            }
        }
        toggleSound(GameState.soundOn)
        this.soundIcon.on(POINTER_UP, () => {
            GameState.soundOn = !GameState.soundOn
            toggleSound(GameState.soundOn)
        })

        // restart
        this.resetIcon = this.add.image(773, 75, 'reset').setInteractive();
        this.resetIcon.on(POINTER_UP, () => {
            this._resetGame()
        })

        // timer
        this.timer = new Timer(this, 350, 10, () => {
            this._stopGameOnTime()
        });
        this.timer.start()
    }

    update(time: number, delta: number): void {
        if (GameState.gameFinish) return

        const person = this.person;
        let velocityX = 0;
        let velocityY = 0;
        if (this.pointer && this.pointer.active) {
            if(!this._isPointerUnderButtons()) {
                const angle = Phaser.Math.Angle.Between(person.x, person.y, this.pointer.x, this.pointer.y);
                const velocity = this.physics.velocityFromRotation(angle, PERSON_VELOCITY);
                velocityX = velocity.x;
                velocityY = velocity.y
            }
        } else {
            if (this._isPersonWalk_left()) {
                velocityX = -1 * PERSON_VELOCITY
            } else if (this._isPersonWalk_right()) {
                velocityX = PERSON_VELOCITY
            }
            if (this._isPersonWalk_up()) {
                velocityY = -1 * PERSON_VELOCITY
            } else if (this._isPersonWalk_down()) {
                velocityY = PERSON_VELOCITY
            }
        }

        person.setVelocity(velocityX, velocityY);
        if (velocityX != 0 || velocityY != 0) {
            person.anims.play('person_walk', true);
        } else {
            person.anims.play('person_stay', true);
        }

        const aliveHouses = this._getAliveHouses();

        this.destructors.forEach(d => d.update(aliveHouses))

        this.timer.update()
    }

    personOverlapHouse(person, house) {
    }

    personOverlapDestructor(person, destructor: Destructor) {
        if (destructor.isStopped()) return

        destructor.startMovingBack();
    }

    destructorOverlapHouse = (destructor: Destructor, house: Phaser.Physics.Arcade.Sprite) => {
        if (destructor.isMovingBack())
            return

        this._playCrashSound()
        house.disableBody(true, true);

        destructor.startMovingBack();
        if (this._getAliveHouses().length == 0) {
            this._stopGameOnDestroyAllHouses()
        }

        // TODO disable only target house
        // TODO only for one destructor should call (need to use texture key)
    }

    _playCrashSound() {
        if (GameState.soundOn) {
            this.sound.play('crash', {volume: 0.3, rate: 0.7})
        }
    }

    _isPersonWalk_left() {
        return this.cursorKeys.left.isDown || this.moveKeys.A.isDown
    }

    _isPersonWalk_right() {
        return this.cursorKeys.right.isDown || this.moveKeys.D.isDown
    }

    _isPersonWalk_up() {
        return this.cursorKeys.up.isDown || this.moveKeys.W.isDown
    }

    _isPersonWalk_down() {
        return this.cursorKeys.down.isDown || this.moveKeys.S.isDown
    }

    _getAliveHouses() {
        return this.houses.children.entries.filter(h => h.active);
    }

    _isPointerUnderButtons() {
        const clickableIcons = [this.sendLetterIcon, this.voteStopIcon, this.soundIcon, this.resetIcon]
        return clickableIcons.some(icon => {
            return icon.getBounds().contains(this.pointer.worldX, this.pointer.worldY)
        })
    }

    _stopGameOnDestroyAllHouses() {
        this.timer.stop();
        this._processStop();
    }

    _stopGameOnTime() {
        this._processStop();
        console.log('alive houses ' + this._getAliveHouses().length);
    }

    _processSendLetter() {
        this.destructors.forEach(d => {
            d.startMovingBackDelayed()
        })

        this.sendLetterIcon.input.enabled = false
        this.sendLetterIcon.setAlpha(0.5)
    }

    _processVoteStop() {
        this.destructors.forEach(d => {
            d.stop()
        })
        this.scene.scene.time.addEvent({
            delay: VOTE_STOP_DELAY_MS,
            callback: () => {
                this.destructors.forEach(d => {
                    d.unstop()
                })
            }
        })

        this.voteStopIcon.input.enabled = false
        this.voteStopIcon.setAlpha(0.5)
    }

    _processStop() {
        GameState.gameFinish = true;

        this.destructors.forEach(d => {
            d.stop()
        });
        this.person.setVelocity(0);
        this.person.anims.stop()

        GameState.aliveHouses = this._getAliveHouses().length;

        this.scene.launch('game_end_scene', {
            person: this.person,
            houses: this._getAliveHouses(),
            destructors: this.destructors,
            additionalObjects: [this.soundIcon]
        })
    }

    _resetGame() {
        this.scene.restart()

        this.sound.removeByKey('destructor_sound');
        this.sound.removeByKey('music');
    }
}
