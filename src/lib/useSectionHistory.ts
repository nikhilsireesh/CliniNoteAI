import { useReducer, useRef } from 'react'

/** Generic per-key undo/redo snapshot stacks, e.g. one stack per SOAP section. */
export function useSectionHistory<S extends string, V>() {
  const stacks = useRef<Partial<Record<S, V[]>>>({})
  const pointers = useRef<Partial<Record<S, number>>>({})
  const [, forceRender] = useReducer((x: number) => x + 1, 0)

  function init(section: S, value: V) {
    if (!stacks.current[section]) {
      stacks.current[section] = [value]
      pointers.current[section] = 0
    }
  }

  function push(section: S, value: V) {
    const currentPointer = pointers.current[section] ?? 0
    const trimmed = (stacks.current[section] ?? [value]).slice(0, currentPointer + 1)
    trimmed.push(value)
    stacks.current[section] = trimmed
    pointers.current[section] = trimmed.length - 1
    forceRender()
  }

  function undo(section: S): V | undefined {
    const p = pointers.current[section] ?? 0
    if (p <= 0) return undefined
    pointers.current[section] = p - 1
    forceRender()
    return stacks.current[section]?.[p - 1]
  }

  function redo(section: S): V | undefined {
    const stack = stacks.current[section]
    const p = pointers.current[section] ?? 0
    if (!stack || p >= stack.length - 1) return undefined
    pointers.current[section] = p + 1
    forceRender()
    return stack[p + 1]
  }

  function canUndo(section: S): boolean {
    return (pointers.current[section] ?? 0) > 0
  }

  function canRedo(section: S): boolean {
    const stack = stacks.current[section]
    return !!stack && (pointers.current[section] ?? 0) < stack.length - 1
  }

  return { init, push, undo, redo, canUndo, canRedo }
}
