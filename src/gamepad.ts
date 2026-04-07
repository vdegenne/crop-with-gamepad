import {ReactiveController} from '@snar/lit'
import {MGamepad, MiniGamepad, Mode} from '@vdegenne/mini-gamepad'
import {state} from 'lit/decorators.js'
import {cropper} from './cropper.js'
import {main} from './pages/page-main.js'
import {sleep} from './utils.js'
import {store} from './store.js'

class GamepadController extends ReactiveController {
	@state() gamepad: MGamepad | undefined

	constructor() {
		super()
		const minigp = new MiniGamepad({
			// pollSleepMs: 900,
			focusDeadTimeMs: 200,
			axesThreshold: 0.15,
		})
		minigp.onConnect((gamepad) => {
			// document.body.requestPointerLock()
			this.gamepad = gamepad

			const map = gamepad.mapping
			const {
				LEFT_STICK_UP: lup,
				LEFT_STICK_DOWN: ldown,
				LEFT_STICK_LEFT: lleft,
				LEFT_STICK_RIGHT: lright,
				RIGHT_STICK_LEFT: rleft,
				RIGHT_STICK_RIGHT: rright,
				RIGHT_STICK_UP: rup,
				RIGHT_STICK_DOWN: rdown,
				RIGHT_BUTTONS_RIGHT: B,
				LEFT_BUTTONS_LEFT: dpadleft,
				LEFT_BUTTONS_BOTTOM: dpaddown,
				LEFT_STICK_PRESS: lpress,
			} = map

			window.addEventListener('voice-recorder-open', () => {
				gamepad.enabled = false
			})
			window.addEventListener('voice-recorder-close', () => {
				setTimeout(() => {
					gamepad.enabled = true
				}, 100)
			})

			const SPEED = 0.005
			const ctrl = cropper

			const clamp = (v: number, min: number, max: number) =>
				Math.max(min, Math.min(max, v))

			gamepad.for(lup).on(({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				console.log(value)
				ctrl.y1 = clamp(
					ctrl.y1 - SPEED * ctrl.bounds.h * -value,
					0,
					ctrl.bounds.h,
				)
			})

			gamepad.on(ldown, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y1 = clamp(
					ctrl.y1 + SPEED * ctrl.bounds.h * value,
					0,
					ctrl.bounds.h,
				)
			})

			gamepad.on(lleft, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x1 = clamp(
					ctrl.x1 - SPEED * ctrl.bounds.w * -value,
					0,
					ctrl.bounds.w,
				)
			})

			gamepad.on(lright, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x1 = clamp(
					ctrl.x1 + SPEED * ctrl.bounds.w * value,
					0,
					ctrl.bounds.w,
				)
			})

			gamepad.on(rup, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y2 = clamp(
					ctrl.y2 - SPEED * ctrl.bounds.h * -value,
					0,
					ctrl.bounds.h,
				)
			})

			gamepad.on(rdown, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y2 = clamp(
					ctrl.y2 + SPEED * ctrl.bounds.h * value,
					0,
					ctrl.bounds.h,
				)
			})

			gamepad.on(rleft, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x2 = clamp(
					ctrl.x2 - SPEED * ctrl.bounds.w * -value,
					0,
					ctrl.bounds.w,
				)
			})

			gamepad.on(rright, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x2 = clamp(
					ctrl.x2 + SPEED * ctrl.bounds.w * value,
					0,
					ctrl.bounds.w,
				)
			})

			gamepad.for(dpadleft).before(async ({mode}) => {
				if (mode === Mode.PRIMARY) {
					const url = 'https://chatgpt.com/'
					if (store.openLinksInNewTab) {
						window.open(url, '_blank')
					} else {
						window.location.href = url
					}
				}
			})
			gamepad.for(dpaddown).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						const url = 'https://www.google.com/?olud'
						if (store.openLinksInNewTab) {
							window.open(url, '_blank')
						} else {
							window.location.href = url
						}
						break
				}
			})

			gamepad.for(B).before(({mode}) => {
				if (mode === Mode.NORMAL) {
					main.copyCroppedImageInClipboard()
				}
			})

			gamepad.for(lpress).before(({mode}) => {
				switch (mode) {
					case Mode.SECONDARY:
						main.copyCroppedImageInClipboard()
						break
				}
			})
		})
	}
}

export const gamepadCtrl = new GamepadController()
