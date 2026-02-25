import type { Review } from "../types";


export type CreateReview = Pick<Review, "score"> & {
  mediaExternalId: string;
};
