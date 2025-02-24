import { type } from "arktype";
const playlist = type({
  artwork_url: "string.url | null",
  created_at: "string.date.iso",
  title: "string",
  track_count: "number",
  user_id: "number",
  sharing: "'public'| 'private'",
  id: type("number").pipe((v) => v.toString()),
  //"+": "delete",
});
const collection = type({
  collection: type({ playlist, type: "'playlist' | 'playlist-like'" }).array(),
  next_href: "string.url",
  //"+": "delete",
});

export type Playlist = typeof playlist.infer;

export class SoundCloud {
  private client_id: string;
  private oauth_secret: string;

  constructor(init: { client_id?: string; ouath?: string }) {
    const clientId = init.client_id ?? process.env.SOUNDCLOUD_CLIENT_ID;
    if (!clientId) {
      throw new Error("Set the client id");
    }
    this.client_id = clientId;

    const oauth = init.ouath ?? process.env.SOUNDCLOUD_OAUTH;
    if (!oauth) {
      throw new Error("Set the client id");
    }
    this.oauth_secret = oauth;
  }

  async getPlaylists() {
    const request = async (url?: string) => {
      const response = await fetch(
        url ??
          `https://api-v2.soundcloud.com/me/library/all?client_id=${this.client_id}&show_tracks=true`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.9",
            Authorization: this.oauth_secret,
          },
          method: "GET",
        },
      );
      const result = collection(await response.json());
      if (result instanceof type.errors) {
        throw new Error(result.summary);
      } else {
        const playlists = result.collection
          .filter(
            (c) => c.type === "playlist" && c.playlist.sharing === "public",
          )
          .map((c) => c.playlist);
        return { playlists, next_href: result.next_href };
      }
    };

    const playlists: Playlist[] = [];
    let next_href = undefined;
    do {
      const result = await request(next_href);
      playlists.push(...result.playlists);
      next_href = result.next_href;
    } while (next_href !== undefined);
    return playlists;
  }
}
