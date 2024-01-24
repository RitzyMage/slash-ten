<script lang="ts">
  import type { Recommendation } from "$lib/data-types/recommendation";

  let seriesRegex = / \(.+ #\d+(,\s*Part\s*\d+\s*of\s*\d+)?\)/g;

  export let recommendation: Recommendation;

  const parseName = (name: string) => {
    let [book, author] = name.split(" by ");
    let seriesInfo = book.match(seriesRegex)?.pop();
    let seriesNumber = "";
    let seriesName = "";
    if (seriesInfo) {
      book = book.replace(seriesInfo, "");
      seriesNumber = seriesInfo.replace(/.*#(\d+).*/g, "$1");
      seriesName = seriesInfo.replace(/\s*\(([^,#]*).*/g, "$1");
    }
    return { book, author, seriesInfo, seriesName, seriesNumber };
  };
  let { book, author, seriesInfo, seriesName, seriesNumber } = parseName(
    recommendation.name
  );
</script>

<div class="recommendation">
  <div class="recommendation-id">{recommendation.id}</div>
  <div class="recommendation-title">{book}</div>
  <div class="recommendation-author">{author}</div>
  {#if seriesInfo}
    <div class="recommendation-series">
      {seriesName}
      <span class="recommendation-seriesNumber">{seriesNumber}</span>
    </div>
  {/if}
  <div class="recommendation-score">
    {(recommendation.score * 100).toFixed(2)}%
  </div>
  <div class="recommendation-numReviews">
    {recommendation.numberReviews} reviews
  </div>
</div>

<style>
  .recommendation {
    padding: 8px;
    border: 1px solid #555;

    font-size: 16px;
    border-radius: 4px;

    flex: 0 0 calc(20% - 16px - (16px / 5));
  }

  .recommendation-id {
    color: #ddd;
  }

  .recommendation-title {
    color: #9bf;
    font-size: 24px;
  }

  .recommendation-score {
    color: #ddd;
  }

  .recommendation-numReviews {
    color: #ddd;
  }

  .recommendation-series {
    color: #ddd;
  }

  .recommendation-seriesNumber {
    color: #aaa;
  }
</style>
