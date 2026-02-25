import { keyBy } from "$lib/util";
import { db } from "..";

import { reviews } from "../schema";
import type { Media } from "../types";
import type { CreateReview } from "./create-review";

  export default async function AddReviews(userId: number, toCreate: CreateReview[], media: Media[]) {
    let mediaByExternalId = keyBy(media, "externalId");
    for (let review of toCreate) {
      let mediaId = mediaByExternalId[review.mediaExternalId].id;
      await db
        .insert(reviews)
        .values({
          mediaId,
          score: review.score,
          userId,
        })
        .onConflictDoUpdate({
          target: [reviews.mediaId, reviews.userId],
          set: { score: review.score },
        });
    }
  }