import { SoundCloud } from ".";

async function playlists() {
  const sc = new SoundCloud({
    client_id: "akcDl6lB9RfwyhLSb2Xw2MwPR3Ow85Kr",
    ouath: "OAuth 2-299607-38647190-hip1ZeiLhpxHh8m",
  });
  const playlists = await sc.getPlaylists();
  console.log(playlists);
}

async function tracks() {
  const sc = new SoundCloud({
    client_id: "akcDl6lB9RfwyhLSb2Xw2MwPR3Ow85Kr",
    ouath: "OAuth 2-299607-38647190-hip1ZeiLhpxHh8m",
  });
  const tracks = await sc.getTracks("1953165023")
  console.log(tracks);
}
tracks()

