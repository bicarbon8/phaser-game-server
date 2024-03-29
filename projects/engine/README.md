# phaser-game-server-engine
a headless Phaser.io game server class to be extended by one's own game server code

## installation
```
npm install phaser-game-server phaser-game-server-engine --save
```

## usage
to use the `phaser-game-server-engine` you will need to create a new npm project and define a startup scene (extending from `Phaser.Scene`) that will run your game like follows:
```typescript
import * as Phaser from "phaser";
import { Server, Socket } from "socket.io";

declare const io: Server;

export class ExampleScene extends Phaser.Scene {
    preload(): void {
        // load all required sprites
        this.load.image('bomb', `assets/bomb_circle.png`);
    }

    create(): void {
        io.on('connection', (socket: Socket) => {
            console.debug(`player: ${socket.id} connected`);
            socket.on('disconnect', () => {
                console.debug(`player: ${socket.id} disconnected`);
            });
            // add additional socket message handling here
        });
    }

    update(time: number, delta: number): void {
        // handle game updates and send messages to client(s)
    }
}
```
then you must create a class that extends the `GameServerEngine` class passing in your startup scene like follows:
```typescript
import { GameServerEngine } from "phaser-game-server-engine";
import { ExampleScene } from "./scenes/example-scene";

export class ExampleGameEngine extends GameServerEngine {
    constructor() {
        /**
         * NOTE: you can also define an inline
         * scene here instead of in a separate
         * file
         */
        super({
            scene: [ExampleScene],
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    gravity: { x: 0, y: 0 },
                }
            }
        });
    }
}

export module ExampleGameEngine {
    export const game = new ExampleGameEngine().game;
}
```
> NOTE: the object passed to the `super` call above can contain any valid property from `Phaser.Types.Core.GameConfig` except: `type`, `scale`, `autoFocus`, `width`, or `height`.

after the above you should bundle your code (see included `webpack.config.cjs` in the `usage-example` project) and create a `server.config.json` file containing your bundled script references (see included example in `usage-example` project). 

to start the server use the following command:
```
> npx phaser-game-server -s
```
or to start as a background task:
```
> npx phaser-game-server -s -b
```