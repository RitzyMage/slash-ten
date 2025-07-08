import axios from "axios";
import type ReviewFetcher from "./review-fetcher";
import { HTMLElement, parse } from "node-html-parser";
import type { CreateMedia, CreateReview } from "../db/database";
import type { BookMetadata } from "../db/types";

type User = {
  id: string;
  name: string;
};

const seriesRegex = / \(.+ #\d+(,\s*Part\s*\d+\s*of\s*\d+)?\)/g;

export default class GoodreadsReviewFetcher implements ReviewFetcher {
  readonly mediaType = "BOOK";
  readonly serviceName: string = "Goodreads";

  async getNumPages(userId: string): Promise<number> {
    let page = await this.getUserReviewHTML(userId, 1);
    if (!page) {
      throw new Error(`failure to get page count for user ${userId}`);
    }
    return this.parsePageCount(page, userId);
  }

  async artificialDelay() {
    await new Promise((res) => setTimeout(res, 10));
  }

  async getMediaReviewers(mediaId: string): Promise<unknown[]> {
    let users: User[] = [];
    let document = await this.getBookHTML(mediaId);
    if (!document) {
      throw new Error(`could not get reviewers for ${mediaId}`);
    } else {
      let newUsers = this.parseUsers(document);
      users = users.concat(newUsers);
    }
    return users;
  }

  async getUserReviews(userId: string, page: number) {
    let pageHTML = await this.getUserReviewHTML(userId, page);
    if (!pageHTML) {
      throw new Error(`failed to get page ${page} for user ${userId}`);
    }
    return { ...this.parseReviews(pageHTML, userId) };
  }

  private async getUserReviewHTML(id: string, page: number) {
    let response = await this.callAPI(
      `https://www.goodreads.com/review/list/${id}?page=${page}&shelf=read`
    );
    if (!response) {
      return null;
    }
    return parse(response.data);
  }

  private async getBookHTML(url: string) {
    let response = await this.callAPI(`https://www.goodreads.com${url}`);
    if (!response) {
      return null;
    }
    return parse(response.data);
  }

  private starsToOutOf10(stars: number): number | null {
    switch (stars) {
      case 0:
        return null;
      case 1:
        return 2;
      case 2:
        return 4;
      case 3:
        return 6;
      case 4:
        return 8;
      case 5:
        return 10;
      default:
        throw new Error(`unexpected star value ${stars}`);
    }
  }

  private parsePageCount(document: HTMLElement, id: string): number {
    let pages = [...document.querySelectorAll("#reviewPagination a")]
      .map((a) => parseInt(a.text))
      .filter((num) => !!num);
    let lastPage = pages.pop();
    if (!lastPage) {
      throw new Error(`could not parse page for ${id}`);
    }
    return lastPage;
  }

  private async callAPI(
    url: string,
    { loggedIn = false }: { loggedIn?: boolean } = {}
  ) {
    try {
      return await axios.get(url, {
        headers: {
          Cookie: loggedIn ? "cookie" : "",
        },
      });
    } catch (e) {
      console.log(`failure on ${url}`);
      return null;
    }
  }

  private parseUsers(document: HTMLElement): User[] {
    let reviewCards = [
      ...document.querySelectorAll(".ReviewCard .ReviewerProfile__name a"),
    ];
    return reviewCards.map((card) => ({
      id: card.getAttribute("href")!.replace(/\D+/g, ""),
      name: card.textContent,
    }));
  }

  private parseReviews(
    document: HTMLElement,
    userId: string
  ): { reviews: CreateReview[]; media: CreateMedia[] } {
    let elements = [...document.querySelectorAll("tr.review")];
    let userReviews = elements.map((element) => ({
      title: element
        .querySelector(".title a")!
        .text.trim()
        .replace(/\s+/g, " "),
      url: element.querySelector(".title a")!.getAttribute("href")!,
      author: element
        .querySelector(".author a")!
        .text.trim()
        .replace(/\s+/g, " "),
      stars: element.querySelectorAll(".staticStar.p10").length,
    }));
    let reviews: CreateReview[] = userReviews.reduce(
      (all, { stars, url, title, author }) => {
        let score = this.starsToOutOf10(stars);
        if (score !== null) {
          all.push({
            score,
            mediaExternalId: this.getId({ author, title }),
          });
        }
        return all;
      },
      [] as CreateReview[]
    );
    let media: CreateMedia[] = userReviews.map(({ title, author, url }) => {
      let { name, seriesName, seriesNumber } = this.parseName(title);
      let metadata: Pick<BookMetadata, "author" | "series" | "seriesOrder"> = {
        author,
        seriesOrder: null,
        series: null,
      };
      if (seriesNumber) {
        metadata = {
          author,
          series: seriesName,
          seriesOrder: seriesNumber,
        };
      }
      return {
        name,
        mediaType: "BOOK",
        externalId: this.getId({ author, title }),
        metadata,
        externalLinks: [url],
      };
    });
    return { reviews, media };
  }

  private getId({ author, title }: { author: string; title: string }) {
    return `${author} ${title}`
      .toLowerCase()
      .replace(/\W+/g, "-")
      .replace(/-$/, "");
  }

  private parseName(name: string) {
    let seriesInfo = name.match(seriesRegex)?.pop();
    let seriesNumber: number | null = null;
    let seriesName = "";
    if (seriesInfo) {
      name = name.replace(seriesInfo, "");
      seriesNumber = parseInt(seriesInfo.replace(/.*#(\d+).*/g, "$1"));
      seriesName = seriesInfo.replace(/\s*\(([^,#]*).*/g, "$1");
    }
    return { name, seriesName, seriesNumber };
  }
}
