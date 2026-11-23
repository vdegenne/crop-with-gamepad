import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query, state} from 'lit/decorators.js'
import {playShutterAudio} from '../assets/assets.js'
import {cropper} from '../cropper.js'
import {ocrLanguages} from '../lang.js'
import {OCR} from '../ocr/index.js'
import {toast} from '../snackbar.js'
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

	#ocr = new OCR(store.ocrLanguage)
	#ocrLanguage = store.ocrLanguage

	private lastImageKey: string | null = null

	get ocr() {
		return this.#ocr
	}

	constructor() {
		super()

		main = this

		let detectionLoaded = 0
		let detectionTotal = 0
		let recognitionLoaded = 0
		let recognitionTotal = 0
		let lastToastedProgress = 0

		this.#ocr.onProgress = (progress) => {
			switch (progress.stage) {
				case 'cached':
				case 'downloaded':
					if (progress.model === 'detection') {
						detectionLoaded = progress.loaded
						detectionTotal = progress.total ?? progress.loaded
					} else {
						recognitionLoaded = progress.loaded
						recognitionTotal = progress.total ?? progress.loaded
					}
					break

				case 'downloading':
					if (progress.model === 'detection') {
						detectionLoaded = progress.loaded
						detectionTotal = progress.total ?? detectionTotal
					} else {
						recognitionLoaded = progress.loaded
						recognitionTotal = progress.total ?? recognitionTotal
					}
					break

				case 'initializing':
					toast({
						message: 'Initializing OCR engine...',
					})
					console.log('Initializing OCR engine...')
					break

				case 'ready':
					toast({
						message: 'OCR ready',
					})
					console.log('OCR ready')
					break
			}

			if (!detectionTotal || !recognitionTotal) return

			const loaded = detectionLoaded + recognitionLoaded
			const total = detectionTotal + recognitionTotal
			const percentage = Math.floor((loaded / total) * 100)

			if (percentage >= lastToastedProgress + 10) {
				lastToastedProgress = Math.floor(percentage / 10) * 10

				toast({
					message: `OCR models: ${lastToastedProgress}%`,
				})
			}
		}
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
								${ocrLanguages[store.ocrLanguage].flag}
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
				toast({message: 'No image to paste'})
				return
			}

			this.loadImage()
		})
	}

	protected updated() {
		if (this.#ocrLanguage === store.ocrLanguage) return

		this.#ocrLanguage = store.ocrLanguage
		this.#ocr.setLanguage(this.#ocrLanguage)
	}

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

			let values: CropValues = {
				x1: marginX,
				y1: marginY,
				x2: naturalWidth - marginX,
				y2: naturalHeight - marginY,
			}

			if (store.defaultCropValues) {
				values = store.defaultCropValues
			}

			cropper.setCrop(values)
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
			toast({message: 'An error has occured.'})
		}
	}

	async loadFrames(options: {mergeDistance?: number} = {}) {
		return this.#ocr.loadFrames(this.imgElement, options)
	}

	async cycleFrame(padding = 15) {
		const frame = await this.#ocr.nextFrame(this.imgElement, padding)

		if (!frame) return

		cropper.setCrop(frame)

		return frame
	}

	getFrameText() {
		return this.#ocr.getFrameText()
	}

	async recognizeOcr() {
		const {x1, y1, x2, y2} = cropper

		const blob = await getCroppedImageBlob(this.imgElement, {
			x: x1,
			y: y1,
			w: x2 - x1,
			h: y2 - y1,
		})

		if (!blob) return

		return this.#ocr.recognize(blob)
	}
}
