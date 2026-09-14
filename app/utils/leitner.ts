export const INTERVALS = [0, 1, 3, 7, 14] as const
export const MAX_BOX = 5
export const NEW_CARDS_PER_SESSION = 10

export interface CardState {
  box: number
  due: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function toDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(day: string, days: number): string {
  const [year, month, date] = day.split('-').map(Number)
  return toDay(new Date(year!, month! - 1, date! + days))
}

export function review(state: CardState | undefined, remembered: boolean, now: Date): CardState {
  const box = remembered ? Math.min((state?.box ?? 1) + 1, MAX_BOX) : 1
  return { box, due: addDays(toDay(now), INTERVALS[box - 1]!) }
}

export function isDue(state: CardState, now: Date): boolean {
  return state.due <= toDay(now)
}

export function buildSession(
  ids: string[],
  cards: Record<string, CardState>,
  now: Date,
  newLimit: number = NEW_CARDS_PER_SESSION,
): string[] {
  const due = ids
    .map((id, index) => ({ id, index, state: cards[id] }))
    .filter((entry): entry is { id: string; index: number; state: CardState } =>
      entry.state !== undefined ? isDue(entry.state, now) : false,
    )
    .sort((a, b) => a.state.due.localeCompare(b.state.due) || a.index - b.index)
    .map((entry) => entry.id)
  const fresh = ids.filter((id) => cards[id] === undefined).slice(0, newLimit)
  return [...due, ...fresh]
}
