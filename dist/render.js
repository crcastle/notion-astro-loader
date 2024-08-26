import { toc as rehypeToc } from "@jsdevtools/rehype-toc";
import { iteratePaginatedAPI, isFullBlock, } from "@notionhq/client";
// #region Processor
import notionRehype from "notion-rehype-k";
import rehypeKatex from "rehype-katex";
import rehypeShiftHeading from "rehype-shift-heading";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
const processor = unified()
    .use(notionRehype, {}) // Parse Notion blocks to rehype AST
    .use(rehypeShiftHeading, { shift: 1 })
    .use(rehypeSlug)
    .use(
// @ts-ignore
rehypeKatex) // Then you can use any rehype plugins to enrich the AST
    .use(rehypeStringify); // Turn AST to HTML string
// #endregion
async function awaitAll(iterable) {
    const result = [];
    for await (const item of iterable) {
        result.push(item);
    }
    return result;
}
/**
 * Return a generator that yields all blocks in a Notion page, recursively.
 * @param blockId ID of block to get chidren for.
 * @param imagePaths MUTATED. This function will push image paths to this array.
 */
async function* listBlocks(client, blockId, imagePaths) {
    for await (const block of iteratePaginatedAPI(client.blocks.children.list, {
        block_id: blockId,
    })) {
        if (!isFullBlock(block)) {
            continue;
        }
        if (block.type === "image") {
            let url;
            switch (block.image.type) {
                case "external":
                    url = block.image.external.url;
                    break;
                case "file":
                    url = block.image.file.url;
                    break;
            }
            imagePaths.push(url);
        }
        if (block.has_children) {
            const children = await awaitAll(listBlocks(client, block.id, imagePaths));
            // @ts-ignore -- TODO: Make TypeScript happy here
            block[block.type].children = children;
        }
        yield block;
    }
}
function extractTocHeadings(toc) {
    if (toc.tagName !== "nav") {
        throw new Error(`Expected nav, got ${toc.tagName}`);
    }
    function listElementToTree(ol, depth) {
        return ol.children.flatMap((li) => {
            const [_link, subList] = li.children;
            const link = _link;
            const currentHeading = {
                depth,
                text: link.children[0].value,
                slug: link.properties.href.slice(1),
            };
            let headings = [currentHeading];
            if (subList) {
                headings = headings.concat(listElementToTree(subList, depth + 1));
            }
            return headings;
        });
    }
    return listElementToTree(toc.children[0], 0);
}
export async function renderNotionEntry(client, pageId) {
    const imagePaths = [];
    const blocks = await awaitAll(listBlocks(client, pageId, imagePaths));
    let headings = [];
    const vFile = await processor()
        .use(rehypeToc, {
        customizeTOC(toc) {
            headings = extractTocHeadings(toc);
            return false;
        },
    })
        .process({ data: blocks });
    return {
        html: vFile.toString(),
        metadata: {
            headings,
            imagePaths,
        },
    };
}
