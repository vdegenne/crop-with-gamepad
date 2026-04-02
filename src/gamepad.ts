import {ReactiveController} from '@snar/lit'
import {MGamepad, MiniGamepad, Mode} from '@vdegenne/mini-gamepad'
import {state} from 'lit/decorators.js'
import {cropper} from './cropper.js'

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

			const SPEED = 10
			const ctrl = cropper

			const clamp = (v: number, min: number, max: number) =>
				Math.max(min, Math.min(max, v))

			gamepad.on(lup, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y1 = clamp(ctrl.y1 - SPEED * -value, 0, ctrl.bounds.h)
			})

			gamepad.on(ldown, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y1 = clamp(ctrl.y1 + SPEED * value, 0, ctrl.bounds.h)
			})

			gamepad.on(lleft, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x1 = clamp(ctrl.x1 - SPEED * -value, 0, ctrl.bounds.w)
			})

			gamepad.on(lright, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x1 = clamp(ctrl.x1 + SPEED * value, 0, ctrl.bounds.w)
			})
			gamepad.on(rup, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y2 = clamp(ctrl.y2 - SPEED * -value, 0, ctrl.bounds.h)
			})

			gamepad.on(rdown, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y2 = clamp(ctrl.y2 + SPEED * value, 0, ctrl.bounds.h)
			})

			gamepad.on(rleft, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x2 = clamp(ctrl.x2 - SPEED * -value, 0, ctrl.bounds.w)
			})

			gamepad.on(rright, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x2 = clamp(ctrl.x2 + SPEED * value, 0, ctrl.bounds.w)
			})
		})
	}
}

export const gamepadCtrl = new GamepadController()
