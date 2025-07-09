// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';
import { rssSchema } from '@astrojs/rss';

import { glob, file } from 'astro/loaders';
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/posts" }),
  schema: rssSchema,
});

// // 2. Import loader(s)
// import { glob, file } from 'astro/loaders';

// // 3. Define your collection(s)
// const posts = defineCollection({ 
//     loader: glob({ pattern: "**/*.md", base: "./src/posts" }),
//     schema: z.object({
//         id: z.number(),
//         title: z.string(),
//         description: z.string(),
//         date: z.string()
//     })
// });

// 4. Export a single `collections` object to register your collection(s)
export const collections = { posts };