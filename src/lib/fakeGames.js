import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

export async function generateFakeGamesAndReviews() {
  const gamesToAdd = 10;
  const data = [];

  // Top 10 games with World of Warcraft at #1
  const topGames = [
    { name: "World of Warcraft", genre: "MMORPG", releaseYear: 2004, avgRating: 5 },
    { name: "The Legend of Zelda: Breath of the Wild", genre: "Action-Adventure", releaseYear: 2017, avgRating: 4.9 },
    { name: "The Witcher 3: Wild Hunt", genre: "RPG", releaseYear: 2015, avgRating: 4.9 },
    { name: "Red Dead Redemption 2", genre: "Action-Adventure", releaseYear: 2018, avgRating: 4.8 },
    { name: "The Last of Us", genre: "Action-Adventure", releaseYear: 2013, avgRating: 4.8 },
    { name: "Portal 2", genre: "Puzzle", releaseYear: 2011, avgRating: 4.7 },
    { name: "Half-Life 2", genre: "FPS", releaseYear: 2004, avgRating: 4.7 },
    { name: "Dark Souls", genre: "RPG", releaseYear: 2011, avgRating: 4.6 },
    { name: "Super Mario 64", genre: "Platformer", releaseYear: 1996, avgRating: 4.6 },
    { name: "Minecraft", genre: "Sandbox", releaseYear: 2011, avgRating: 4.5 },
  ];

  for (let i = 0; i < gamesToAdd; i++) {
    const gameTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate ratings/reviews for this game
    const numReviews = randomNumberBetween(3, 8);
    for (let j = 0; j < numReviews; j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(gameTimestamp.toDate())
      );

      const ratingData = {
        rating:
          randomData.gameReviews[
            randomNumberBetween(0, randomData.gameReviews.length - 1)
          ].rating,
        text: randomData.gameReviews[
          randomNumberBetween(0, randomData.gameReviews.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      ratingsData.push(ratingData);
    }

    // Calculate average rating based on actual reviews
    const calculatedAvgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    // Use predefined top game data
    const topGame = topGames[i];
    const gameData = {
      genre: topGame.genre,
      name: topGame.name,
      avgRating: topGame.avgRating,
      releaseYear: topGame.releaseYear,
      numRatings: ratingsData.length,
      sumRating: topGame.avgRating * ratingsData.length,
      photo: `https://storage.googleapis.com/firestorequickstarts.appspot.com/food_${randomNumberBetween(
        1,
        22
      )}.png`,
      timestamp: gameTimestamp,
    };

    data.push({
      gameData,
      ratingsData,
    });
  }
  return data;
}

