import {ReactiveController} from '@snar/lit'
import {textSelectorOpen, textSelectorUrl} from '@vdegenne/links'
import {MGamepad, MiniGamepad, Mode} from '@vdegenne/mini-gamepad'
import {state} from 'lit/decorators.js'
import {cropper} from './cropper.js'
import {getMainPage} from './pages/index.js'
import {main} from './pages/page-main.js'
import {lockDefaultCropRegion} from './server/functions.js'
import {toast} from './snackbar.js'
import {store} from './store.js'
import {setVoicevoxRandomVoice, ttsPlayer} from './tts.js'
import {copyToClipboard} from './utils.js'

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
				RIGHT_BUTTONS_LEFT: X,
				LEFT_BUTTONS_LEFT: dpadleft,
				LEFT_BUTTONS_BOTTOM: dpaddown,
				LEFT_STICK_PRESS: lpress,
				L1: l1,
				R1: r1,
			} = map

			window.addEventListener('voice-recorder-open', () => {
				gamepad.enabled = false
			})
			window.addEventListener('voice-recorder-close', () => {
				setTimeout(() => {
					gamepad.enabled = true
				}, 100)
			})

			const SPEED = 0.007
			const ctrl = cropper

			const clamp = (v: number, min: number, max: number) =>
				Math.max(min, Math.min(max, v))

			gamepad.for(lup).on(({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y1 -= SPEED * ctrl.bounds.h * -value
			})

			gamepad.on(ldown, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y1 += SPEED * ctrl.bounds.h * value
			})

			gamepad.on(lleft, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x1 -= SPEED * ctrl.bounds.w * -value
			})

			gamepad.on(lright, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x1 += SPEED * ctrl.bounds.w * value
			})

			gamepad.on(rup, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y2 -= SPEED * ctrl.bounds.h * -value
			})

			gamepad.on(rdown, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.y2 += SPEED * ctrl.bounds.h * value
			})

			gamepad.on(rleft, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x2 -= SPEED * ctrl.bounds.w * -value
			})

			gamepad.on(rright, ({mode, value}) => {
				if (mode !== Mode.NORMAL) return
				ctrl.x2 += SPEED * ctrl.bounds.w * value
			})

			gamepad.for(dpadleft).before(async ({mode}) => {
				if (mode === Mode.PRIMARY) {
					await getMainPage().copyCroppedImageInClipboard()
					const url = 'https://chatgpt.com/'
					if (store.openLinksInNewTab) {
						window.open(url, '_blank')
					} else {
						window.location.href = url
					}
				}
			})

			gamepad.for(dpaddown).before(async ({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						await getMainPage().copyCroppedImageInClipboard()
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

			gamepad.for(lpress).before(async ({mode}) => {
				switch (mode) {
					case Mode.SECONDARY:
						main.copyCroppedImageInClipboard()
						break
					case Mode.TERTIARY:
						const text = await getMainPage().recognizeOcr()
						if (text) {
							copyToClipboard(text)
							toast({
								message: text.length > 20 ? text.slice(0, 20) + '...' : text,
							})
						} else {
							toast({message: 'No text found'})
						}
						break
				}
			})

			gamepad.for(r1).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						store.cycleNextAvailableOcrLanguage()
						break
				}
			})

			gamepad.for(l1).before(async ({mode}) => {
				switch (mode) {
					case Mode.SECONDARY:
						await setVoicevoxRandomVoice()
					case Mode.NORMAL:
						let text = main.ocr.getFrameText()
						if (!text) {
							text = await main.recognizeOcr()
						}
						if (text) {
							ttsPlayer.play([text, store.ocrLanguage])
						}
						break
				}
			})

			let isCycling = false
			gamepad.for(X).before(async ({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						if (isCycling) return
						try {
							isCycling = true
							await getMainPage()?.cycleFrame()
						} catch (err) {
							console.log(err)
						} finally {
							isCycling = false
						}
						break
					case Mode.PRIMARY:
						// const url = 'https://chatgpt.com/'
						// if (store.openLinksInNewTab) {
						// 	window.open(url, '_blank')
						// } else {
						// 	window.location.href = url
						// }
						const text =
							getMainPage().getFrameText() ??
							(await getMainPage()?.recognizeOcr())
						if (text) {
							if (store.openLinksInNewTab) {
								textSelectorOpen(text)
							} else {
								window.location.href = textSelectorUrl(text)
							}
						} else {
							toast({message: 'No text found'})
						}
						break
					case Mode.TERTIARY:
						lockDefaultCropRegion()
						break
				}
			})
		})
	}
}

export const gamepadCtrl = new GamepadController()
