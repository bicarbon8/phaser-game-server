import { GameServerEngine } from "phaser-game-server-engine";
import { ExampleScene } from "./scenes/example-scene";

export class ExampleGameEngine extends GameServerEngine {
    constructor() {
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