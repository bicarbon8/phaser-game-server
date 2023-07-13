import * as Phaser from "phaser";
import { Server } from "socket.io";

declare global {
    interface Window { gameEngineReady: () => void; }
}

declare const io: Server;

export type GameServerEngineConfig = Omit<Phaser.Types.Core.GameConfig, 'type' | 'scale' | 'autoFocus' | 'width' | 'height'>;

export class GameServerEngine {
    private static readonly DEFAULT_CONFIG: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1,
        height: 1,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NONE
        },
        autoFocus: false
    };

    private _game: Phaser.Game;
    private _gameConfig: Phaser.Types.Core.GameConfig;

    constructor(config: GameServerEngineConfig) {
        console.debug('loaded game-engine file...');
        this._gameConfig = {
            ...GameServerEngine.DEFAULT_CONFIG,
            ...config
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