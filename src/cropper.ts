import {ReactiveController, state, withController} from '@snar/lit'
import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'

@saveToLocalStorage('crop-with-gamepad:crop-values')
class CropperController extends ReactiveController {
	@state() x1 = 0
	@state() y1 = 0
	@state() x2 = 0
	@state() y2 = 0
	@state() bounds = {
		w: 0,
		h: 0,
	}
}

export const cropperCtrl = new CropperController()

@customElement('cropper-element')
@withStyles()
@withController(cropperCtrl)
export class CropperElement extends LitElement {
	render() {
		return html`<!-- -->
			<div class="fixed bg-amber-600 top-0 left-0">
				${cropperCtrl.x1}<br />
				${cropperCtrl.y1}<br />
				${cropperCtrl.x2}<br />
				${cropperCtrl.y2}<br />
				${cropperCtrl.bounds.w}<br />
				${cropperCtrl.bounds.h}
			</div>
			<!-- -->`
	}
}

export const cropper = new CropperElement()
