import { sql } from 'drizzle-orm';
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
	boolean,
	doublePrecision,
	check,
} from 'drizzle-orm/pg-core';

export const mediaTypeEnum = pgEnum('MEDIA_TYPE', ['GAME', 'MOVIE', 'BOOK']);

export const users = pgTable(
	'User',
	{
		id: serial('id').primaryKey(),
		externalId: text('externalId').notNull(),
		mediaType: mediaTypeEnum('mediaType').notNull(),
		name: text('name').notNull(),
		nextUpdateOn: timestamp('nextUpdateOn'),
	},
	(user) => [unique('user_external_mediaType').on(user.externalId, user.mediaType)],
);

export const clients = pgTable('Client', {
	id: serial('id').primaryKey(),
	userId: integer('userId')
		.references(() => users.id)
		.notNull(),
	name: text('name').notNull(),
});

export const ignored = pgTable(
	'Ignored',
	{
		clientId: integer('clientId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		mediaId: integer('mediaId')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),

		score: integer('score').notNull(),
	},
	(ignored) => [
		primaryKey({ columns: [ignored.clientId, ignored.mediaId] }),
		index('ignored_user_idx').on(ignored.clientId),
		index('ignored_media_idx').on(ignored.mediaId),
		index('ignored_user_media_idx').on(ignored.clientId, ignored.mediaId),
	],
);

export const favorites = pgTable(
	'Favorites',
	{
		clientId: integer('clientId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		mediaId: integer('mediaId')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),

		score: integer('score').notNull(),
	},
	(ignored) => [
		primaryKey({ columns: [ignored.clientId, ignored.mediaId] }),
		index('favorites_user_idx').on(ignored.clientId),
		index('favorites_media_idx').on(ignored.mediaId),
		index('favorites_user_media_idx').on(ignored.clientId, ignored.mediaId),
	],
);

export const media = pgTable(
	'Media',
	{
		id: serial('id').primaryKey(),
		externalId: text('externalId').notNull(),
		name: text('name').notNull(),
		mediaType: mediaTypeEnum('mediaType').notNull(),
		nextUpdateOn: timestamp('nextUpdateOn'),
		needsSimilarityUpdate: boolean('needsSimilarityUpdate').default(true),
	},
	(media) => [unique('media_external_mediaType').on(media.externalId, media.mediaType)],
);

export const reviews = pgTable(
	'Review',
	{
		userId: integer('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		mediaId: integer('mediaId')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),

		score: integer('score').notNull(),
	},
	(review) => [
		primaryKey(review.userId, review.mediaId),
		index('review_user_idx').on(review.userId),
		index('review_media_idx').on(review.mediaId),
		index('review_user_media_idx').on(review.userId, review.mediaId),
	],
);

export const bookMetadata = pgTable('BookMetadata', {
	mediaId: integer('mediaId')
		.notNull()
		.references(() => media.id, { onDelete: 'cascade' })
		.primaryKey(),
	author: text('author').notNull(),
	series: text('series'),
	seriesOrder: integer('seriesOrder'),
});

export const externalLinks = pgTable('ExternalLink', {
	id: serial('id').primaryKey(),

	mediaId: integer('mediaId')
		.notNull()
		.references(() => media.id, { onDelete: 'cascade' }),

	link: text('link').notNull(),
});

export const updateHistory = pgTable('UpdateHistory', {
	id: serial('id').primaryKey(),
	updateData: json('updateData').notNull(),
	ran: timestamp('updated').notNull(),
});

export const userClientSimilarity = pgTable(
	'UserClientSimilarity',
	{
		userId: integer('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		clientId: integer('clientId')
			.notNull()
			.references(() => clients.id, { onDelete: 'cascade' }),

		similarity: doublePrecision('similarity').notNull(),
	},
	(similarity) => [
		primaryKey(similarity.userId, similarity.clientId),
		index('user_similarity_user_idx').on(similarity.userId),
		index('user_similarity_media_idx').on(similarity.clientId),
		index('user_similarity_user_media_idx').on(similarity.userId, similarity.clientId),
	],
);

export const userPredictedScores = pgTable(
	'UserPredictedScores',
	{
		clientId: integer('clientId')
			.notNull()
			.references(() => clients.id, { onDelete: 'cascade' }),

		mediaId: integer('mediaId')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),

		score: doublePrecision('score').notNull(),
	},
	(similarity) => [
		primaryKey(similarity.clientId, similarity.mediaId),
		index('user_predicted_Score_user_idx').on(similarity.clientId),
		index('user_predicted_Score_media_idx').on(similarity.mediaId),
		index('user_predicted_Score_user_media_idx').on(similarity.clientId, similarity.mediaId),
	],
);

export const mediaSimilarity = pgTable(
	'MediaSimilarity',
	{
		media1Id: integer('media1Id')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),

		media2Id: integer('media2Id')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),

		correlation: doublePrecision('correlation').notNull(),
		reviewsInCommon: integer('reviewsInCommon').notNull(),
	},
	(similarity) => [
		primaryKey(similarity.media1Id, similarity.media2Id),
		check('mediaSimilarityUnique', sql`${similarity.media1Id} < ${similarity.media2Id}`),
		index('media_similarity_user_idx').on(similarity.media1Id),
		index('media_similarity_media_idx').on(similarity.media2Id),
		index('media_similarity_user_media_idx').on(similarity.media1Id, similarity.media2Id),
	],
);
