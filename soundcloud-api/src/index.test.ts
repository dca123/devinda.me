import { SoundCloud } from ".";

async function main() {
  const sc = new SoundCloud({
    client_id: "akcDl6lB9RfwyhLSb2Xw2MwPR3Ow85Kr",
    ouath: "OAuth 2-299607-38647190-hip1ZeiLhpxHh8m",
  });
  const playlists = await sc.getPlaylists();
  console.log(playlists);
}

main();
