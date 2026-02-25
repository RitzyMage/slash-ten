import type { Media, BookMetadata } from "../types";

export type CreateMedia = Pick<Media, "externalId" | "name" | "mediaType"> & {
  metadata: Pick<BookMetadata, "author" | "series" | "seriesOrder">;
  externalLinks: string[];
};
