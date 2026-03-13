import type { BookMetadata, Media, UserPredictedScores } from "$lib/server/db/types";

type Recommendation = {
  Media: Media;
  BookMetadata: BookMetadata | null;
  UserPredictedScores: UserPredictedScores;
};

export default Recommendation;