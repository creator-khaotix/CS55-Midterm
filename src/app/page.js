// Import the GameListings component from the components directory
import GameListings from "@/src/components/GameListings.jsx";
// Import the getGames function from the firestore module to fetch game data
import { getGames } from "@/src/lib/firebase/firestore.js";
// Import the getAuthenticatedAppForUser function to get authenticated Firebase app for server-side rendering
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import getFirestore from Firebase to get Firestore database instance
import { getFirestore } from "firebase/firestore";

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it

// Export dynamic configuration to force server-side rendering for this page
export const dynamic = "force-dynamic";

// This line also forces this route to be server-side rendered
// export const revalidate = 0;

// Define the default Home component as an async function that receives props
export default async function Home(props) {
  // Extract searchParams from props and await it (Next.js provides this for URL query parameters)
  const searchParams = await props.searchParams;
  // Using seachParams which Next.js provides, allows the filtering to happen on the server-side, for example:
  // ?releaseYear=2011&genre=RPG&sort=Review
  // Get authenticated Firebase app instance for server-side operations
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Fetch games data using the Firestore database instance and search parameters
  const games = await getGames(
    getFirestore(firebaseServerApp),
    searchParams
  );
  // Return JSX with main element containing GameListings component
  return (
    <main className="main__home">
      <GameListings
        initialGames={games}
        searchParams={searchParams}
      />
    </main>
  );
}
