export interface WishMessage {
    id: string;
    name?: string;
    message?: string;
    timestamp?: string;
    color?: string; // Add color property to WishMessage interface
}

export interface BalloonPosition {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
}
