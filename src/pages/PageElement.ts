import {css, LitElement, PropertyValues} from 'lit';
import {property} from 'lit/decorators.js';

export class PageElement extends LitElement {
	@property({type: Boolean, reflect: true}) active = false;

	static styles = css`
		:host {
			flex: 1;
			display: flex;
			flex-direction: column;
		}
		:host(:not([active])) {
			display: none;
		}
	`;

	protected shouldUpdate(_changedProperties: PropertyValues): boolean {
		return this.active;
	}
}
