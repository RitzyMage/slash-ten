import type { CreateMedia } from "../db/media/create-media";
import type { CreateReview } from "../db/reviews/create-review";
import type { MediaType } from "../db/types";

export interface UserReviewsResult {
  reviews: CreateReview[];
  media: CreateMedia[];
}

export default interface ReviewFetcher {
  getUserReviews(userId: string, page: number): Promise<UserReviewsResult>;

  // getUser(user: ID): Promise<User | null>;

  getMediaReviewers(mediaId: string): Promise<{ id: string; name: string }[]>;

  getNumPages(userId: string): Promise<number>;

  readonly serviceName: string;
  readonly mediaType: MediaType;
}
