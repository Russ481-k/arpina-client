import { TreeItem } from "@/components/ui/tree-list";

export interface VisionSection {
  id?: string;
  title: string;
  content: string;
  type: "text" | "quote" | "list";
  items?: string[];
}

export interface Content extends TreeItem {
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  type: "page" | "vision" | "news" | "notice";
  sections?: VisionSection[];
  settings: {
    layout: "default" | "wide" | "full";
    showThumbnail: boolean;
    showTags: boolean;
    showDate: boolean;
    showAuthor: boolean;
    showRelatedContent: boolean;
    showTableOfContents: boolean;
  };
  metadata?: {
    author?: string;
    position?: string;
    department?: string;
    contact?: string;
  };
}

export function convertTreeItemToContent(
  item: TreeItem | null
): Content | null {
  if (!item) return null;

  return {
    ...item,
    title: item.name,
    description: "",
    content: "",
    type: "page",
    status: item.visible ? "PUBLISHED" : "DRAFT",
    settings: {
      layout: "default",
      showThumbnail: true,
      showTags: true,
      showDate: true,
      showAuthor: true,
      showRelatedContent: true,
      showTableOfContents: true,
    },
  };
}
