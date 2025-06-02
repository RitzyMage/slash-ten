import {
  pgTable,
  serial,
  integer,
  text,
  index,
  unique,
  pgEnum,
  primaryKey,
  json,
  timestamp,
} from "drizzle-orm/pg-core";

export const mediaTypeEnum = pgEnum("MEDIA_TYPE", ["GAME", "MOVIE", "BOOK"]);

export const users = pgTable(
  "User",
  {
    id: serial("id").primaryKey(),
    externalId: text("externalId").notNull(),
    mediaType: mediaTypeEnum("mediaType").notNull(),
    name: text("name").notNull(),
  },
  (user) => [
    unique("user_external_mediaType").on(user.externalId, user.mediaType),
  ]
);

export const clients = pgTable("Client", {
  id: serial("id").primaryKey(),
  bookId: integer("bookId").references(() => users.id),
  name: text("name").notNull(),
});

export const ignored = pgTable(
  "Ignored",
  {
    clientId: integer("clientId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    mediaId: integer("mediaId")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),

    score: integer("score").notNull(),
  },
  (ignored) => [
    primaryKey({ columns: [ignored.clientId, ignored.mediaId] }),
    index("ignored_user_idx").on(ignored.clientId),
    index("ignored_media_idx").on(ignored.mediaId),
    index("ignored_user_media_idx").on(ignored.clientId, ignored.mediaId),
  ]
);

export const favorites = pgTable(
  "Favorites",
  {
    clientId: integer("clientId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    mediaId: integer("mediaId")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),

    score: integer("score").notNull(),
  },
  (ignored) => [
    primaryKey({ columns: [ignored.clientId, ignored.mediaId] }),
    index("favorites_user_idx").on(ignored.clientId),
    index("favorites_media_idx").on(ignored.mediaId),
    index("favorites_user_media_idx").on(ignored.clientId, ignored.mediaId),
  ]
);

export const media = pgTable(
  "Media",
  {
    id: serial("id").primaryKey(),
    externalId: text("externalId").notNull(),
    name: text("name").notNull(),
    mediaType: mediaTypeEnum("mediaType").notNull(),
  },
  (media) => [
    unique("media_external_mediaType").on(media.externalId, media.mediaType),
  ]
);

export const reviews = pgTable(
  "Review",
  {
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    mediaId: integer("mediaId")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),

    score: integer("score").notNull(),
  },
  (review) => [
    primaryKey(review.userId, review.mediaId),
    index("review_user_idx").on(review.userId),
    index("review_media_idx").on(review.mediaId),
    index("review_user_media_idx").on(review.userId, review.mediaId),
  ]
);

export const bookMetadata = pgTable(
  "BookMetadata",
  {
    mediaId: integer("mediaId")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),

    author: text("author").notNull(),
    series: text("series"),
    seriesOrder: integer("seriesOrder"),
  },
  (book) => [primaryKey(book.mediaId)]
);

export const externalLinks = pgTable("ExternalLink", {
  id: serial("id").primaryKey(),

  mediaId: integer("mediaId")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),

  link: text("link").notNull(),
});

export const updateHistory = pgTable("UpdateHistory", {
  id: serial("id").primaryKey(),
  updateData: json("updateData").notNull(),
  ran: timestamp("updated").notNull(),
});
