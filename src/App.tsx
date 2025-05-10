import { useState, useEffect, useRef, type FormEvent } from "react";
import "./App.css";
import { db } from "./firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import {
  getRandomPastelColor,
  getRandomPosition,
  getRandomSpeed,
} from "./utils/randomUtils";
import type { BalloonPosition, WishMessage } from "./App.type";
import RandomResultModal from "./components/RandomResultModal";
import QRCodeFloater from "./components/QRCodeFloater";
import { faker } from "@faker-js/faker";

function App() {
  const [wishMessages, setWishMessages] = useState<WishMessage[]>([]);
  const [allWishes, setAllWish] = useState<WishMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [balloonPositions, setBalloonPositions] = useState<
    Record<string, BalloonPosition>
  >({});
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notify = () => toast("ขอบคุณมากๆ นะครับ :D");

  // Fetch wish messages from database
  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const wishCollection = collection(db, "wish");

        // Import necessary functions from firebase/firestore
        const { query, orderBy } = await import("firebase/firestore");

        // Create a query to get all wishes, ordered by timestamp
        const wishQuery = query(
          wishCollection,
          orderBy("timestamp", "desc") // Order by timestamp in descending order (newest first)
        );

        const wishSnapshot = await getDocs(wishQuery);

        console.log("length of wishSnapshot:", wishSnapshot.docs.length);

        const wishList = wishSnapshot.docs.slice(0, 100).map((doc) => ({
          id: doc.id,
          color: getRandomPastelColor(), // Assign random pastel color
          ...doc.data(),
        })) as WishMessage[];

        const allWish = wishSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllWish(allWish);
        setWishMessages([...wishList]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching wish messages:", error);
        setLoading(false);
      }
    };

    fetchWishes();

    const timeInterval = setInterval(() => {
      fetchWishes();
    }, 30000); // Keep the interval to prevent memory leaks

    return () => {
      clearInterval(timeInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Initialize balloon positions when wishes are loaded
  useEffect(() => {
    if (wishMessages.length > 0 && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const positions: Record<string, BalloonPosition> = {};
      wishMessages.forEach((wish) => {
        positions[wish.id] = getRandomPosition(containerWidth, containerHeight);
      });

      setBalloonPositions(positions);
    }
  }, [wishMessages]);

  // Animation loop for moving balloons
  useEffect(() => {
    if (Object.keys(balloonPositions).length === 0 || !containerRef.current)
      return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const balloonWidth = 200; // Approximate balloon width
    const balloonHeight = 100; // Approximate balloon height

    const updatePositions = () => {
      setBalloonPositions((prevPositions) => {
        const newPositions = { ...prevPositions };

        Object.keys(newPositions).forEach((id) => {
          const balloon = newPositions[id];
          let { x, y, speedX, speedY } = balloon;

          // Update position
          x += speedX;
          y += speedY;

          // Check for collision with right/left walls
          if (x + balloonWidth > containerWidth) {
            x = containerWidth - balloonWidth;
            speedX = -getRandomSpeed(); // Random speed in opposite direction
          } else if (x < 0) {
            x = 0;
            speedX = getRandomSpeed(); // Random positive speed
          }

          // Check for collision with top/bottom walls
          if (y + balloonHeight > containerHeight) {
            y = containerHeight - balloonHeight;
            speedY = -getRandomSpeed(); // Random speed in opposite direction
          } else if (y < 0) {
            y = 0;
            speedY = getRandomSpeed(); // Random positive speed
          }

          newPositions[id] = { x, y, speedX, speedY };
        });

        return newPositions;
      });

      animationRef.current = requestAnimationFrame(updatePositions);
    };

    animationRef.current = requestAnimationFrame(updatePositions);

    // Cleanup animation frame on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balloonPositions, wishMessages]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    notify();
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      alert("Please fill in both name and message");
      return;
    }

    try {
      setIsSubmitting(true);

      // Add a new document to Firestore
      const wishRef = collection(db, "wish");
      const newWishDoc = await addDoc(wishRef, {
        name: name.trim(),
        message: message.trim(),
        timestamp: serverTimestamp(),
        color: getRandomPastelColor(), // Assign random pastel color
      });

      // Create a new wish object
      const newWish: WishMessage = {
        id: newWishDoc.id,
        name: name.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
        color: getRandomPastelColor(), // Assign random pastel color
      };

      // Update the local state
      setWishMessages((prev) => [...prev, newWish]);

      // Initialize position for the new balloon
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        setBalloonPositions((prev) => ({
          ...prev,
          [newWishDoc.id]: getRandomPosition(containerWidth, containerHeight),
        }));
      }

      // Reset form and close modal
      setName("");
      setMessage("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding wish:", error);
      alert("Failed to add your wish. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <QRCodeFloater />
      <div className="header">
        <h1>Wedding Wishes</h1>
        {/* Plus Button */}
        <button
          className="add-wish-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Add a wish"
        >
          + Add a Wish
        </button>
        <img
          src="/dice-svgrepo-com.svg"
          alt="Dice Logo"
          className="dice-logo"
          onClick={() => setIsRandomModalOpen(true)}
        />
        <ToastContainer />
      </div>

      <div className="wish-list-container" ref={containerRef}>
        {loading ? (
          <div className="loading-container">
            <p>Loading wishes...</p>
          </div>
        ) : wishMessages.length > 0 ? (
          wishMessages.map((wish) => (
            <div
              key={wish.id}
              className="balloon-moving"
              style={{
                left: `${balloonPositions[wish.id]?.x || 0}px`,
                top: `${balloonPositions[wish.id]?.y || 0}px`,
                backgroundColor: wish.color, // Set balloon color
              }}
            >
              <strong>{wish.name || "Anonymous"}</strong>
              <p>{wish.message || "No message"}</p>
            </div>
          ))
        ) : (
          <div className="no-wishes-container">
            <p>No wishes found.</p>
          </div>
        )}

        {
          /* Random Modal Button */
          isRandomModalOpen && (
            <RandomResultModal
              wishMessages={allWishes}
              cancelCallback={() => setIsRandomModalOpen(false)}
            />
          )
        }

        {/* Modal Form */}
        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-container">
              <h2>Cheers to the newlyweds</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name:</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Enter your nick name"
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Your Message:</label>
                  <label className="caution-message" htmlFor="message">
                    ขอร้องนะครับ อย่า DDOS, อย่า Injection, อย่าโจมตีทาง Cyber
                    ใดๆ เว็บไม่มี Security ครับ ทำไม่ทัน T^T
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
