import {ReactiveController} from '@snar/lit'
import {MGamepad, MiniGamepad, Mode} from '@vdegenne/mini-gamepad'
import {state} from 'lit/decorators.js'
import {cropperCtrl} from './cropper.js'

class GamepadController extends ReactiveController {
	@state() gamepad: MGamepad | undefined

	constructor() {
		super()
		const minigp = new MiniGamepad({
			// pollSleepMs: 900,
			focusDeadTimeMs: 200,
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
			} = map

			const SPEED = 5
			const ctrl = cropperCtrl

			const clamp = (v: number, min: number, max: number) =>
				Math.max(min, Math.min(max, v))

			gamepad.on(lup, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y = clamp(ctrl.y - SPEED * -value, 0, ctrl.bounds.h - ctrl.h)
			})

			gamepad.on(ldown, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y = clamp(ctrl.y + SPEED * value, 0, ctrl.bounds.h - ctrl.h)
			})

			gamepad.on(lleft, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x = clamp(ctrl.x - SPEED * -value, 0, ctrl.bounds.w - ctrl.w)
			})

			gamepad.on(lright, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x = clamp(ctrl.x + SPEED * value, 0, ctrl.bounds.w - ctrl.w)
			})

			gamepad.on(rup, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.h = clamp(ctrl.h - SPEED * -value, 1, ctrl.bounds.h - ctrl.y)
			})

			gamepad.on(rdown, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.h = clamp(ctrl.h + SPEED * value, 1, ctrl.bounds.h - ctrl.y)
			})

			gamepad.on(rleft, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.w = clamp(ctrl.w - SPEED * -value, 1, ctrl.bounds.w - ctrl.x)
			})

			gamepad.on(rright, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.w = clamp(ctrl.w + SPEED * value, 1, ctrl.bounds.w - ctrl.x)
			})
		})
	}
}

export const gamepadCtrl = new GamepadController()
