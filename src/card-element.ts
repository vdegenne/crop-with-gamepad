import '@material/web/labs/card/elevated-card.js'
import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {property} from 'lit/decorators.js'

@withStyles()
class CardElement extends LitElement {
	@property() headline = ''

	render() {
		const headline = this.headline
			.replace(/=/g, '')
			.trim()
			.toLowerCase()
			.replace(/^./, (c) => c.toUpperCase())

		return html`<!-- -->
			<md-elevated-card class="flex flex-col">
				<div>
					<md-text-button inert class="my-1 mx-2">${headline}</md-text-button>
				</div>
				<div id="content" class="p-[0px_24px_24px]">
					<div class="flex flex-col gap-4"><slot></slot></div>
				</div>
			</md-elevated-card>
			<!-- -->`
	}
}

window.customElements.define('card-element', CardElement)
