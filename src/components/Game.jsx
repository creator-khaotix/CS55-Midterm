// Directive to tell Next.js this component should run on the client side
"use client";

// This component shows one individual game
// It receives data from src/app/game/[id]/page.jsx

// Import React and hooks for component state and lifecycle management
import { React, useState, useEffect, Suspense } from "react";
// Import Next.js dynamic import for code splitting
import dynamic from "next/dynamic";
// Import function to get real-time game data from Firestore
import { getGameSnapshotById } from "@/src/lib/firebase/firestore.js";
// Import custom hook to get current user information
import { useUser } from "@/src/lib/getUser";
// Import GameDetails component for displaying game information
import GameDetails from "@/src/components/GameDetails.jsx";
// Import function to update game image in Firebase Storage
import { updateGameImage } from "@/src/lib/firebase/storage.js";

// Dynamically import ReviewDialog component for code splitting
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

// Export the default Game component with destructured props
export default function Game({
  id,
  initialGame,
  initialUserId,
  children,
}) {
  // State to store game details, initialized with initialGame prop
  const [gameDetails, setGameDetails] = useState(initialGame);
  // State to control whether the review dialog is open
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  // Get current user ID from useUser hook or fall back to initialUserId prop
  const userId = useUser()?.uid || initialUserId;
  // State to store the current review being written
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  // Function to handle changes to the review form
  const onChange = (value, name) => {
    // Update the review state with the new value for the specified field
    setReview({ ...review, [name]: value });
  };

  // Async function to handle game image upload
  async function handleGameImage(target) {
    // Get the first file from the file input, or null if no files
    const image = target.files ? target.files[0] : null;
    // Return early if no image was selected
    if (!image) {
      return;
    }
  
    // Upload the image and get the public URL
    const imageURL = await updateGameImage(id, image);
    // Update the game details with the new image URL
    setGameDetails({ ...gameDetails, photo: imageURL });
  }

  // Function to handle closing the review dialog
  const handleClose = () => {
    // Close the dialog
    setIsOpen(false);
    // Reset the review form to initial state
    setReview({ rating: 0, text: "" });
  };

  // Effect to set up real-time listener for game data changes
  useEffect(() => {
    // Return the cleanup function from getGameSnapshotById
    return getGameSnapshotById(id, (data) => {
      // Update game details when data changes
      setGameDetails(data);
    });
  }, [id]); // Dependency: game id

  // Return JSX for the Game component
  return (
    <>
      <GameDetails
        game={gameDetails}
        userId={userId}
        handleGameImage={handleGameImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </GameDetails>
      {/* Only render ReviewDialog if user is authenticated */}
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}

