export type SearchDocType = 'lesson' | 'word' | 'story'

export interface SearchDoc {
  id: string
  type: SearchDocType
  title: string
  text: string
  url: string
}
