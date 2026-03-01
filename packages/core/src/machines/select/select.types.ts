// ==============================
// Select Machine Contracts
// ==============================

/**
 * Primitive utility types
 */
export type Index = number

export type Nullable<T> = T | null

/**
 * Data model for a selectable item.
 * Framework agnostic — no DOM assumptions.
 */
export interface SelectItem<T = unknown> {
    value: T
    label: string
    disabled?: boolean
}

/**
 * Finite states of the Select machine.
 * NOTE:
 * Open/closed lives ONLY here (not in context)
 */
export type SelectState =
    | { value: "closed" }
    | { value: "open" }

/**
 * Runtime context (mutable data handled by the machine)
 */
export interface SelectContext<T = unknown> {
    items: SelectItem<T>[]

    selectedIndex: Nullable<Index>
    highlightedIndex: Nullable<Index>

    /**
     * Accumulated keyboard input used for typeahead navigation
     */
    typeahead: string
}

/**
 * Events describe USER INTENT — not DOM events.
 */
export type SelectEvent =
    | { type: "OPEN" }
    | { type: "CLOSE" }
    | { type: "TOGGLE" }
    | { type: "BLUR" }
    | { type: "ARROW_DOWN" }
    | { type: "ARROW_UP" }
    | { type: "HOME" }
    | { type: "END" }
    | { type: "HIGHLIGHT"; index: Index }
    | { type: "SELECT"; index: Index }
    | { type: "TYPEAHEAD"; key: string }
    | { type: "TYPEAHEAD_CLEAR" }

/**
 * Event dispatcher used by adapters/frameworks
 */
export type SelectSend = (event: SelectEvent) => void

/**
 * User configuration when creating the machine
 */
export interface SelectOptions<T = unknown> {
    items: SelectItem<T>[]
    defaultSelectedIndex?: Index
    disabled?: boolean
}

/**
 * Public framework-agnostic API exposed by the machine
 */
export interface SelectApi<T = unknown> {
    isOpen: boolean

    selectedItem: Nullable<SelectItem<T>>
    highlightedItem: Nullable<SelectItem<T>>

    open(): void
    close(): void
    toggle(): void
    select(index: Index): void
    highlight(index: Index): void
}

/**
 * Final machine instance returned by the factory
 */
export interface SelectMachine<T = unknown> {
    readonly state: SelectState
    readonly context: SelectContext<T>

    send: SelectSend
    api: SelectApi<T>
}