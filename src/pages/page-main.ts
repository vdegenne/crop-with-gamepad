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
	computeContainBox,
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
@withStyles(css`
	:host {
	}
`)
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
								<div class="relative flex items-center justify-center">
									<img
										src=${this.blobUrl}
										class="block max-w-full max-h-full object-contain"
									/>
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
		window.addEventListener('paste', async () => {
			let clipboard = await getClipboardImage()
			if (clipboard === null) {
				// console.log('No image to paste')
				toast('No image to paste')
				return
			}
			this.loadImage()
		})
		window.addEventListener('resize', () => this.computeContainBox())
	}

	private lastImageKey: string | null = null

	async loadImage() {
		let remote = await getRemoteImage()
		console.log(`Remote image ?`, remote)
		let clipboard = await getClipboardImage()
		console.log(`Clipboard image ?`, clipboard)
		const db = await loadImageFromDB()

		if (!remote && !clipboard && !db) {
			console.log('No image found')
			// toast('No image found.')
			return
		}

		let imgBlob = (remote ?? clipboard ?? db)!
		let source: 'remote' | 'clipboard' | 'db' = remote
			? 'remote'
			: clipboard
				? 'clipboard'
				: 'db'
		console.log(`[choosen initial source]`, source)

		if (clipboard && db) {
			const imgBlobKey = await getBlobKey(clipboard)
			const dbBlobKey = await getBlobKey(db)
			console.log('--- img blob key ---')
			console.log(imgBlobKey)
			// console.log('--------------------')
			console.log('--- db blob key ---')
			console.log(dbBlobKey)
			// console.log('--------------------')

			if (imgBlobKey === dbBlobKey) {
				console.log('Same blob keys, keeping db image')
				imgBlob = db
				source = 'db'
			} else {
				console.log('Different blob keys, keeping clipboard img')
				imgBlob = clipboard
				source = 'clipboard'
			}
		}

		if (remote) {
			imgBlob = remote
		}

		console.log(`[choosen target source]`, source)
		const key = await getBlobKey(imgBlob)
		console.log('--- target img blob key ---')
		console.log(key)
		console.log('--- last blob key (ID) ---')
		console.log(this.lastImageKey)

		if (key === this.lastImageKey) {
			console.log('Same keys, aborting.')
			if (clipboard) {
				console.log('same images')
				// toast('Same images')
			}
			return
		}
		this.lastImageKey = key

		const newImage = source === 'clipboard'

		this.blobUrl = URL.createObjectURL(imgBlob)

		await this.updateComplete
		await this.imgElement.decode()

		const naturalWidth = this.imgElement.naturalWidth
		const naturalHeight = this.imgElement.naturalHeight

		if (newImage) {
			console.log('Nouvelle image, reset values')
			saveImageToDB(imgBlob)

			const marginX = naturalWidth * 0.25
			const marginY = naturalHeight * 0.25

			cropper.x1 = marginX
			cropper.y1 = marginY
			cropper.x2 = naturalWidth - marginX
			cropper.y2 = naturalHeight - marginY

			cropper.bounds = {w: naturalWidth, h: naturalHeight}
		}

		console.log(`Image from ${source}`)
		// toast(`Image from ${source}`)

		this.computeContainBox()
		// window.addEventListener('resize', () => this.computeContainBox())
	}

	computeContainBox() {
		const naturalWidth = this.imgElement.naturalWidth
		const naturalHeight = this.imgElement.naturalHeight

		const values = computeContainBox(
			this.containerElement.clientWidth,
			this.containerElement.clientHeight,
			naturalWidth,
			naturalHeight,
		)

		console.log('image natural width', naturalWidth)
		console.log('image natural height', naturalHeight)
		console.log('contain box values', values)

		// cropper.style.left = values.x + 'px'
		// cropper.style.top = values.y + 'px'
		// cropper.style.width = values.w + 'px'
		// cropper.style.height = values.h + 'px'
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
			// toast('Copied to clipboard')
			playShutterAudio()
		} catch {
			toast('An error has occured.')
		}
	}

	// async ocr() {
	// 	const {x1, y1, x2, y2} = cropper
	// 	const blob = await getCroppedImageBlob(this.imgElement, {
	// 		x: x1,
	// 		y: y1,
	// 		w: x2 - x1,
	// 		h: y2 - y1,
	// 	})
	// 	if (blob) {
	// 		const {createWorker, PSM} = await import('tesseract.js')
	// 		const worker = await createWorker(store.ocrLanguage)
	// 		worker.setParameters({
	// 			tessedit_pageseg_mode: PSM.AUTO,
	// 			// preserve_interword_spaces: '0',
	// 		})
	// 		const {data} = await worker.recognize(blob)
	// 		if (data && data.text) {
	// 			let {text} = data
	// 			if (store.ocrLanguage === 'jpn') {
	// 				text = text.replace(/\s+/g, '')
	// 			}
	// 			// toast(text)
	// 			return text
	// 		}
	// 	}
	// }

	#paddleOCR:
		| Awaited<
				ReturnType<typeof import('@paddleocr/paddleocr-js').PaddleOCR.create>
		  >
		| undefined
	async getPaddleOCR() {
		if (!this.#paddleOCR) {
			const {PaddleOCR} = await import('@paddleocr/paddleocr-js')
			this.#paddleOCR = await PaddleOCR.create({
				lang: 'japan',
				ocrVersion: 'PP-OCRv5',
			})
		}

		return this.#paddleOCR
	}

	#framedIndex = 0
	#framedTextItems: OcrResultItem[] = []

	async frameFoundText() {
		if (!this.#framedTextItems.length) {
			const ocr = await this.getPaddleOCR()
			const [result] = await ocr.predict(this.imgElement)
			if (result === undefined) {
				toast('No text found.')
				return
			}
			this.#framedTextItems = result.items
		}

		if (!this.#framedTextItems.length) return

		const item =
			this.#framedTextItems[this.#framedIndex % this.#framedTextItems.length]

		this.#framedIndex++

		cropper

		return item
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

		const {PaddleOCR} = await import('@paddleocr/paddleocr-js')
		const ocr = await PaddleOCR.create({
			lang: 'japan',
			ocrVersion: 'PP-OCRv5',
		})

		const [result] = await ocr.predict(blob)
		return result?.items.map((item) => item.text).join('\n')
	}
}
