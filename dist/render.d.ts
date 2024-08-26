import { type Client } from "@notionhq/client";
import type { MarkdownHeading } from "astro";
export interface RenderedNotionEntry {
    html: string;
    metadata: {
        imagePaths: string[];
        headings: MarkdownHeading[];
    };
}
export declare function renderNotionEntry(client: Client, pageId: string): Promise<RenderedNotionEntry>;
//# sourceMappingURL=render.d.ts.map