import * as Phaser from "phaser";
import { Server } from "socket.io";

declare global {
    interface Window { gameEngineReady: () => void; }
}

declare const io: Server;

export type GameEngineConfig = {
    /**
     * the `Phaser.Scene` or scenes to load into the game-engine
     * 
     * NOTE: once loaded only the first will be automatically started
     */
    scene: Function 
    | Phaser.Scene 
    | Phaser.Scene[] 
    | Phaser.Types.Scenes.SettingsConfig 
    | Phaser.Types.Scenes.SettingsConfig[] 
    | Phaser.Types.Scenes.CreateSceneFromObjectConfig 
    | Phaser.Types.Scenes.CreateSceneFromObjectConfig[] 
    | Function[];
}

export class GameServerEngine {
    private static readonly DEFAULT_CONFIG: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1,
        height: 1,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NONE
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: false,
                gravity: { x: 0, y: 0 },
            }
        },
        autoFocus: false
    };

    private _game: Phaser.Game;
    private _gameConfig: Phaser.Types.Core.GameConfig;

    constructor(config: GameEngineConfig) {
        console.debug('loaded game-engine file...');
        this._gameConfig = {
            ...GameServerEngine.DEFAULT_CONFIG,
            scene: config.scene
        };
    }

    get game(): Phaser.Game {
        if (!this._game) {
            this.start();
        }
        return this._game;
    }

    get io(): Server {
        return io;
    }
    
    start(): GameServerEngine {
        console.debug('started phaser-game-engine...');
        this._game = new Phaser.Game(this._gameConfig);
        // once the game loop is loaded and running, signal to the server we are ready
        this._game.events.once(Phaser.Core.Events.READY, () => window.gameEngineReady());
        
        return this;
    }

    stop(): GameServerEngine {
        this._game.destroy(false, false);
        this._game = null;
        return this;
    }
}