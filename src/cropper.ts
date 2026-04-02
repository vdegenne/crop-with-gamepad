import {Debouncer} from '@vdegenne/debouncer'
import {state} from '@snar/lit'
import {css, html, LitElement, PropertyValues} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'

@customElement('cropper-element')
@withStyles(css`
	.mask {
		background: rgba(0, 0, 0, 0.5);
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
	@state() x1 = 0
	@state() y1 = 0
	@state() x2 = 0
	@state() y2 = 0
	@state() bounds = {
		w: 0,
		h: 0,
	}

	// Natural clama
	update(changed: PropertyValues<this>) {
		if (this.x1 > this.x2) {
			const t = this.x1
			this.x1 = this.x2
			this.x2 = t
		}

		if (this.y1 > this.y2) {
			const t = this.y1
			this.y1 = this.y2
			this.y2 = t
		}

		// optional hard clamp (sécurité)
		// this.x1 = Math.max(0, Math.min(this.bounds.w, this.x1))
		// this.x2 = Math.max(0, Math.min(this.bounds.w, this.x2))
		// this.y1 = Math.max(0, Math.min(this.bounds.h, this.y1))
		// this.y2 = Math.max(0, Math.min(this.bounds.h, this.y2))
		super.update(changed)

		this.saveValues()
	}

	render() {
		const left = (this.x1 / this.bounds.w) * 100
		const top = (this.y1 / this.bounds.h) * 100
		const width = ((this.x2 - this.x1) / this.bounds.w) * 100
		const height = ((this.y2 - this.y1) / this.bounds.h) * 100

		return html`
			<div
				class="relative w-full h-full"
				style="
      --x1: ${left}%;
      --y1: ${top}%;
      --x2: ${left + width}%;
      --y2: ${top + height}%;
    "
			>
				<div class="absolute inset-0 mask"></div>

				<div
					class="absolute pointer-events-none"
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

	protected firstUpdated() {
		const raw = localStorage.getItem('crop-with-gamepad:crop-values')
		if (!raw) return

		try {
			const parsed = JSON.parse(raw)

			this.x1 = parsed.x1 ?? 0
			this.y1 = parsed.y1 ?? 0
			this.x2 = parsed.x2 ?? 0
			this.y2 = parsed.y2 ?? 0

			this.bounds = parsed.bounds ?? {w: 0, h: 0}

			this.requestUpdate()
		} catch {}
	}

	#saveValuesDebouncer = new Debouncer(() => this.#saveValues(), 100)

	#saveValues() {
		localStorage.setItem(
			'crop-with-gamepad:crop-values',
			JSON.stringify({
				x1: this.x1,
				y1: this.y1,
				x2: this.x2,
				y2: this.y2,
				bounds: this.bounds,
			}),
		)
	}

	saveValues() {
		this.#saveValuesDebouncer.call()
	}
}

export const cropper = new CropperElement()
