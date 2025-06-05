import axios from "axios";
import type ReviewFetcher from "./review-fetcher";
import type { BookMetadata, MediaTemp } from "./review-fetcher";
import type { ID, User, Review, Media } from "./types";
import { HTMLElement, parse } from "node-html-parser";

const seriesRegex = / \(.+ #\d+(,\s*Part\s*\d+\s*of\s*\d+)?\)/g;

export default class GoodreadsReviewFetcher implements ReviewFetcher {
  async getUser(user: ID): Promise<User | null> {
    let firstPage = await this.getUserReviewHTML(user, 1, true);
    if (!firstPage) {
      console.error(`could not get page for ${user}`);
      return null;
    }
    let username = this.parseUsername(firstPage, user);
    return {
      id: user,
      name: username,
    };
  }

  async artificialDelay() {
    await new Promise((res) => setTimeout(res, 10));
  }

  async getUserReviews(
    userId: ID,
    page: number,
    { loggedIn }: { loggedIn: boolean }
  ): Promise<{
    reviews: Review[];
    media: MediaTemp[];
    nextPage: number | null;
    numPages: number;
  }> {
    try {
      let results = await this.fetchUserPage(page, userId, loggedIn);
      let nextPage =
        !results.numPages || results.numPages <= page ? null : page + 1;
      return { ...results, nextPage };
    } catch (e) {
      console.error("error parsing page");
      console.error(e);
      return { reviews: [], media: [], nextPage: null, numPages: 0 };
    }
  }

  async getOtherReviewers(url: string): Promise<User[]> {
    let users: User[] = [];
    let document = await this.getBookHTML(url);
    if (!document) {
      console.error(`could not get reviewers for ${url}`);
    } else {
      let newUsers = this.parseUsers(document);
      users = users.concat(newUsers);
    }
    return users;
  }

  private async fetchUserPage(i: number, userId: ID, loggedIn: boolean) {
    console.log(`\tgetting page ${i} for ${userId}`);
    let page = await this.getUserReviewHTML(userId, i, loggedIn);
    if (!page) {
      console.error(`failure to get page ${i} for user ${userId}`);
      return { reviews: [], media: [], numPages: 0 };
    }
    let numPages = this.parsePageCount(page, userId);
    console.log(`\tgot page ${i} of ${numPages} for ${userId}`);
    try {
      return { ...this.parseReviews(page, userId), numPages };
    } catch (e) {
      return { reviews: [], media: [], numPages };
    }
  }

  private async getUserReviewHTML(id: ID, page: number, loggedIn: boolean) {
    let response = await this.callAPI(
      `https://www.goodreads.com/review/list/${id}?page=${page}&shelf=read`,
      loggedIn
    );
    if (!response) {
      return null;
    }
    return parse(response.data);
  }

  private async getBookHTML(url: string) {
    let response = await this.callAPI(`https://www.goodreads.com${url}`, false);
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
        return 1;
      case 2:
        return 3;
      case 3:
        return 5;
      case 4:
        return 7;
      case 5:
        return 10;
      default:
        throw new Error(`unexpected star value ${stars}`);
    }
  }

  private parsePageCount(document: HTMLElement, id: ID): number {
    let pages = [...document.querySelectorAll("#reviewPagination a")]
      .map((a) => parseInt(a.text))
      .filter((num) => !!num);
    let lastPage = pages.pop();
    if (!lastPage) {
      throw new Error(`could not parse page for ${id}`);
    }
    return lastPage;
  }

  private async callAPI(url: string, loggedIn: boolean) {
    try {
      return await axios.get(
        url,
        loggedIn
          ? {
              headers: {
                Cookie: "",
              },
            }
          : undefined
      );
    } catch (e) {
      console.log(`failure on ${url}`);
      return null;
    }
  }

  private parseUsername(document: HTMLElement, id: ID): string {
    let name = document.querySelector("#header > h1:first-child > a")?.text;
    if (!name) {
      throw new Error(`could not parse username for ${id}!`);
    }
    return name;
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
    userId: ID
  ): { reviews: Review[]; media: MediaTemp[] } {
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
    let reviews: Review[] = userReviews.reduce(
      (all, { stars, url, title, author }) => {
        let score = this.starsToOutOf10(stars);
        if (score !== null) {
          all.push({
            score,
            user: userId,
            media: this.getId({ author, title }),
          });
        }
        return all;
      },
      [] as Review[]
    );
    let media: MediaTemp[] = userReviews.map(({ title, author, url }) => {
      let { name, seriesName, seriesNumber } = this.parseName(title);
      let metadata: BookMetadata = { author };
      if (seriesNumber) {
        metadata = {
          author,
          series: { name: seriesName, order: seriesNumber },
        };
      }
      return {
        title: name,
        id: this.getId({ author, title }),
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
