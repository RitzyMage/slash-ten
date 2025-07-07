import type { CreateMedia } from "../db/database";
import type { ID, Media, User, Review } from "./types";

interface UserReviewsResult {
  reviews: Review[];
  media: CreateMedia[];
}

export default interface ReviewFetcher {
  getUserReviews(userId: ID, page: number): Promise<UserReviewsResult>;

  // getUser(user: ID): Promise<User | null>;

  // getOtherReviewers(url: string): Promise<User[]>;

  getNumPages(userId: string): Promise<number>;

  readonly serviceName: string;
}
