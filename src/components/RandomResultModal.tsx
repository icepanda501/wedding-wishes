import {
  getRandomNormalColor,
  getRandomWinnersWithExclusion,
} from "../utils/randomUtils";
import type { WishMessage } from "../App.type";
import { useState } from "react";

declare global {
  interface Window {
    CONFIG_WINNER?: number;
  }
}

export type RandomResultModalProps = {
  wishMessages: WishMessage[];
  cancelCallback: () => void;
};

const RandomResultModal = (props: RandomResultModalProps) => {
  const [winners, setWinners] = useState<WishMessage[]>([]);
  const [randomWinnersAnimation, setRandomWinnersAnimation] = useState<{
    name: string;
    color: string;
  }>({ name: "", color: "" });
  const [rerollLoading, setRerollLoading] = useState(false);
  const NUMBER_OF_WINNERS = window.CONFIG_WINNER ?? 3;

  const rollNewWinners = async () => {
    setRerollLoading(true);
    const newWinner = getRandomWinnersWithExclusion(
      props.wishMessages,
      winners
    );
    randomAnimation();
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate loading
    setRerollLoading(false);
    setWinners([...winners, ...newWinner]);
  };

  const randomAnimation = async () => {
    const wishes = props.wishMessages;
    for (let i = 0; i < props.wishMessages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setRandomWinnersAnimation({
        name: wishes[i].name ?? "",
        color: getRandomNormalColor(),
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2>Game Winners!</h2>
        <h1>
          <ol>
            {winners.map((winner, index) => (
              <li key={index} className="winner-text">
                {winner.name || "Anonymous"}
              </li>
            ))}
          </ol>
        </h1>
        <div className="modal-button-group">
          {rerollLoading && (
            <div
              className="random-animation"
              style={{ color: randomWinnersAnimation.color }}
            >
              {randomWinnersAnimation.name}
            </div>
          )}
          <button
            type="button"
            onClick={rollNewWinners}
            disabled={winners.length >= NUMBER_OF_WINNERS || rerollLoading}
          >
            {rerollLoading ? "..." : "🎲 Roll for Winners"}
          </button>
          <button
            type="button"
            onClick={props.cancelCallback}
            disabled={
              winners.length < NUMBER_OF_WINNERS && winners.length !== 0
            }
          >
            Congrats 🎉🎉🎉
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomResultModal;
