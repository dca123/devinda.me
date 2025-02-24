export function calculateDesiredHeight(
  imageParams: { width: number; height: number },
  desiredWidth = 1080,
) {
  const desiredHeight = Math.round(
    (desiredWidth / imageParams.width) * imageParams.height,
  );
  return desiredHeight;
}
