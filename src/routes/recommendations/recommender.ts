import Excluder from "./excluders/excluder";
import { groupBy, keyBy } from "$lib/util";
import Database from "$lib/server/db/database";
import type { Review } from "$lib/server/db/types";

const MIN_COMMON_REVIEWS = 10;
const MIN_MEDIA_REVIEWS = 10;

const USER_MEDIA_EXPONENT = 0.02;
const USER_REVIEW_EXPONENT = 3.5;

interface MediaWithScore {
  id: number;
  score: number;
  numberReviews: number;
}

interface UserWithSimilarity {
  id: number;
  similarity: number;
  commonReviews: number;
}

export default class Recommender {
  constructor() {
    this._database = new Database();
  }

  async getMediaNames(ids: number[]) {
    const media = await this._database.getMediaInfo(ids);
    return keyBy(media, "id");
  }

  async getRecommendations(
    user: number,
    maxUsers: number = 20,
    maxMedia: number = 40,
    excluder?: Excluder
  ): Promise<{ users: UserWithSimilarity[]; media: MediaWithScore[] }> {
    const reviews = await this._database.getValidReviews(
      user,
      MIN_COMMON_REVIEWS,
      MIN_MEDIA_REVIEWS
    );

    let reviewsByUser = groupBy(reviews, "userId");
    let thisUsersReviews = reviewsByUser[user];
    let otherUsersReviews = Object.fromEntries(
      Object.entries(reviewsByUser).filter(([id]) => parseInt(id) !== user)
    );

    let usersWithSimilarities: UserWithSimilarity[] = Object.entries(
      otherUsersReviews
    ).map(([id, reviews]) => {
      let { similarity, count } = this._getUserSimilarity(
        thisUsersReviews,
        reviews
      );
      return {
        id: parseInt(id),
        similarity,
        commonReviews: count,
      };
    });

    usersWithSimilarities.sort((a, b) => b.similarity - a.similarity);
    let userSimilarities = keyBy(usersWithSimilarities, "id");

    let thisUsersReviewsByMedia = keyBy(thisUsersReviews, "mediaId");
    let unseenReviews = reviews.filter(
      (review) =>
        !thisUsersReviewsByMedia[review.mediaId] &&
        !!userSimilarities[review.userId]
    );

    let unseenReviewsByMedia = groupBy(unseenReviews, "mediaId");

    let mediaWithScore: MediaWithScore[] = Object.entries(
      unseenReviewsByMedia
    ).map(([mediaId, reviews]) => ({
      score: this._getMediaScore(reviews, userSimilarities),
      id: parseInt(mediaId),
      numberReviews: reviews.length,
    }));

    mediaWithScore = mediaWithScore.filter(
      (item) => item.numberReviews >= MIN_MEDIA_REVIEWS
    );
    mediaWithScore.sort((a, b) => b.score - a.score);
    mediaWithScore = excluder
      ? excluder.getValid(mediaWithScore)
      : mediaWithScore;

    return {
      users: usersWithSimilarities.slice(0, maxUsers),
      media: mediaWithScore.slice(0, maxMedia),
    };
  }

  private adjustContrast(x: number, exponent: number) {
    if (x > 0.5) {
      return Math.pow(2, exponent - 1) * Math.pow(x - 0.5, exponent) + 0.5;
    }
    return (
      -Math.pow(2, exponent - 1) * Math.pow(Math.abs(x - 0.5), exponent) + 0.5
    );
  }

  private _getReviewSimilarity(difference: number, count: number) {
    const maxDistancePerEntry = 81; // (10  - 1) ^ 2
    const averageDistancePerEntry = difference / count;
    let percentageOfMaxDifference =
      averageDistancePerEntry / maxDistancePerEntry; // should be between 0 1nd 1, with 0 indicating similarity
    let similarity = 1 - percentageOfMaxDifference; // make higher more similar
    return Math.pow(similarity, USER_REVIEW_EXPONENT);
  }

  private _getMediaSimilarity(
    user1Reviews: Review[],
    user2Reviews: Review[]
  ): number {
    let user1TotalReviewScore = user1Reviews.reduce((total, review) => {
      return total + review.score;
    }, 0);

    let user2ReviewsById = keyBy(user2Reviews, "mediaId");

    let totalReviewPointsInCommon = user1Reviews.reduce((total, review) => {
      if (user2ReviewsById[review.mediaId]) {
        return total + review.score;
      }
      return total;
    }, 0); // basically, which media user 2 has consumed that user 1 consumed weighted by user 1's scores

    let mediaSimilarity = Math.pow(
      totalReviewPointsInCommon / user1TotalReviewScore,
      USER_MEDIA_EXPONENT
    );

    return mediaSimilarity;
  }

  private _getUserSimilarity(user1Reviews: Review[], user2Reviews: Review[]) {
    let { count, distance } = this._getUserDistance(user1Reviews, user2Reviews);
    let reviewSimilarity = this._getReviewSimilarity(distance, count);
    let mediaSimilarity = this._getMediaSimilarity(user1Reviews, user2Reviews);
    let similarity = reviewSimilarity * mediaSimilarity;
    return { similarity, count };
  }

  private _getMediaScore(
    reviews: Review[],
    userSimilarities: Record<string, UserWithSimilarity>
  ): number {
    let weightedSum = reviews.reduce((total, review) => {
      let score = review.score;
      let weightedScore =
        userSimilarities[review.userId].similarity * (score / 10);
      return total + weightedScore;
    }, 0);

    // was going to try userScoreWeighted * userSimilarity, but it turns out
    // userScoreWeighted = weightedSum / totalSimilarity
    // userSimilarity = totalSimilarity / reviews.length
    // so the below is the simplified version of that equation
    let baseScore = weightedSum / reviews.length;
    return Math.pow(this.adjustContrast(baseScore, 0.15), 0.3);
  }

  private _getUserDistance(
    user1Reviews: Review[],
    user2Reviews: Review[]
  ): { distance: number; count: number } {
    let user2ReviewsById = user2Reviews.reduce((obj, review) => {
      obj[String(review.mediaId)] = review;
      return obj;
    }, {} as Record<string, Review>);

    let result = user1Reviews.reduce(
      (stats, review) => {
        let user1Score = review.score;
        let user2Score = user2ReviewsById[String(review.mediaId)]?.score;
        if (!user2Score) {
          return stats;
        }
        let difference = Math.abs(user1Score - user2Score);
        let differenceSquared = difference * difference;
        return {
          distance: stats.distance + differenceSquared,
          count: stats.count + 1,
        };
      },
      { distance: 0, count: 0 }
    );

    return result;
  }

  private _database: Database;
}
