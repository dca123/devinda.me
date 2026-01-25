import { getProjects, getAlbums, getPhotos } from "../src/lib/notion.js";
import { extractContent } from "../src/lib/notionExtracter.js";
import { notion } from "../src/lib/notion.js";
import fs from "fs/promises";
import path from "path";

const PROJECT_DB_ID = "4f1fd603748b44d58615d782979d7a1e";
const ALBUM_DB_ID = "076c02479a7e4a4a80c54569831d85e5";

async function sync() {
  console.log("Syncing projects...");
  const projectsData = await getProjects(PROJECT_DB_ID, { onlyPublished: true });
  
  const projectsWithContent = await Promise.all(
    projectsData.map(async (project) => {
      const blocks = await notion.blocks.children.list({
        block_id: project.page_id,
      });
      const content = await extractContent(blocks, project.page_id);
      return {
        params: { slug: project.slug },
        props: {
          ...project,
          blocks: content,
        },
      };
    })
  );

  await fs.writeFile(
    path.join(process.cwd(), "projects.json"),
    JSON.stringify(projectsWithContent, null, 2)
  );
  console.log(`Synced ${projectsWithContent.length} projects.`);

  console.log("Syncing albums...");
  const albumsData = await getAlbums(ALBUM_DB_ID);
  
  const albumsWithPhotos = await Promise.all(
    albumsData.map(async (album) => {
      const photos = await getPhotos(album.id);
      return {
        params: { slug: album.slug },
        props: {
          ...album,
          title: album.name, // Harmonize field name
          photos,
        },
      };
    })
  );

  await fs.writeFile(
    path.join(process.cwd(), "albums.json"),
    JSON.stringify(albumsWithPhotos, null, 2)
  );
  console.log(`Synced ${albumsWithPhotos.length} albums.`);
}

sync().catch(console.error);
