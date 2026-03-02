import { connectSelect, createSelectMachine } from "@lullaby/core"
import "./style.css"

const items = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "mela", label: "Mela" },
  { value: "cherry", label: "Cherry", disabled: true },
  { value: "date", label: "Date" },
]

const machine = createSelectMachine({ items })
const select = connectSelect(machine)

const app = document.querySelector<HTMLDivElement>("#app")!
app.innerHTML = `
  <div class="container">
    <h1>Select Playground</h1>

    <div class="select">
      <button id="trigger" class="trigger" type="button"></button>
      <div id="popover" class="popover" hidden>
        <div id="listbox" class="listbox"></div>
      </div>
    </div>

    <pre id="debug" class="debug"></pre>
  </div>
`

const trigger = document.querySelector<HTMLButtonElement>("#trigger")!
const popover = document.querySelector<HTMLDivElement>("#popover")!
const listbox = document.querySelector<HTMLDivElement>("#listbox")!
const debug = document.querySelector<HTMLPreElement>("#debug")!

// --- Helpers: set attrs (no re-binding) ---
function setAria(el: HTMLElement, name: string, value: any) {
  if (value === undefined || value === null || value === false) {
    el.removeAttribute(name)
  } else {
    el.setAttribute(name, String(value))
  }
}

function applyStatic() {
  // bind listeners ONCE
  trigger.addEventListener("keydown", (e) => {
    const p = select.getTriggerProps()
      ; (p.onKeyDown as any)?.(e)
    render()
  })
  trigger.addEventListener("click", (e) => {
    const p = select.getTriggerProps()
      ; (p.onClick as any)?.(e)
    render()
  })
  trigger.addEventListener("blur", (e) => {
    const p = select.getTriggerProps()
      ; (p.onBlur as any)?.(e)
    render()
  })

  // close on outside click (demo)
  document.addEventListener("pointerdown", (e) => {
    const t = e.target as Node
    if (!app.contains(t)) return
    if (!popover.hidden && !popover.contains(t) && t !== trigger) {
      machine.send({ type: "CLOSE" })
      render()
    }
  })
}

function render() {
  // label trigger
  trigger.textContent = machine.api.selectedItem?.label ?? "Choose a fruit"

  // trigger attributes
  const tp = select.getTriggerProps()
  trigger.setAttribute("role", String(tp.role ?? "combobox"))
  setAria(trigger, "aria-expanded", (tp as any)["aria-expanded"])
  setAria(trigger, "aria-haspopup", (tp as any)["aria-haspopup"])
  trigger.tabIndex = (tp.tabIndex as number) ?? 0

  // open/close
  popover.hidden = !machine.api.isOpen

  // listbox attrs
  const lp = select.getListboxProps()
  listbox.setAttribute("role", String(lp.role ?? "listbox"))
  listbox.tabIndex = (lp.tabIndex as number) ?? -1

  // options (recreate is fine, but listeners attach once per option node)
  listbox.innerHTML = ""
  machine.context.items.forEach((item, index) => {
    const opt = document.createElement("div")
    opt.className = "option"
    opt.textContent = item.label

    const op = select.getOptionProps(index)

    opt.setAttribute("role", String(op.role ?? "option"))
    setAria(opt, "aria-selected", (op as any)["aria-selected"])
    setAria(opt, "aria-disabled", (op as any)["aria-disabled"])
    opt.tabIndex = (op.tabIndex as number) ?? -1

    if (item.disabled) opt.classList.add("disabled")
    if (machine.context.selectedIndex === index) opt.classList.add("selected")
    if (machine.context.highlightedIndex === index) opt.classList.add("highlighted")

    opt.addEventListener("pointermove", (e) => {
      const p = select.getOptionProps(index)
        ; (p.onPointerMove as any)?.(e)
      render()
    })
    opt.addEventListener("pointerdown", (e) => {
      const p = select.getOptionProps(index)
        ; (p.onPointerDown as any)?.(e)
      render()
    })
    opt.addEventListener("click", (e) => {
      const p = select.getOptionProps(index)
        ; (p.onClick as any)?.(e)
      render()
    })

    listbox.appendChild(opt)
  })

  debug.textContent = JSON.stringify(
    {
      state: machine.state,
      selectedIndex: machine.context.selectedIndex,
      highlightedIndex: machine.context.highlightedIndex,
      selectedItem: machine.api.selectedItem?.label ?? null,
      highlightedItem: machine.api.highlightedItem?.label ?? null,
      typeahead: machine.context.typeahead,
    },
    null,
    2
  )
}

// init
applyStatic()
render()