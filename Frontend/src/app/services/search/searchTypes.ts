export type GlobalSearchResultType =
  | "course"
  | "unit"
  | "class"
  | "request"
  | "room";

export interface GlobalSearchResult {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  subtitle: string;
  path: string;
}
