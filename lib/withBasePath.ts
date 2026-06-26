const BASE_PATH = "/yummy-nunu";

export function withBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === BASE_PATH || normalizedPath.startsWith(`${BASE_PATH}/`)) {
    return normalizedPath;
  }

  return `${BASE_PATH}${normalizedPath}`;
}
