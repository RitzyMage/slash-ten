import BookExcluder from "../excluders/book-excluder";
import Recommender from "../recommender";

const userId = 1; // TODO parameterize this

export interface Recommendation {
  id: number;
  name: string;
  score: number;
  numberReviews: number;
}

export async function GET(request: Request) {
  let recommender = new Recommender();
  let { searchParams } = new URL(request.url);
  let limitParam = searchParams.get("limit");
  let limit = limitParam ? parseInt(limitParam) : 10;
  let recommendations = await recommender.getRecommendations(
    userId,
    limit,
    limit,
    new BookExcluder()
  );

  let mediaInfo = await recommender.getMediaNames(
    recommendations.media.map((_) => _.id)
  );

  let recommendationsWithInfo: Recommendation[] = recommendations.media.map(
    (_) => ({
      ..._,
      name: mediaInfo[_.id].name,
    })
  );

  return Response.json(recommendationsWithInfo);
}
