// Import function to generate fake game and review data for testing
import { generateFakeGamesAndReviews } from "@/src/lib/fakeGames.js";

// Import Firebase Firestore functions for database operations
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

// Import the Firestore database instance from the client app configuration
import { db } from "@/src/lib/firebase/clientApp";

// Export async function to update a game's image reference in Firestore
export async function updateGameImageReference(
  gameId,
  publicImageUrl
) {
  // Create a document reference for the specific game using its ID
  const gameRef = doc(collection(db, "games"), gameId);
  // Check if the game reference exists
  if (gameRef) {
    // Update the game document with the new photo URL
    await updateDoc(gameRef, { photo: publicImageUrl });
  }
}

// Helper function to update game rating within a transaction
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  // Get the current game document data within the transaction
  const game = await transaction.get(docRef);
  // Extract the data from the game document
  const data = game.data();
  // Calculate new number of ratings (increment by 1 or set to 1 if no ratings exist)
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  // Calculate new sum of ratings (add current rating to existing sum)
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  // Calculate new average rating
  const newAverage = newSumRating / newNumRatings;

  // Update the game document with new rating statistics
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  // Add the new review document to the ratings subcollection
  transaction.set(newRatingDocument, {
    // Spread all review data
    ...review,
    // Add current timestamp to the review
    timestamp: Timestamp.fromDate(new Date()),
  });
};

// Export async function to add a review to a game
export async function addReviewToGame(db, gameId, review) {
  // Validate that gameId is provided
  if (!gameId) {
          // Throw error if gameId is missing
          throw new Error("No game ID has been provided.");
  }

  // Validate that review data is provided
  if (!review) {
          // Throw error if review is missing
          throw new Error("A valid review has not been provided.");
  }

  // Try to add the review using a Firestore transaction
  try {
          // Create document reference for the game
          const docRef = doc(collection(db, "games"), gameId);
          // Create document reference for the new rating in the subcollection
          const newRatingDocument = doc(
                  collection(db, `games/${gameId}/ratings`)
          );

          // corrected line
          // Run a transaction to ensure data consistency when adding review
          await runTransaction(db, transaction =>
                  updateWithRating(transaction, docRef, newRatingDocument, review)
          );
  } catch (error) {
          // Log error details for debugging
          console.error(
                  "There was an error adding the rating to the game",
                  error
          );
          // Re-throw the error to be handled by the caller
          throw error;
  }
}

// Helper function to apply query filters to a Firestore query
function applyQueryFilters(q, { genre, releaseYear, sort }) {
  // Add genre filter if specified
  if (genre) {
    q = query(q, where("genre", "==", genre));
  }
  // Add releaseYear filter if specified
  if (releaseYear) {
    q = query(q, where("releaseYear", "==", Number(releaseYear)));
  }
  // Add sorting based on sort parameter
  if (sort === "Rating" || !sort) {
    // Sort by average rating in descending order (default)
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    // Sort by number of ratings in descending order
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the modified query
  return q;
}

// Export async function to get games from Firestore with optional filters
export async function getGames(db = db, filters = {}) {
  // Create initial query for games collection
  let q = query(collection(db, "games"));

  // Apply any specified filters to the query
  q = applyQueryFilters(q, filters);
  // Execute the query and get the results
  const results = await getDocs(q);
  // Map the results to include document ID and convert timestamp to Date object
  return results.docs.map((doc) => {
    return {
      // Include the document ID
      id: doc.id,
      // Spread all document data
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // Convert Firestore timestamp to JavaScript Date object
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Export function to get real-time snapshot of games with callback
export function getGamesSnapshot(cb, filters = {}) {
  // Validate that callback is a function
  if (typeof cb !== "function") {
    // Log error if callback is not a function
    console.log("Error: The callback parameter is not a function");
    // Return early if callback is invalid
    return;
  }

  // Create initial query for games collection
  let q = query(collection(db, "games"));
  // Apply any specified filters to the query
  q = applyQueryFilters(q, filters);

  // Return real-time snapshot listener
  return onSnapshot(q, (querySnapshot) => {
    // Map the snapshot results to include document ID and convert timestamp
    const results = querySnapshot.docs.map((doc) => {
      return {
        // Include the document ID
        id: doc.id,
        // Spread all document data
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert Firestore timestamp to JavaScript Date object
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Call the callback function with the results
    cb(results);
  });
}

// Export async function to get a single game by its ID
export async function getGameById(db, gameId) {
  // Validate that gameId is provided
  if (!gameId) {
    // Log error if gameId is invalid
    console.log("Error: Invalid ID received: ", gameId);
    // Return early if gameId is invalid
    return;
  }
  // Create document reference for the specific game
  const docRef = doc(db, "games", gameId);
  // Get the document snapshot
  const docSnap = await getDoc(docRef);
  // Return game data with converted timestamp
  return {
    // Spread all document data
    ...docSnap.data(),
    // Convert Firestore timestamp to JavaScript Date object
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Export function to get real-time snapshot of a single game (currently not implemented)
export function getGameSnapshotById(gameId, cb) {
  // Function body is empty - implementation needed
  return;
}

// Export async function to get reviews for a specific game
export async function getReviewsByGameId(db, gameId) {
  // Validate that gameId is provided
  if (!gameId) {
    // Log error if gameId is invalid
    console.log("Error: Invalid gameId received: ", gameId);
    // Return early if gameId is invalid
    return;
  }

  // Create query for ratings subcollection, ordered by timestamp descending
  const q = query(
    collection(db, "games", gameId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Execute the query and get the results
  const results = await getDocs(q);
  // Map the results to include document ID and convert timestamp to Date object
  return results.docs.map((doc) => {
    return {
      // Include the document ID
      id: doc.id,
      // Spread all document data
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // Convert Firestore timestamp to JavaScript Date object
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Export function to get real-time snapshot of reviews for a specific game
export function getReviewsSnapshotByGameId(gameId, cb) {
  // Validate that gameId is provided
  if (!gameId) {
    // Log error if gameId is invalid
    console.log("Error: Invalid gameId received: ", gameId);
    // Return early if gameId is invalid
    return;
  }

  // Create query for ratings subcollection, ordered by timestamp descending
  const q = query(
    collection(db, "games", gameId, "ratings"),
    orderBy("timestamp", "desc")
  );
  // Return real-time snapshot listener
  return onSnapshot(q, (querySnapshot) => {
    // Map the snapshot results to include document ID and convert timestamp
    const results = querySnapshot.docs.map((doc) => {
      return {
        // Include the document ID
        id: doc.id,
        // Spread all document data
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert Firestore timestamp to JavaScript Date object
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    // Call the callback function with the results
    cb(results);
  });
}

// Export async function to add fake games and reviews to Firestore for testing
export async function addFakeGamesAndReviews() {
  // Generate fake game and review data
  const data = await generateFakeGamesAndReviews();
  // Iterate through each game and its ratings data
  for (const { gameData, ratingsData } of data) {
    // Try to add the game and its reviews
    try {
      // Add the game document to the games collection
      const docRef = await addDoc(
        collection(db, "games"),
        gameData
      );

      // Add each rating/review to the game's ratings subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "games", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      // Log error messages if document addition fails
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
