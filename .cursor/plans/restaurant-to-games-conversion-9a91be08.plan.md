<!-- 9a91be08-be7e-4d48-b851-5c6433e72c9d e302cae8-7ad2-4b41-bf8e-1a568cedda48 -->
# Transform Restaurant App to Best Games of All Time

## Data Model Changes

### Update Firestore Collection & Fields

- Change collection name from `restaurants` to `games`
- Replace `city` field with `releaseYear` (year as number)
- Replace `category` field with `genre` (game genre)
- Remove `price` field entirely
- Keep: `name`, `avgRating`, `numRatings`, `sumRating`, `photo`, `timestamp`

### Update Firestore Indexes (`firestore.indexes.json`)

- Change all `collectionGroup` from "restaurants" to "games"
- Replace `city` with `releaseYear` in all indexes
- Replace `category` with `genre` in all indexes
- Remove all price-related indexes

## Component & File Changes

### Core Component Renames

- `Restaurant.jsx` → Keep filename, update internal logic
- `RestaurantDetails.jsx` → Keep filename, update text/labels
- `RestaurantListings.jsx` → Keep filename, update variable names and UI text

### Update `src/lib/fakeRestaurants.js`

- Rename to `fakeGames.js`
- Change function name to `generateFakeGamesAndReviews()`
- Update data structure to use `genre` and `releaseYear`
- Remove `price` generation
- Update photo URLs (keep storage functionality)

### Update `src/lib/randomData.js`

- Replace `restaurantNames` with famous game titles
- Replace `restaurantCities` with `releaseYears` (e.g., 2004, 2011, 2015, 2020, etc.)
- Replace `restaurantCategories` with `gameGenres` (RPG, FPS, Adventure, Strategy, Sports, etc.)
- Update `restaurantReviews` to `gameReviews` with game-appropriate review text

### Update Filters (`src/components/Filters.jsx`)

- Change "Category" filter to "Genre" with game genres
- Change "City" filter to "Release Year" with years
- Remove "Price" filter completely
- Update filter summary text from "Restaurants" to "Games"
- Update icons appropriately

### Update Firestore Functions (`src/lib/firebase/firestore.js`)

- Change all collection references from "restaurants" to "games"
- Update `updateRestaurantImageReference()` to `updateGameImageReference()`
- Update `addReviewToRestaurant()` to `addReviewToGame()`
- Update `getRestaurants()` to `getGames()`
- Update `getRestaurantById()` to `getGameById()`
- Update `getRestaurantSnapshotById()` to `getGameSnapshotById()`
- Update `addFakeRestaurantsAndReviews()` to `addFakeGamesAndReviews()`
- Update filter logic to use `genre` and `releaseYear`, remove `price`

### Update Storage (`src/lib/firebase/storage.js`)

- Update `updateRestaurantImage()` to `updateGameImage()`
- Keep upload functionality intact for user uploads

## UI & Text Updates

### Header (`src/components/Header.jsx`)

- Change logo text from "Friendly Eats" to appropriate game app name
- Change menu item from "Add sample restaurants" to "Add sample games"

### Layout (`src/app/layout.js`)

- Update metadata title and description to reflect games app

### Main Page (`src/app/page.js`)

- Update component imports
- Update function calls to use game-related functions

### Restaurant Route (`src/app/restaurant/[id]/`)

- Keep route structure but update internal logic
- Update all references to use game data

### All Components

- Update all UI text: "restaurant" → "game"
- Update CSS classes that reference restaurants (if semantic)
- Update comments and documentation

## Data Population

### Create Top 10 Games List

Populate `src/lib/randomData.js` with top 10 games of all time:

1. World of Warcraft (2004, MMORPG) - Forced to #1
2. The Legend of Zelda: Breath of the Wild (2017, Action-Adventure)
3. The Witcher 3: Wild Hunt (2015, RPG)
4. Red Dead Redemption 2 (2018, Action-Adventure)
5. The Last of Us (2013, Action-Adventure)
6. Portal 2 (2011, Puzzle)
7. Half-Life 2 (2004, FPS)
8. Dark Souls (2011, RPG)
9. Super Mario 64 (1996, Platformer)
10. Minecraft (2011, Sandbox)

### Update Review Text

Create game-appropriate reviews focusing on:

- Gameplay mechanics
- Story quality
- Graphics/visuals
- Replayability
- Overall experience

### To-dos

- [ ] Update randomData.js with game data (genres, release years, game names, game reviews)
- [ ] Update firestore.indexes.json to use 'games' collection with 'genre' and 'releaseYear' fields, remove price indexes
- [ ] Rename and update fakeRestaurants.js to fakeGames.js with game data structure
- [ ] Update all Firestore functions in firestore.js to use 'games' collection and new field names
- [ ] Update storage.js functions for game image uploads
- [ ] Update Filters.jsx to show Genre and Release Year, remove Price filter
- [ ] Update all React components (Restaurant.jsx, RestaurantDetails.jsx, RestaurantListings.jsx) with game-related text and logic
- [ ] Update Header.jsx and layout.js with game app branding and metadata
- [ ] Update page.js and restaurant route pages to use game functions and display game data
- [ ] Update actions.js to use game-related functions for reviews