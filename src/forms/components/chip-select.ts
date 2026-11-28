import { type MdFilterChip } from '@material/web/chips/filter-chip.js'
import { type MdInputChip } from '@material/web/chips/input-chip.js'
import { type CloseMenuEvent, type MdMenu } from '@material/web/menu/menu.js'
import { html, type TemplateResult } from 'lit'
import { createRef, ref } from 'lit/directives/ref.js'
import { DEFAULT_SHARED_OPTIONS, type SharedOptions } from '../options.js'

export interface ChipSelectOptions extends SharedOptions<MdFilterChip> {
	/**
	 * @default html`<md-icon>sort</md-icon>`
	 */
	leadingIcon: string | TemplateResult | undefined

	displayValues: readonly string[] | undefined

	/**
	 * @default false
	 */
	elevated: boolean
}

// MdInputChip.elementStyles.push(css`
// 	button.trailing.action {
// 		pointer-events: none;
// 	}
// `);

export function CHIPSELECT<T>(
	label: string,
	host: T,
	key: keyof T,
	choices: readonly string[],
	options?: Partial<ChipSelectOptions>,
) {
	const _options: ChipSelectOptions = {
		...DEFAULT_SHARED_OPTIONS,
		leadingIcon: html`<md-gb-icon>sort</md-gb-icon>`,
		displayValues: undefined,
		elevated: false,
		...options,
	}

	const menuRef = createRef<MdMenu>()
	const menu = () => menuRef.value!
	const chipRef = createRef<MdInputChip>()

	const onClick = (event: Event) => {
		event.preventDefault()
		menu().open = !menu().open
	}

	const _choices = choices.map((item, index) => ({
		item,
		displayValue: _options.displayValues?.[index] ?? item,
	}))

	return html`
		<md-chip-set class="relative">
			<md-filter-chip
				id="chip"
				${ref(chipRef)}
				@remove="${onClick}"
				@click="${onClick}"
				?elevated="${_options.elevated}"
				_positioning="popover"
				removable
			>
				${
					_options.leadingIcon
						? typeof _options.leadingIcon === 'string'
							? html`<md-gb-icon slot="icon"
									>${_options.leadingIcon}</md-gb-icon
								>`
							: html`<div slot="icon" style="--md-icon-size:18px;">
									${_options.leadingIcon}
								</div>`
						: null
				}
				<span
					>${_choices.find(({ item }) => item === host[key])?.displayValue ?? host[key]}</span
				>
				<md-gb-icon slot="remove-trailing-icon" style="--md-icon-size:18px;">
					arrow_drop_down
				</md-gb-icon>
			</md-filter-chip>

			<md-menu
				quick
				${ref(menuRef)}
				anchor="chip"
				@close-menu="${(event: CloseMenuEvent) => {
					const {
						reason: { kind: reason },
						initiator,
					} = event.detail

					if (reason === 'click-selection') {
						const choice = _choices.find(
							({ displayValue }) => displayValue === initiator.typeaheadText,
						)

						if (choice) {
							;(host[key] as string) = choice.item
						}
					}
				}}"
			>
				${_choices.map(
					({ item, displayValue }) =>
						html`<md-menu-item>
							<div slot="headline">${displayValue}</div>
						</md-menu-item>`,
				)}
			</md-menu>
		</md-chip-set>
	`
}
