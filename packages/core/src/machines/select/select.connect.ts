// Select is an Adapter that implements the logic of a select-like component.

import { Index, SelectMachine } from "./select.types"

type AnyProps = Record<string, unknown>

// Handler types (framework agnostic)
type EventHandler<E = unknown> = (event: E) => void

export interface NormalizeProps {
    mergeProps: <P extends AnyProps>(...props: Array<P | undefined>) => P
}

function defaultMergeProps<P extends AnyProps>(...all: Array<P | undefined>): P {
    const result: AnyProps = {}

    for (const props of all) {
        if (!props) continue

        for (const key of Object.keys(props)) {
            const value = props[key]

            // merge event handlers: onKeyDown, onClick, etc.
            if (
                key.startsWith("on") &&
                typeof value === "function" &&
                typeof result[key] === "function"
            ) {
                const prev = result[key] as EventHandler
                const next = value as EventHandler
                result[key] = (event: unknown) => {
                    prev(event)
                    next(event)
                }
            } else {
                result[key] = value
            }
        }
    }

    return result as P
}

export function connectSelect<T>(
    machine: SelectMachine<T>,
    normalize: NormalizeProps = { mergeProps: defaultMergeProps }
) {
    const { mergeProps } = normalize

    let modality: "keyboard" | "pointer" = "pointer"

    function getTriggerProps(userProps: AnyProps = {}) {
        const internal: AnyProps = {
            role: "combobox",
            "aria-expanded": machine.api.isOpen,
            "aria-haspopup": "listbox",
            tabIndex: 0,

            onKeyDown: (e: any) => {
                modality = "keyboard"

                switch (e.key) {
                    case "ArrowDown":
                        e.preventDefault()
                        machine.send({ type: "ARROW_DOWN" })
                        break

                    case "ArrowUp":
                        e.preventDefault()
                        machine.send({ type: "ARROW_UP" })
                        break

                    case "Enter":
                    case " ":
                        e.preventDefault()
                        machine.send({ type: "TOGGLE" })
                        break

                    case "Escape":
                        e.preventDefault()
                        machine.send({ type: "CLOSE" })
                        break

                    default:
                        if (typeof e.key === "string" && e.key.length === 1) {
                            machine.send({ type: "TYPEAHEAD", key: e.key })
                        }
                }
            },

            onClick: (e: any) => {
                // Ignora click generati da tastiera (Enter/Space su button)
                if (e?.detail === 0) return

                modality = "pointer"
                machine.send({ type: "TOGGLE" })
            },

            onBlur: () => {
                machine.send({ type: "BLUR" })
            },
        }

        return mergeProps(internal, userProps)
    }

    // ✅ RE-ADD THIS (missing in your current file)
    function getListboxProps(userProps: AnyProps = {}) {
        const internal: AnyProps = {
            role: "listbox",
            tabIndex: -1,
        }

        return mergeProps(internal, userProps)
    }

    function getOptionProps(index: Index, userProps: AnyProps = {}) {
        const item = machine.context.items[index]
        const disabled = item?.disabled === true

        const internal: AnyProps = {
            role: "option",
            "aria-selected": machine.context.selectedIndex === index,
            "aria-disabled": disabled || undefined,
            tabIndex: machine.context.highlightedIndex === index ? 0 : -1,

            onPointerMove: () => {
                if (modality === "keyboard") return
                if (!disabled) machine.send({ type: "HIGHLIGHT", index })
            },
            onPointerDown: () => {
                modality = "pointer"
            },
            onClick: () => {
                modality = "pointer"
                if (!disabled) machine.send({ type: "SELECT", index })
            },
        }

        return mergeProps(internal, userProps)
    }

    return { getTriggerProps, getListboxProps, getOptionProps }
}