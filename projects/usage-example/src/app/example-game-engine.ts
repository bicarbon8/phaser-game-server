import { GameServerEngine } from "phaser-game-server-engine";
import { ExampleScene } from "./scenes/example-scene";

export class ExampleGameEngine extends GameServerEngine {
    constructor() {
        super({scene: [ExampleScene]});
    }
}

export module ExampleGameEngine {
    export const game = new ExampleGameEngine().game;
}