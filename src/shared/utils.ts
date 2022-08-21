export function getPublicIdImage(url: string) {
  return url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
}
