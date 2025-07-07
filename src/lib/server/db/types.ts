import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  media,
  reviews,
  bookMetadata,
  externalLinks,
  mediaTypeEnum,
} from "./schema";

export type User = InferSelectModel<typeof users>;
export type CreateUser = InferInsertModel<typeof users>;
export type Media = InferSelectModel<typeof media>;
export type Review = InferSelectModel<typeof reviews>;
export type BookMetadata = InferSelectModel<typeof bookMetadata>;
export type ExternalLink = InferSelectModel<typeof externalLinks>;
export type MediaType = (typeof mediaTypeEnum.enumValues)[number];
