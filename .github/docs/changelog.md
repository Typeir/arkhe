# Changelog

Decisions: [decisions.md](decisions.md).

⚠ Breaking.

## 0.4.1

### Fixed

- Fixed hidden [Tabs](../../packages/react/src/section/Tabs.tsx) panels so they let clicks through to the selected panel
- Fixed [HoverCard](../../packages/react/src/hint/HoverCard.tsx) so Escape closes only a menu opened in it, even before the menu takes focus

## 0.4.0

### Added

- Added [Checkbox](../../packages/react/src/choice/Checkbox.tsx)
- Added [RadioGroup](../../packages/react/src/choice/RadioGroup.tsx)
- Added [ToggleGroup](../../packages/react/src/choice/ToggleGroup.tsx)
- Added [Collapsible](../../packages/react/src/section/Collapsible.tsx)
- Added [Disclosure](../../packages/react/src/section/Disclosure.tsx)
- Added [Accordion](../../packages/react/src/section/Accordion.tsx)
- Added `look="folder"` to [Tabs](../../packages/react/src/section/Tabs.tsx)
- Added a draggable [header](../../packages/react/src/hint/CardHeader.tsx) to HoverCard
- Added `actions` and `headerLink` to [HoverCard](../../packages/react/src/hint/HoverCard.tsx)
- Added a tail to [Tooltip](../../packages/react/src/hint/Tooltip.tsx)
- Added stale result dimming to [Search](../../packages/react/src/select/Search.tsx)
- Added [cardDrag](../../packages/core/src/hint/cardDrag.ts) and [cardPlace](../../packages/core/src/hint/cardPlace.ts)
- Added [sleepingTrigger, wakeOf, WakeWatch and afterExit](../../packages/core/src/hint/sleep.ts)
- Added [loaderFor](../../packages/core/src/feedback/loader.ts)
- Added [dispatch](../../packages/core/src/base/reducer.ts)
- Added [hasText](../../packages/core/src/base/parts.ts)
- Added [listNote](../../packages/core/src/select/combobox.ts)
- Added [tabsLayer and TABS_GROUND](../../packages/core/src/section/tabsLook.ts)
- ⚠ Added `pointerover` and `pointerout` to [EventNames](../../packages/core/src/base/events.ts)
- Added [labels](../../packages/core/src/base/labels.ts) `showMore`, `showLess`, `clearSelection`, `expandAll`, `collapseAll`, `closeCard`, `moveCard`, `moveTopLeft`, `moveTopRight`, `moveBottomLeft`, `moveBottomRight`, `moveBack`, `cardMoved`, `cardMovedTo`
- Added prop type exports to the [Svelte port](../../packages/svelte/src/index.ts)
- Added `@zag-js/focus-visible` to both [ports](../../packages/react/package.json)

### Changed

- Changed [Tooltip](../../packages/react/src/hint/Tooltip.tsx) so it instantiates Zag on the first hover, focus or tap
- Changed [HoverCard](../../packages/react/src/hint/HoverCard.tsx) so it instantiates Zag on the first hover, focus or tap
- ⚠ Changed [Tooltip](../../packages/react/src/hint/Tooltip.tsx) so it drops Zag and its body once closed
- ⚠ Changed [HoverCard](../../packages/react/src/hint/HoverCard.tsx) so it drops Zag and its card once closed
- Changed [content loaders](../../packages/react/src/feedback/useContentLoader.ts) so one `load` keeps one loader across mounts
- ⚠ Changed [HoverCard](../../packages/react/src/hint/HoverCard.tsx) look for Ikuisuus's draggable card
- ⚠ Changed [Tooltip](../../packages/react/src/hint/Tooltip.tsx) look for Ikuisuus's tooltip
- ⚠ Changed [Select](../../packages/react/src/select/Select.tsx) selected option edge for accent text
- ⚠ Changed [Modal](../../packages/react/src/overlay/Modal.tsx) `header` for `div`
- ⚠ Changed [VirtualList](../../packages/react/src/list/VirtualList.tsx) `div role="list"` for `ul` / `li`
- ⚠ Changed [Search](../../packages/react/src/select/Search.tsx) `div role="search"` for `search`
- ⚠ Changed [Menu](../../packages/react/src/action/Menu.tsx) so it mounts its list on first hover, focus or open
- Changed [ArkheProvider](../../packages/react/src/base/ArkheProvider.tsx) so inline labels and icons keep their identity
- ⚠ Changed React controlled props for [useControllable](../../packages/react/src/base/useControllable.ts)
- ⚠ Changed Svelte bindable fallbacks for `default*` props
- ⚠ Changed `SearchRequest.dispose()` for [destroy()](../../packages/core/src/select/searchRequest.ts)
- ⚠ Changed `TiledSurface.teardown()` for [destroy()](../../packages/core/src/feedback/canvas/tiled.ts)
- ⚠ Changed `ManagedCanvas.free()` for [release()](../../packages/core/src/feedback/canvas/managed.ts)
- ⚠ Changed `undefined` for `null` in [resolveIcon](../../packages/core/src/base/icons.ts), [resolveTabValue and staleTabFallback](../../packages/core/src/section/tabs.ts), [PointerMemory.current](../../packages/core/src/hint/hint.ts)
- ⚠ Changed `styles/components/_*.scss` for [styles/components/\<family\>/\_\*.scss](../../packages/core/styles/components)

## 0.3.0

### Added

