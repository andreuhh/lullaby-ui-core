// mutations context
import {
    Index,
    Nullable,
    SelectContext
} from "./select.types"

function isItemDisabled<T>(
    context: SelectContext<T>,
    index: Index
): boolean {
    const item = context.items[index]

    if (!item) {
        throw new Error(`Invalid index ${index}`)
    }

    return item.disabled === true
}

export function findNextEnabledIndex<T>(
    context: SelectContext<T>,
    startIndex: number
): Nullable<Index> {
    const { items } = context

    for (let i = startIndex + 1; i < items.length; i++) {
        if (!isItemDisabled(context, i)) return i
    }

    return null
}

export function findPreviousEnabledIndex<T>(
    context: SelectContext<T>,
    startIndex: number
): Nullable<Index> {
    for (let i = startIndex - 1; i >= 0; i--) {
        if (!isItemDisabled(context, i)) return i
    }

    return null
}

export function findFirstEnabledIndex<T>(
    context: SelectContext<T>
): Nullable<Index> {
    const index = context.items.findIndex(item => !item.disabled)
    return index === -1 ? null : index
}

export function findLastEnabledIndex<T>(
    context: SelectContext<T>
): Nullable<Index> {
    for (let i = context.items.length - 1; i >= 0; i--) {
        if (!isItemDisabled(context, i)) return i
    }
    return null
}

export function highlight<T>(
    context: SelectContext<T>,
    index: Nullable<Index>
): SelectContext<T> {
    if (index === null) return context

    if (isItemDisabled(context, index)) {
        return context
    }

    return {
        ...context,
        highlightedIndex: index
    }
}

export function highlightNext<T>(
    context: SelectContext<T>
): SelectContext<T> {

    const current = context.highlightedIndex ?? -1

    const next = findNextEnabledIndex(context, current)

    if (next === null) return context

    return {
        ...context,
        highlightedIndex: next
    }
}

export function highlightPrevious<T>(
    context: SelectContext<T>
): SelectContext<T> {

    const current =
        context.highlightedIndex ?? context.items.length

    const prev = findPreviousEnabledIndex(context, current)

    if (prev === null) return context

    return {
        ...context,
        highlightedIndex: prev
    }
}

export function highlightFirst<T>(
    context: SelectContext<T>
): SelectContext<T> {

    const index = findFirstEnabledIndex(context)

    if (index === null) return context

    return {
        ...context,
        highlightedIndex: index
    }
}

export function highlightLast<T>(
    context: SelectContext<T>
): SelectContext<T> {

    const index = findLastEnabledIndex(context)

    if (index === null) return context

    return {
        ...context,
        highlightedIndex: index
    }
}

export function selectIndex<T>(
    context: SelectContext<T>,
    index: Index
): SelectContext<T> {

    if (isItemDisabled(context, index)) {
        return context
    }

    return {
        ...context,
        selectedIndex: index,
        highlightedIndex: index
    }
}

export function appendTypeahead<T>(
    context: SelectContext<T>,
    key: string
): SelectContext<T> {
    return {
        ...context,
        typeahead: context.typeahead + key
    }
}

export function clearTypeahead<T>(
    context: SelectContext<T>
): SelectContext<T> {
    return {
        ...context,
        typeahead: ""
    }
}