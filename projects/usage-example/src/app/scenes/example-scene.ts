import * as Phaser from "phaser";
import { Server, Socket } from "socket.io";

declare const io: Server;

export class ExampleScene extends Phaser.Scene {
    preload(): void {
        this.load.image('bomb', `assets/bomb_circle.png`);
    }

    create(): void {
        this._setupSocketEventHandling();
    }

    update(time: number, delta: number): void {
        
    }

    private _setupSocketEventHandling(): void {
        io?.on('connection', (socket: Socket) => {
            console.debug(`player: ${socket.id} connected`);
            socket.on('disconnect', () => {
                console.debug(`player: ${socket.id} disconnected`);
            });
        });
    }
}