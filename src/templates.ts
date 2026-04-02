import {html} from 'lit'

export const nothingYet = () => html`
	<div class="flex items-center justify-center gap-3 m-6">
		<md-icon>folder_open</md-icon>
		<span>Nothing yet :-(</span>
	</div>
`

export const loading = () => html`<!-- -->
	<div class="flex items-center justify-center m-12">
		<md-circular-progress indeterminate></md-circular-progress>
	</div>
	<!-- -->`
