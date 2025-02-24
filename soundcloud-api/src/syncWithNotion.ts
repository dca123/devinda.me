import { date, NotionDB, select, title, text } from "notionDb";
import { Client } from "@notionhq/client";
import { SoundCloud } from ".";

if (!process.env.NOTION_API_KEY) {
  throw new Error("Setup api key, NOTION_API_KEY is undefined");
}

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY as string,
});
const sc = new SoundCloud({
  client_id: "akcDl6lB9RfwyhLSb2Xw2MwPR3Ow85Kr",
  ouath: "OAuth 2-299607-38647190-hip1ZeiLhpxHh8m",
});

//https://www.notion.so/devinda/a3551a2a0ce5449db2a21eca49c8d011?v=e7349c028f2e444dba187b18a4604dfb&pvs=4
async function main() {
  const db = new NotionDB({
    client: notionClient,
    databaseId: "a3551a2a0ce5449db2a21eca49c8d011",
    schema: {
      name: title(),
      date_created: date(),
      music_provider: select(["SoundCloud"]),
      id: text(),
    },
  });
  const existingPlaylists = await db.findAll();
  const playlists = await sc.getPlaylists();
  for (let i = 0; i < playlists.length; i++) {
    const playlist = playlists[i];
    const exists = existingPlaylists.some((ep) => ep.id === playlist.id);
    if (exists) continue;
    await db.insert({
      id: playlist.id,
      date_created: new Date(playlist.created_at),
      music_provider: "SoundCloud",
      name: playlist.title,
    });
  }
}

main();
