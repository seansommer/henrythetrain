/** Pages is hosted below the repository name; the existing public Site is at /. */
export function assetUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
