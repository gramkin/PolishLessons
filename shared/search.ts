export type SearchDocType = 'lesson' | 'word' | 'story'

export interface SearchDoc {
  id: string
  type: SearchDocType
  title: string
  text: string
  /**
   * Every inflected form of a headword, kept apart from `text` on purpose.
   * Prefix matching over an inflection table ranks words by how many forms
   * happen to share the typed prefix, so this field is searched exactly.
   */
  forms?: string
  url: string
}
