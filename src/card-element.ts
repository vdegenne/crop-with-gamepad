import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {property} from 'lit/decorators.js'

@withStyles()
class CardElement extends LitElement {
	@property() headline = ''

	render() {
		const headline = this.headline
		// .replace(/=/g, '')
		// .trim()
		// .toLowerCase()
		// .replace(/^./, (c) => c.toUpperCase())

		return html`<!-- -->
			<md-gb-card color="elevated" class="w-full">
				<div
					id="content"
					class="flex flex-col flex-1 justify-between gap-4 p-4"
				>
					${headline ? html`<div>${headline}</div>` : null}
					<slot></slot>
				</div>
			</md-gb-card>
			<!-- -->`
	}
}

window.customElements.define('card-element', CardElement)
