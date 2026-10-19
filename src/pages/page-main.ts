import {OcrResultItem} from '@paddleocr/paddleocr-js'
import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query, state} from 'lit/decorators.js'
import toast from 'toastit'
import {playShutterAudio} from '../assets/assets.js'
import {ocrLanguageFlags} from '../constants.js'
import {cropper} from '../cropper.js'
import {store} from '../store.js'
import {
	copyCroppedImageToClipboard,
	getBlobKey,
	getClipboardImage,
	getCroppedImageBlob,
	getRemoteImage,
	loadImageFromDB,
	saveImageToDB,
} from '../utils.js'
import {PageElement} from './PageElement.js'

declare global {
	interface HTMLElementTagNameMap {
		'page-main': PageMain
	}
}

export let main: PageMain

@customElement('page-main')
@withController(store)
@withStyles(css``)
export class PageMain extends PageElement {
	@state() blobUrl?: string

	@query('#container') containerElement!: HTMLDivElement
	@query('img') imgElement!: HTMLImageElement

	constructor() {
		super()
		main = this
	}

	render() {
		return html`
			${
				this.blobUrl
					? html`
							<div
								id="container"
								class="fixed inset-0 flex items-center justify-center bg-(--md-sys-color-primary)"
							>
								<div class="relative">
									<img src="${this.blobUrl}" class="block" />
									${cropper}
								</div>
							</div>
							<div class="fixed bottom-0 left-0">
								${ocrLanguageFlags[store.ocrLanguage]}
							</div>
						`
					: null
			}
		`
	}

	protected firstUpdated() {
		this.loadImage()
		window.addEventListener('resize', () => this.stretchImage())
		window.addEventListener('paste', async () => {
			const clipboard = await getClipboardImage()
			if (clipboard === null) {
				toast('No image to paste')
				return
			}
			this.loadImage()
		})
	}

	private lastImageKey: string | null = null

	async loadImage() {
		const remote = await getRemoteImage()
		const clipboard = await getClipboardImage()
		const db = await loadImageFromDB()

		if (!remote && !clipboard && !db) return

		let imgBlob = (remote ?? clipboard ?? db)!
		let source: 'remote' | 'clipboard' | 'db' = remote
			? 'remote'
			: clipboard
				? 'clipboard'
				: 'db'

		if (clipboard && db) {
			const imgBlobKey = await getBlobKey(clipboard)
			const dbBlobKey = await getBlobKey(db)

			if (imgBlobKey === dbBlobKey) {
				imgBlob = db
				source = 'db'
			} else {
				imgBlob = clipboard
				source = 'clipboard'
			}
		}

		if (remote) {
			imgBlob = remote
			source = 'remote'
		}

		const key = await getBlobKey(imgBlob)
		if (key === this.lastImageKey) return

		this.lastImageKey = key
		const newImage = source === 'clipboard'

		this.blobUrl = URL.createObjectURL(imgBlob)

		await this.updateComplete
		await this.imgElement.decode()

		const naturalWidth = this.imgElement.naturalWidth
		const naturalHeight = this.imgElement.naturalHeight

		cropper.bounds = {w: naturalWidth, h: naturalHeight}

		if (newImage) {
			saveImageToDB(imgBlob)

			const marginX = naturalWidth * 0.25
			const marginY = naturalHeight * 0.25

			cropper.setCrop({
				x1: marginX,
				y1: marginY,
				x2: naturalWidth - marginX,
				y2: naturalHeight - marginY,
			})
		}

		this.stretchImage()
	}

	stretchImage() {
		if (!this.imgElement?.naturalWidth || !this.imgElement?.naturalHeight)
			return

		const naturalWidth = this.imgElement.naturalWidth
		const naturalHeight = this.imgElement.naturalHeight

		const scale = Math.min(
			this.containerElement.clientWidth / naturalWidth,
			this.containerElement.clientHeight / naturalHeight,
		)

		this.imgElement.style.width = `${naturalWidth * scale}px`
		this.imgElement.style.height = `${naturalHeight * scale}px`
	}

	async copyCroppedImageInClipboard() {
		if (!this.imgElement) return

		const {x1, y1, x2, y2} = cropper

		try {
			await copyCroppedImageToClipboard(this.imgElement, {
				x: x1,
				y: y1,
				w: x2 - x1,
				h: y2 - y1,
			})
			playShutterAudio()
		} catch {
			toast('An error has occured.')
		}
	}

	#paddleOCR:
		| Awaited<
				ReturnType<typeof import('@paddleocr/paddleocr-js').PaddleOCR.create>
		  >
		| undefined

