export const getPath = (url: string) => {
  const pathname = new URL(url).pathname;
  const currentPath = pathname.match(/\/[^/]+/g);
  let path = "/";
  if (currentPath) {
    path = currentPath[0];
  }
  return path;

}