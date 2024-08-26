import type { Loader } from "astro/loaders";
import type { ClientOptions, QueryDatabaseParameters } from "./types.js";
export interface NotionLoaderOptions extends Pick<ClientOptions, "auth" | "timeoutMs" | "baseUrl" | "notionVersion" | "fetch" | "agent">, Pick<QueryDatabaseParameters, "database_id" | "filter_properties" | "sorts" | "filter" | "archived"> {
}
/**
 * Notion loader for the Astro Content Layer API.
 *
 * It allows you to load pages from a Notion database then render them as pages in a collection.
 *
 * @param options Takes in same options as `notionClient.databases.query` and `Client` constructor.
 *
 * @example
 * // src/content/config.ts
 * import { defineCollection } from "astro:content";
 * import { notionLoader } from "notion-astro-loader";
 *
 * const database = defineCollection({
 *   loader: notionLoader({
 *     auth: import.meta.env.NOTION_TOKEN,
 *     database_id: import.meta.env.NOTION_DATABASE_ID,
 *     filter: {
 *       property: "Hidden",
 *       checkbox: { equals: false },
 *     }
 *   }),
 * });
 */
export declare function notionLoader({ database_id, filter_properties, sorts, filter, archived, ...clientOptions }: NotionLoaderOptions): Loader;
//# sourceMappingURL=loader.d.ts.map