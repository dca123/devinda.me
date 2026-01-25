import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

const projects = defineCollection({
  loader: file("projects.json", {
    parser: (text) => {
      const items = JSON.parse(text);
      return items.map((item: any) => ({
        id: item.params.slug,
        ...item,
      }));
    },
  }),
  schema: z.object({
    params: z.object({
      slug: z.string(),
    }),
    props: z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string(),
      date: z.string(),
      cover: z.string(),
      skills: z.array(z.string()),
      published: z.boolean(),
      blocks: z.array(z.any()),
    }),
  }),
});

const albums = defineCollection({
  loader: file("albums.json", {
    parser: (text) => {
      const items = JSON.parse(text);
      return items.map((item: any) => ({
        id: item.params.slug,
        ...item,
      }));
    },
  }),
  schema: z.object({
    params: z.object({
      slug: z.string(),
    }),
    props: z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
      title: z.string(),
      src: z.string().optional(),
      alt: z.string().optional(),
      description: z.string(),
      date: z.string(),
      photos: z.array(
        z.object({
          id: z.string(),
          src: z.string(),
          alt: z.string(),
          name: z.string(),
          aspectRatio: z.string(),
        })
      ),
    }),
  }),
});

export const collections = { projects, albums };
