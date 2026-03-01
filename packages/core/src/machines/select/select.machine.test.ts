import { describe, expect, it } from "vitest"
import { createSelectMachine } from "./select.machine"

describe("select machine", () => {
    it("opens and highlights first enabled item", () => {
        const m = createSelectMachine({
            items: [
                { value: 1, label: "A", disabled: true },
                { value: 2, label: "B" },
            ],
        })

        expect(m.api.isOpen).toBe(false)
        m.api.open()
        expect(m.api.isOpen).toBe(true)
        expect(m.context.highlightedIndex).toBe(1)
    })

    it("select closes and sets selectedIndex", () => {
        const m = createSelectMachine({
            items: [
                { value: 1, label: "A" },
                { value: 2, label: "B" },
            ],
        })

        m.api.open()
        m.api.select(1)
        expect(m.api.isOpen).toBe(false)
        expect(m.context.selectedIndex).toBe(1)
    })
})