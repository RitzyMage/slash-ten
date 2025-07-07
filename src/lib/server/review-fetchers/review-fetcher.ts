import type { ID, Media, User, Review } from "./types";

export interface BookMetadata {
  author: string;
  series?: { name: string; order: number };
}

export interface MediaTemp extends Media {
  metadata: BookMetadata;
  externalLinks: string[];
}

interface UserReviewsResult {
  reviews: Review[];
  media: MediaTemp[];
  nextPage: number | null;
  numPages: number;
}

export default interface ReviewFetcher {
  getUserReviews(userId: ID, page: number): Promise<UserReviewsResult>;

  // getUser(user: ID): Promise<User | null>;

  // getOtherReviewers(url: string): Promise<User[]>;

  getNumPages(userId: string): Promise<number>;

  readonly serviceName: string;
}
