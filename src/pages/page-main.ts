import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query, state} from 'lit/decorators.js'
import toast from 'toastit'
import {store} from '../store.js'
import {
	computeContainBox,
	copyCroppedImageToClipboard,
	getBlobKey,
	getClipboardImage,
	loadImageFromDB,
	saveImageToDB,
} from '../utils.js'
import {PageElement} from './PageElement.js'
import {cropper} from '../cropper.js'

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
		return html`<!---->
			${this.blobUrl
				? html`<!-- -->
						<div
							id="container"
							class="fixed inset-0 bg-(--md-sys-color-primary)"
						>
							<img
								src=${this.blobUrl}
								class="absolute inset-0 w-full h-full object-contain"
							/>
							${cropper}
						</div>
						<!-- -->`
				: null}
			<!----> `
	}

	protected firstUpdated() {
		this.loadImage()
		window.addEventListener('paste', () => this.loadImage())
	}

	private lastImageKey: string | null = null

	async loadImage() {
		let clipboard = await getClipboardImage()
		console.log(`Clipboard image ?`, clipboard)
		const db = await loadImageFromDB()

		if (!clipboard && !db) {
			toast('No image found.')
			return
		}

		let imgBlob = clipboard! ?? db!
		let source: 'clipboard' | 'db' = clipboard ? 'clipboard' : 'db'
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

		console.log(`[choosen target source]`, source)
		const key = await getBlobKey(imgBlob)
		console.log('--- target img blob key ---')
		console.log(key)
		console.log('--- last blob key (ID) ---')
		console.log(this.lastImageKey)

		if (key === this.lastImageKey) {
			console.log('Same keys, aborting.')
			toast('Same images')
			return
		}
		this.lastImageKey = key

		const newImage = source === 'clipboard'

		this.blobUrl = URL.createObjectURL(imgBlob)

		await this.updateComplete
		await this.imgElement.decode()

		const naturalWidth = this.imgElement.naturalWidth
		const naturalHeight = this.imgElement.naturalHeight

		this.computeContainBox()
		window.addEventListener('resize', () => this.computeContainBox())

		if (newImage) {
			console.log('Nouvelle image, reset values')
			saveImageToDB(imgBlob)

			cropper.x1 = 0
			cropper.y1 = 0
			cropper.x2 = naturalWidth
			cropper.y2 = naturalHeight
			cropper.bounds = {w: naturalWidth, h: naturalHeight}
		}

		toast(`Image from ${source}`)
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

		cropper.style.left = values.x + 'px'
		cropper.style.top = values.y + 'px'
		cropper.style.width = values.w + 'px'
		cropper.style.height = values.h + 'px'
	}

	copyCroppedImageInClipboard() {
		if (!this.imgElement) return

		const {x1, y1, x2, y2} = cropper

		try {
			copyCroppedImageToClipboard(this.imgElement, {
				x: x1,
				y: y1,
				w: x2 - x1,
				h: y2 - y1,
			})
			toast('Copied to clipboard')
		} catch {
			toast('An error has occured.')
		}
	}
}
