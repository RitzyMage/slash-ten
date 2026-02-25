import type { Media, UserPredictedScore } from "$lib/server/db/types"

type ScoreWithMedia = {
    Media: Media;
    UserPredictedScores: UserPredictedScore;
}

export default ScoreWithMedia;