// state + transitions
import type {
    Index,
    Nullable,
    SelectApi,
    SelectContext,
    SelectEvent,
    SelectItem,
    SelectMachine,
    SelectOptions,
    SelectState,
} from "./select.types";

import {
    appendTypeahead,
    clearTypeahead,
    highlight,
    highlightFirst,
    highlightLast,
    highlightNext,
    highlightPrevious,
    selectIndex,
} from "./select.actions";

function getItemAt<T>(
    context: SelectContext<T>,
    index: Nullable<Index>
): Nullable<SelectItem<T>> {
    if (index === null) return null
    return context.items[index] ?? null
}

/**
 * Reducer: (state, context, event) -> (nextState, nextContext)
 * Pure function. No side effects.
 */
function transition<T>(
    state: SelectState,
    context: SelectContext<T>,
    event: SelectEvent
): { state: SelectState; context: SelectContext<T> } {
    switch (state.value) {
        case "closed": {
            switch (event.type) {
                case "OPEN":
                case "TOGGLE":
                    return {
                        state: { value: "open" },
                        context: context.highlightedIndex === null
                            ? highlightFirst(context)
                            : context,
                    }

                case "ARROW_DOWN":
                    return {
                        state: { value: "open" },
                        context: highlightFirst(context),
                    }

                case "ARROW_UP":
                    return {
                        state: { value: "open" },
                        context: highlightLast(context),
                    }

                // While closed, selection/highlight events are ignored for now.
                default:
                    return { state, context }
            }
        }

        case "open": {
            switch (event.type) {
                case "CLOSE":
                case "BLUR":
                    return {
                        state: { value: "closed" },
                        context: clearTypeahead(context),
                    }

                case "TOGGLE":
                    return {
                        state: { value: "closed" },
                        context: clearTypeahead(context),
                    }

                case "ARROW_DOWN":
                    return { state, context: highlightNext(context) }

                case "ARROW_UP":
                    return { state, context: highlightPrevious(context) }

                case "HOME":
                    return { state, context: highlightFirst(context) }

                case "END":
                    return { state, context: highlightLast(context) }

                case "HIGHLIGHT":
                    return { state, context: highlight(context, event.index) }

                case "SELECT": {
                    const next = selectIndex(context, event.index)
                    return {
                        state: { value: "closed" }, // select closes the popup (classic Select behavior)
                        context: clearTypeahead(next),
                    }
                }

                case "TYPEAHEAD": {
                    // Minimal typeahead v1:
                    // - accumulate string
                    // - (we'll add matching later in Step 4)
                    const next = appendTypeahead(context, event.key)
                    return { state, context: next }
                }

                case "TYPEAHEAD_CLEAR":
                    return { state, context: clearTypeahead(context) }

                case "OPEN":
                    // already open
                    return { state, context }

                default:
                    return { state, context }
            }
        }
    }
}

/**
 * Factory: creates a Select machine instance.
 */
export function createSelectMachine<T>(
    options: SelectOptions<T>
): SelectMachine<T> {
    const initialContext: SelectContext<T> = {
        items: options.items,
        selectedIndex: options.defaultSelectedIndex ?? null,
        highlightedIndex: options.defaultSelectedIndex ?? null,
        typeahead: "",
    }

    let state: SelectState = { value: "closed" }
    let context: SelectContext<T> = initialContext

    const send = (event: SelectEvent) => {
        const next = transition(state, context, event)
        state = next.state
        context = next.context
    }

    const api: SelectApi<T> = {
        get isOpen() {
            return state.value === "open"
        },

        get selectedItem() {
            return getItemAt(context, context.selectedIndex)
        },

        get highlightedItem() {
            return getItemAt(context, context.highlightedIndex)
        },

        open() {
            send({ type: "OPEN" })
        },
        close() {
            send({ type: "CLOSE" })
        },
        toggle() {
            send({ type: "TOGGLE" })
        },
        select(index: Index) {
            send({ type: "SELECT", index })
        },
        highlight(index: Index) {
            send({ type: "HIGHLIGHT", index })
        },
    }

    return {
        get state() {
            return state
        },
        get context() {
            return context
        },
        send,
        api,
    }
}