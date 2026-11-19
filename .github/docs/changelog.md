# Changelog

Decisions: [decisions.md](decisions.md).

## 0.3.0

### Breaking

| Change                                                                                                                            | Ruling   |
| --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `Combobox` replaced by `Select`, `Picker` and `Search`                                                                            | P27      |
| `ComboboxOption` renamed `SelectOption`; labels `comboboxTrigger` / `comboboxClear` / `comboboxEmpty` renamed `select*`           | P55      |
| `Search` takes `search(query, signal)` or `items`; no `filter`                                                                    | P54      |
| `--color-shadow`, `--color-overlay`, `--color-accent-a10`, `--color-accent-a20` are full colours: `var(--x)`, not `rgb(var(--x))` | P62      |
| Colour tokens are `light-dark()` pairs; `[data-theme='light']` only sets `color-scheme`                                           | P62      |
| Light-theme colours that missed contrast are darker; default chip text uses `--color-text-secondary`                              | P60      |
| `Progress` renders a native `<progress>`; the root is a plain wrapper                                                             | P63      |
| `Button` `label` names icon-only buttons only                                                                                     | Guidance |
| Scrollbars use `::-webkit-scrollbar`; `scrollbar-width` / `scrollbar-color` are gone                                              | P61      |
| TypeScript target and lib ES2023                                                                                                  | Guidance |

### Added

| Addition                                                                                                     | Ruling   |
| ------------------------------------------------------------------------------------------------------------ | -------- |
| `Select` (plain or `searchable`), `Picker`, `Search` with request-time search                                | P27, P54 |
| `size`, `labelHidden`, `emptyLabel`, option `icon`; Menu `icon` trigger                                      | P56      |
| Button `size` xs to xl, `tone`, `dashed`, `iconSide`, `shape` `rhombus` / `plain`                            | P57      |
| Phone-width bottom sheet for the select family; Modal `sheet`, `initialFocus`                                | P58      |
| `rowPitch` virtual rows; `VirtualList`                                                                       | P59      |
| Hidden native select carries the form value; `autoComplete`                                                  | P53      |
| `hint` / `error` on Select, Picker, Search, NumericInput; `required` on the sheet                            | P64      |
| NumericInput `name`, `required`, `disabled`, `readOnly`                                                      | Guidance |
| Progress indeterminate without `value`                                                                       | P63      |
| Tab panels found by find-in-page                                                                             | P65      |
| Field errors announced                                                                                       | P67      |
| HoverCard keyboard reach, roles, click or Enter to pin, close button, `width`, `card`; provider `hoverCards` | P68      |
| `_luminance.scss`: `luminance`, `contrast`, `contrast-floor`                                                 | P60      |
| 24px hit areas on small targets                                                                              | P66      |

### Fixed

| Fix                                                                    | Ruling   |
| ---------------------------------------------------------------------- | -------- |
| Tooltip hint reachable by the pointer                                  | Guidance |
| Modals close on the back gesture                                       | Guidance |
| Overlay scroll stays off the page; menus and popovers fit the viewport | Guidance |
| Reduced motion keeps fades and colour changes                          | Guidance |
| Searchable Select submits its value                                    | Guidance |
| Controls show `:user-invalid`                                          | Guidance |
| Text 4.5:1, parts 3:1 in both themes                                   | P60      |

## 0.2.0

| Change                                                           | Ruling  |
| ---------------------------------------------------------------- | ------- |
| Link triggers: a tap opens the card, the header carries the link | P48     |
| Tooltip loses `href`                                             | P48     |
| P49 to P52                                                       | P49–P52 |
