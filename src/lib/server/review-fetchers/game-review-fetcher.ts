import axios, { AxiosError } from "axios";
import { ID, User, Media, Review } from "./types";
import ReviewFetcher from "./review-fetcher";

type WhoCares = any;

interface APIReview {
  id: string;
  quote: string;
  score: number;
  thumbsUp: WhoCares;
  thumbsDown: WhoCares;
  date: string; // ISO Date
  author: string;
  version: number;
  spoiler: boolean;
  platform: string;
  reviewedProduct: {
    id: number;
    type: string;
    title: string;
    url: string;
    platform: WhoCares;
    gameTaxonomy?: WhoCares;
    image?: unknown;
  };
}

interface GameAPIResponse {
  data: {
    id: string;
    totalResults: number;
    items: APIReview[];
  };
  links: WhoCares;
  meta: WhoCares;
}

interface UserAPIResponse {
  data: { id: unknown | null; totalResults: number; items: APIReview[] };
  links: WhoCares;
  meta: WhoCares;
}

export class GameReviewFetcher extends ReviewFetcher {
  async getUser(user: ID): Promise<User | null> {
    return { name: String(user), id: user };
  }

  async getUserReviews(
    user: ID
  ): Promise<{ reviews: Review[]; media: Media[] }> {
    let { reviews, media } = await this.getUserReviewsFromAPI(String(user));
    return { reviews, media, nextPage: null, numPages: 1 };
  }

  async getOtherReviewers(media: ID[]): Promise<User[]> {
    let usersByID: Record<string, User> = {};
    for (let item of media) {
      let reviews = await this.getGameReviewsFromAPI(String(item));
      let users: User[] = reviews.map((review) => ({
        id: review.author,
        name: review.author,
      }));
      for (let user of users) {
        usersByID[user.id] = user;
      }
    }
    return Object.values(usersByID);
  }

  async debug() {
    // let result = await this.getUserReviews("RitzyMage");
    let result = await this.getOtherReviewers(["super-mario-galaxy-2"]);
    console.log(result);
  }

  private async callAPI<T>(url: string, offset: number, limit: number) {
    let { data } = await axios.get<T>(
      `https://internal-prod.apigee.fandom.net/v1/xapi/reviews/metacritic/${url}${
        url.includes("?") ? "&" : "?"
      }offset=${offset}&limit=${limit}`
    );
    return data;
  }

  private tonumber(number: number): number {
    if (number === 0) {
      return 1;
    }
    if (number > 10 || number < 0) {
      throw new Error(`score ${number} is not a valid score`);
    }
    return Math.round(number) as number;
  }

  private fixID(id: ID): ID {
    let overrides: Record<ID, ID> = {
      ["mario-rabbids-sparks-of-hope"]: "mario-plus-rabbids-sparks-of-hope",
      ["super-mario-3d-world-bowsers-fury"]:
        "super-mario-3d-world-plus-bowsers-fury",
      ["mario-rabbids-kingdom-battle"]: "mario-plus-rabbids-kingdom-battle",
      ["super-smash-bros-for-wii-u"]: "super-smash-bros-for-nintendo-3ds-wii-u",
    };
    return overrides[id] ?? id;
  }

  private getIDFromURL(url: string, data: any) {
    return this.fixID(url.replace(/\/game\/([^/]+)\//g, "$1"));
  }

  private async getUserReviewsFromAPI(user: string) {
    const offset = 0;
    const limit = 1000;
    try {
      let { data } = await this.callAPI<UserAPIResponse>(
        `user/private/${user}/web?filterByType=games`,
        offset,
        limit
      );
      let media = data.items.map((review) => ({
        id: this.getIDFromURL(
          review.reviewedProduct.url,
          review.reviewedProduct
        ),
        title: review.reviewedProduct.title,
      }));
      let reviews = data.items.map((review) => ({
        user,
        media: this.getIDFromURL(
          review.reviewedProduct.url,
          review.reviewedProduct
        ),
        score: this.tonumber(review.score),
      }));
      return { media, reviews };
    } catch (e) {
      let err = e as AxiosError;
      console.error("could not get user data for", user);
      console.error("details:", err.response?.data);
      return { media: [], reviews: [] };
    }
  }

  private async getGameReviewsFromAPI(game: string) {
    const offset = 0;
    const limit = 1000;
    console.log("getting reviews for", game);
    try {
      let { data } = await this.callAPI<GameAPIResponse>(
        `user/games/${game}/web`,
        offset,
        limit
      );
      return data.items.map((review) => ({
        score: review.score,
        author: review.author,
      }));
    } catch (e) {
      let err = e as AxiosError;
      console.error("could not get game data for", game);
      console.error("details:", err.response?.data);
      return [];
    }
  }
}
