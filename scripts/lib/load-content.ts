import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'

export interface DataFile {
  path: string
  data: unknown
}

export interface MarkdownFile {
  path: string
  frontmatter: Record<string, unknown>
  body: string
}

export interface ContentBundle {
  chapters: DataFile | null
  patterns: DataFile | null
  words: DataFile[]
  stories: DataFile[]
  lessons: MarkdownFile[]
  cheatsheet: MarkdownFile | null
}

function toPosix(root: string, file: string): string {
  return relative(root, file).split(sep).join('/')
}

function listFiles(dir: string, extension: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith(extension))
    .map((name) => join(dir, name))
    .sort()
}

function readData(root: string, file: string): DataFile {
  return { path: toPosix(root, file), data: parseYaml(readFileSync(file, 'utf8')) }
}

function readMarkdown(root: string, file: string): MarkdownFile {
  const parsed = matter(readFileSync(file, 'utf8'))
  return { path: toPosix(root, file), frontmatter: parsed.data, body: parsed.content }
}

function optional<T>(file: string, read: (file: string) => T): T | null {
  return existsSync(file) ? read(file) : null
}

export function loadContent(root: string): ContentBundle {
  return {
    chapters: optional(join(root, 'chapters.yml'), (f) => readData(root, f)),
    patterns: optional(join(root, 'patterns.yml'), (f) => readData(root, f)),
    words: listFiles(join(root, 'words'), '.yml').map((f) => readData(root, f)),
    stories: listFiles(join(root, 'stories'), '.yml').map((f) => readData(root, f)),
    lessons: listFiles(join(root, 'lessons'), '.md').map((f) => readMarkdown(root, f)),
    cheatsheet: optional(join(root, 'cheatsheet.md'), (f) => readMarkdown(root, f)),
  }
}
