import {state} from '@snar/lit'
import {Debouncer} from '@vdegenne/debouncer'
import {css, html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query} from 'lit/decorators.js'

@customElement('cropper-element')
@withStyles(css`
	:host {
		position: fixed;
	}
	.mask {
		background: rgba(0, 0, 0, 0.7);
		clip-path: polygon(
			0% 0%,
			0% 100%,
			var(--x1) 100%,
			var(--x1) var(--y1),
			var(--x2) var(--y1),
			var(--x2) var(--y2),
			var(--x1) var(--y2),
			var(--x1) 100%,
			100% 100%,
			100% 0%
		);
	}
`)
export class CropperElement extends LitElement {
	@state() imageBox: {x: number; y: number; w: number; h: number} = {
		x: 0,
		y: 0,
		w: 0,
		h: 0,
	}

	#bounds = {w: 0, h: 0}

	get bounds() {
		return this.#bounds
	}

	set bounds(value: {w: number; h: number}) {
		if (value.w === this.#bounds.w && value.h === this.#bounds.h) return

		this.#bounds = value
		if (this.container) this.#applyCrop()
	}

	@query('.container') container!: HTMLDivElement

	#x1 = 0
	#y1 = 0
	#x2 = 0
	#y2 = 0
	#left = 0
	#top = 0
	#width = 0
	#height = 0

	#updateCSSVar(name: string, value: number) {
		this.container.style.setProperty(name, `${value}%`)
	}

	get x1() {
		return this.#x1
	}
	set x1(value: number) {
		this.#x1 = value
		this.#left = (value / this.bounds.w) * 100
		this.#updateCSSVar('--x1', this.#left)
		this.saveValues()
	}

	get y1() {
		return this.#y1
	}
	set y1(value: number) {
		this.#y1 = value
		this.#top = (value / this.bounds.h) * 100
		this.#updateCSSVar('--y1', this.#top)
		this.saveValues()
	}

	get x2() {
		return this.#x2
	}
	set x2(value: number) {
		this.#x2 = value
		this.#updateCSSVar('--x2', (value / this.bounds.w) * 100)
		this.saveValues()
	}

	get y2() {
		return this.#y2
	}
	set y2(value: number) {
		this.#y2 = value
		this.#updateCSSVar('--y2', (value / this.bounds.h) * 100)
		this.saveValues()
	}

	setCrop({
		x1,
		y1,
		x2,
		y2,
	}: {
		x1?: number
		y1?: number
		x2?: number
		y2?: number
	}) {
		if (x1 !== undefined) this.x1 = x1
		if (y1 !== undefined) this.y1 = y1
		if (x2 !== undefined) this.x2 = x2
		if (y2 !== undefined) this.y2 = y2
	}

	protected firstUpdated() {
		const raw = localStorage.getItem('crop-with-gamepad:crop-values')
		if (!raw) return

		try {
			const parsed = JSON.parse(raw)

			this.bounds = parsed.bounds ?? {w: 0, h: 0}

			this.setCrop({
				x1: parsed.x1 ?? 0,
				y1: parsed.y1 ?? 0,
				x2: parsed.x2 ?? 0,
				y2: parsed.y2 ?? 0,
			})
		} catch {}
	}

	// protected updated(changed: PropertyValues<this>) {
	// 	if (changed.has('bounds')) {
	// 		// Bounds affect all four derived values.
	// 		this.#left = NaN
	// 		this.#top = NaN
	// 		this.#width = NaN
	// 		this.#height = NaN
	//
	// 		this.#applyCrop()
	// 	}
	// }

	#applyCrop() {
		const left = (this.#x1 / this.bounds.w) * 100
		const top = (this.#y1 / this.bounds.h) * 100
		const right = (this.#x2 / this.bounds.w) * 100
		const bottom = (this.#y2 / this.bounds.h) * 100

		this.#left = left
		this.#top = top
		this.#width = right - left
		this.#height = bottom - top

		this.#updateCSSVar('--x1', left)
		this.#updateCSSVar('--y1', top)
		this.#updateCSSVar('--x2', right)
		this.#updateCSSVar('--y2', bottom)
	}

	render() {
		return html`
			<div class="container relative w-full h-full">
				<div class="absolute inset-0 mask"></div>

				<div
					class="absolute pointer-events-none border border-(--md-sys-color-secondary) box-border"
					style="
						left: var(--x1);
						top: var(--y1);
						width: calc(var(--x2) - var(--x1));
						height: calc(var(--y2) - var(--y1));
					"
				></div>
			</div>
		`
	}

	#saveValuesDebouncer = new Debouncer(() => this.#saveValues(), 100)

	#saveValues() {
		localStorage.setItem(
			'crop-with-gamepad:crop-values',
			JSON.stringify({
				x1: this.#x1,
				y1: this.#y1,
				x2: this.#x2,
				y2: this.#y2,
				bounds: this.bounds,
			}),
		)
	}

	saveValues() {
		this.#saveValuesDebouncer.call()
	}
}

export const cropper = new CropperElement()
