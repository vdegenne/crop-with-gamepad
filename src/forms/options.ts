import { type StyleInfo } from 'lit/directives/style-map.js'

export interface SharedOptions<T extends HTMLElement = HTMLElement> {
	/** @default false */
	autofocus: boolean
	/** @default undefined */
	init: ((element: T) => void) | undefined
	/** @default false */
	disabled: boolean
	/**
	 * @default undefined
	 * @deprecated Use "style" instead.
	 */
	styles: string | undefined
	/** @default undefined */
	style: Readonly<StyleInfo> | undefined
	/** @default false */
	required: boolean
}

export const DEFAULT_SHARED_OPTIONS: SharedOptions = {
	autofocus: false,
	disabled: false,
	init: undefined,
	required: false,
	style: undefined,
	styles: undefined,
}
