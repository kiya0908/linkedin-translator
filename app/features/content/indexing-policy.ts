//子目录列表页和详情页收录策略决定组件
import type {
  ContentCollection,
  ContentEntrySummary,
  ContentIndexPolicy,
  ContentLocale,
} from "./types";
//详情页总开关
const CONTENT_ENTRY_INDEXING_ENABLED = false;
//列表页按目录单独配置开关
const CONTENT_COLLECTION_INDEX_POLICY: Record<
  ContentLocale,
  Record<ContentCollection, ContentIndexPolicy>
> = {
  en: {
    tools: {
      indexable: false,
      includeInSitemap: false,
    },
    templates: {
      indexable: false,
      includeInSitemap: false,
    },
    blog: {
      indexable: false,
      includeInSitemap: false,
    },
  },
  zh: {
    tools: {
      indexable: false,
      includeInSitemap: false,
    },
    templates: {
      indexable: false,
      includeInSitemap: false,
    },
    blog: {
      indexable: false,
      includeInSitemap: false,
    },
  },
};

export function getCollectionIndexPolicy(
  locale: ContentLocale,
  collection: ContentCollection
) {
  return CONTENT_COLLECTION_INDEX_POLICY[locale][collection];
}

export function canIndexCollectionPage(
  locale: ContentLocale,
  collection: ContentCollection
) {
  return getCollectionIndexPolicy(locale, collection).indexable;
}

export function canIncludeCollectionInSitemap(
  locale: ContentLocale,
  collection: ContentCollection
) {
  return getCollectionIndexPolicy(locale, collection).includeInSitemap;
}

export function getContentEntryIndexPolicy(
  entry: Pick<ContentEntrySummary, "indexable">
): ContentIndexPolicy {
  if (!CONTENT_ENTRY_INDEXING_ENABLED) {
    return {
      indexable: false,
      includeInSitemap: false,
    };
  }

  return {
    indexable: entry.indexable,
    includeInSitemap: entry.indexable,
  };
}

export function canIndexContentEntry(
  entry: Pick<ContentEntrySummary, "indexable">
) {
  return getContentEntryIndexPolicy(entry).indexable;
}

export function canIncludeEntryInSitemap(
  entry: Pick<ContentEntrySummary, "indexable">
) {
  return getContentEntryIndexPolicy(entry).includeInSitemap;
}