	async getPaddleOCR() {
		if (!this.#paddleOCR) {
			try {
				const {PaddleOCR} = await import('@paddleocr/paddleocr-js')
				this.#paddleOCR = await PaddleOCR.create({
					lang: 'japan',
					ocrVersion: 'PP-OCRv5',
				})
			} catch (err) {
				toast("Couldn't create paddleOCR")
				return
			}
		}

		return this.#paddleOCR
	}

	#framedIndex = 0
	#framedTextItems: OcrResultItem[] | undefined

	async loadFrames({
		mergeDistance = 20,
		padding = 10,
	}: {
		mergeDistance?: number
		padding?: number
	} = {}) {
		if (!this.#framedTextItems) {
			try {
				const ocr = await this.getPaddleOCR()
				if (!ocr) return

				const [result] = await ocr.predict(this.imgElement)

				this.#framedTextItems = result?.items ?? []
			} catch {
				toast('Failed to load OCR.')
				return
			}
		}

		if (!this.#framedTextItems.length) {
			toast('No text found.')
			return
		}

		const items = this.#framedTextItems.map((item) => ({
			...item,
			poly: item.poly.map(([x, y]) => [x, y] as [number, number]),
		}))

		if (mergeDistance > 0) {
			let merged = true

			while (merged) {
				merged = false

				for (let i = 0; i < items.length; i++) {
					const a = items[i]
					if (!a) continue

					const ax = a.poly.map(([x]) => x)
					const ay = a.poly.map(([, y]) => y)
					const aBox = {
						x1: Math.min(...ax),
						y1: Math.min(...ay),
						x2: Math.max(...ax),
						y2: Math.max(...ay),
					}

					for (let j = i + 1; j < items.length; j++) {
						const b = items[j]
						if (!b) continue

						const bx = b.poly.map(([x]) => x)
						const by = b.poly.map(([, y]) => y)
						const bBox = {
							x1: Math.min(...bx),
							y1: Math.min(...by),
							x2: Math.max(...bx),
							y2: Math.max(...by),
						}

						const dx = Math.max(0, aBox.x1 - bBox.x2, bBox.x1 - aBox.x2)
						const dy = Math.max(0, aBox.y1 - bBox.y2, bBox.y1 - aBox.y2)

						if (Math.hypot(dx, dy) > mergeDistance) continue

						const x1 = Math.min(aBox.x1, bBox.x1)
						const y1 = Math.min(aBox.y1, bBox.y1)
						const x2 = Math.max(aBox.x2, bBox.x2)
						const y2 = Math.max(aBox.y2, bBox.y2)

						items[i] = {
							...a,
							text: `${a.text} ${b.text}`,
							poly: [
								[x1, y1],
								[x2, y1],
								[x2, y2],
								[x1, y2],
							],
						}

						items.splice(j, 1)
						merged = true
						break
					}

					if (merged) break
				}
			}
		}

		if (padding > 0) {
			for (const item of items) {
				const xs = item.poly.map(([x]) => x)
				const ys = item.poly.map(([, y]) => y)

				const x1 = Math.min(...xs) - padding
				const y1 = Math.min(...ys) - padding
				const x2 = Math.max(...xs) + padding
				const y2 = Math.max(...ys) + padding

				item.poly = [
					[x1, y1],
					[x2, y1],
					[x2, y2],
					[x1, y2],
				]
			}
		}

		return items
	}

	async cycleFrame() {
		const frames = await this.loadFrames()

		if (!frames) return

		const item = frames[this.#framedIndex % frames.length]

		if (!item) return

		this.#framedIndex++

		const xs = item.poly.map(([x]) => x)
		const ys = item.poly.map(([, y]) => y)

		cropper.setCrop({
			x1: Math.min(...xs),
			y1: Math.min(...ys),
			x2: Math.max(...xs),
			y2: Math.max(...ys),
		})

		return item
	}

	async getFrameText() {
		const frames = await this.loadFrames()
		if (!frames) return

		return frames[this.#framedIndex - 1]?.text
	}

	async ocr() {
		const {x1, y1, x2, y2} = cropper
		const blob = await getCroppedImageBlob(this.imgElement, {
			x: x1,
			y: y1,
			w: x2 - x1,
			h: y2 - y1,
		})

		if (!blob) return

		try {
			const ocr = await this.getPaddleOCR()
			if (!ocr) return

			const [result] = await ocr.predict(blob)
			if (result === undefined) {
				toast('No text found.')
				return
			}
			return result.items.map((item) => item.text).join('\n')
		} catch {
			toast('Something went wrong')
		}
	}
}
