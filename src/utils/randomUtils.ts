import type { WishMessage } from "../App.type";

export function getRandomSpeed() {
    // Random speed between -0.75 and 0.75, never 0
    const speed = Math.random() * 0.015 + 0.15;
    return Math.random() > 0.5 ? speed : -speed;
}

export function getRandomPosition(containerWidth: number, containerHeight: number) {
    return {
        x: Math.random() * (containerWidth - 220), // Account for balloon width
        y: Math.random() * (containerHeight - 100), // Account for balloon height
        speedX: getRandomSpeed(),
        speedY: getRandomSpeed(),
    };
}

// Function to generate random pastel colors
export function getRandomPastelColor() {
    // For pastel colors, we use higher base values (180-255)
    const r = Math.floor(Math.random() * 55 + 200);
    const g = Math.floor(Math.random() * 55 + 200);
    const b = Math.floor(Math.random() * 55 + 200);
    return `rgb(${r}, ${g}, ${b})`;
}

export function getRandomWinners(wishMessages: WishMessage[], numberOfWinners: number): WishMessage[] {
    const winners = [];
    const usedIndexes = new Set<number>();

    while (winners.length < numberOfWinners && winners.length < wishMessages.length) {
        const randomIndex = Math.floor(Math.random() * wishMessages.length);
        if (!usedIndexes.has(randomIndex)) {
            usedIndexes.add(randomIndex);
            winners.push(wishMessages[randomIndex]);
        }
    }

    return winners;
}

export function getRandomWinnersWithExclusion(randomPool: WishMessage[], exclusionPool: WishMessage[]): WishMessage[] {
    const winners = [];
    const exclusionName = exclusionPool.map((message) => message.name).filter((name) => name) as string[];
    const usedNames = new Set<string>(exclusionName);

    while (winners.length < 1) {
        const randomIndex = Math.floor(Math.random() * randomPool.length);
        const randomName = randomPool[randomIndex].name;
        if (randomName) {
            if (!usedNames.has(randomName)) {
                usedNames.add(randomName);
                winners.push(randomPool[randomIndex]);
            }
        }
    }

    return winners;
}