- Added [Select](../../packages/react/src/select/Select.tsx) with `searchable`
- Added [Picker](../../packages/react/src/select/Picker.tsx)
- Added [Search](../../packages/react/src/select/Search.tsx) with request-time search
- Added `size`, `labelHidden`, `emptyLabel` and option `icon` to [Select](../../packages/react/src/select/Select.tsx), Picker and Search
- Added an `icon` trigger to [Menu](../../packages/react/src/action/Menu.tsx)
- Added `size` xs to xl, `tone`, `dashed`, `iconSide` and `shape` `rhombus` / `plain` to [Button](../../packages/react/src/action/Button.tsx)
- Added a phone-width [bottom sheet](../../packages/react/src/select/SheetField.tsx) to Select, Picker and Search
- Added `sheet` and `initialFocus` to [Modal](../../packages/react/src/overlay/Modal.tsx)
- Added [VirtualList](../../packages/react/src/list/VirtualList.tsx)
- Added `rowPitch` [virtual rows](../../packages/core/src/list/virtual.ts)
- Added a hidden native select carrying the form value, and `autoComplete`, to [Select](../../packages/react/src/select/Select.tsx)
- Added `hint` and `error` to Select, Picker, Search and [NumericInput](../../packages/react/src/field/NumericInput.tsx)
- Added `required` to the [bottom sheet](../../packages/react/src/select/SheetField.tsx)
- Added `name`, `required`, `disabled` and `readOnly` to [NumericInput](../../packages/react/src/field/NumericInput.tsx)
- Added an indeterminate state without `value` to [Progress](../../packages/react/src/feedback/Progress.tsx)
- Added find-in-page to [Tabs](../../packages/react/src/section/Tabs.tsx) panels
- Added announcements to [Field](../../packages/react/src/field/Field.tsx) errors
- Added keyboard reach, roles, click or Enter to pin, a close button, `width` and `card` to [HoverCard](../../packages/react/src/hint/HoverCard.tsx)
- Added `hoverCards` to [ArkheProvider](../../packages/react/src/base/ArkheProvider.tsx)
- Added `luminance`, `contrast` and `contrast-floor` in [\_luminance.scss](../../packages/core/styles/_luminance.scss)
- Added 24px hit areas to small targets

### Changed

- ⚠ Changed `Combobox` for [Select](../../packages/react/src/select/Select.tsx), [Picker](../../packages/react/src/select/Picker.tsx) and [Search](../../packages/react/src/select/Search.tsx)
- ⚠ Changed `ComboboxOption` for [SelectOption](../../packages/core/src/select/combobox.ts)
- ⚠ Changed [labels](../../packages/core/src/base/labels.ts) `comboboxTrigger`, `comboboxClear` and `comboboxEmpty` for `selectTrigger`, `selectClear` and `selectEmpty`
- ⚠ Changed [Search](../../packages/react/src/select/Search.tsx) `filter` for `search(query, signal)` or `items`
- ⚠ Changed `rgb(var(--x))` for `var(--x)` on `--color-shadow`, `--color-overlay`, `--color-accent-a10` and `--color-accent-a20` in [\_tokens.scss](../../packages/core/styles/_tokens.scss)
- ⚠ Changed colour tokens for `light-dark()` pairs in [\_tokens.scss](../../packages/core/styles/_tokens.scss)
- ⚠ Changed `[data-theme='light']` colours for `color-scheme` only
- ⚠ Changed light-theme colours below contrast for darker ones
- ⚠ Changed default [Chip](../../packages/react/src/action/Chip.tsx) text for `--color-text-secondary`
- ⚠ Changed the [Progress](../../packages/react/src/feedback/Progress.tsx) root for a native `<progress>`
- ⚠ Changed [Button](../../packages/react/src/action/Button.tsx) `label` so it names icon-only buttons only
- ⚠ Changed `scrollbar-width` / `scrollbar-color` for [::-webkit-scrollbar](../../packages/core/styles/_shape.scss)
- ⚠ Changed the TypeScript target and lib for [ES2023](../../tsconfig.base.json)

### Fixed

- Fixed the [Tooltip](../../packages/react/src/hint/Tooltip.tsx) hint so the pointer can reach it
- Fixed [Modal](../../packages/react/src/overlay/Modal.tsx) so it closes on the back gesture
- Fixed overlay scroll leaking to the page, and menus and popovers overflowing the viewport
- Fixed reduced motion so it keeps fades and colour changes
- Fixed searchable [Select](../../packages/react/src/select/Select.tsx) so it submits its value
- Fixed controls so they show `:user-invalid`
- Fixed text to 4.5:1 and parts to 3:1 in both themes

## 0.2.0

### Added

- Added the [hint tree](../../packages/core/src/hint/hintTree.ts)
- Added a header link to [HoverCard](../../packages/react/src/hint/HoverCard.tsx)
- Added a per-trigger server markup budget to the [MDX tests](../../tests/mdx)

### Changed

- ⚠ Changed [HoverCard](../../packages/react/src/hint/HoverCard.tsx) link triggers so a tap opens the card instead of following the link
- ⚠ Changed [Tooltip](../../packages/react/src/hint/Tooltip.tsx) and HoverCard content for a portal into the environment container
- ⚠ Changed the [Status](../../packages/react/src/feedback/Status.tsx) root for a `span`
- Changed nested [triggers](../../packages/core/src/hint/hint.ts) so only the innermost opens

### Removed

- ⚠ Removed `href` from [Tooltip](../../packages/react/src/hint/Tooltip.tsx)
