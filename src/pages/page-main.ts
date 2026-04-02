import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query, state} from 'lit/decorators.js'
import toast from 'toastit'
import {store} from '../store.js'
import {
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

	@query('img') imgElement!: HTMLImageElement

	constructor() {
		super()
		main = this
	}

	render() {
		return html`<!---->
			${this.blobUrl
				? html`<!-- -->
						<div class="fixed inset-0 -bg-green-500">
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
		const db = await loadImageFromDB()

		if (!clipboard && !db) {
			toast('No image found.')
			return
		}

		let imgBlob = clipboard! ?? db!
		let source: 'clipboard' | 'db' = clipboard ? 'clipboard' : 'db'

		if (clipboard && db) {
			const [a, b] = await Promise.all([getBlobKey(clipboard), getBlobKey(db)])

			if (a === b) {
				imgBlob = db
				source = 'db'
			} else {
				imgBlob = clipboard
				source = 'clipboard'
			}
		}

		const key = await getBlobKey(imgBlob)

		if (this.lastImageKey === key) {
			toast('Same image, no reload')
			return
		}

		this.lastImageKey = key

		const newImage = source === 'clipboard'

		this.blobUrl = URL.createObjectURL(imgBlob)

		await this.updateComplete
		await this.imgElement.decode()

		if (newImage) {
			console.log('Nouvelle image, reset values')
			saveImageToDB(imgBlob)

			const naturalWidth = this.imgElement.naturalWidth
			const naturalHeight = this.imgElement.naturalHeight
			cropper.x1 = 0
			cropper.y1 = 0
			cropper.x2 = naturalWidth
			cropper.y2 = naturalHeight
			cropper.bounds = {w: naturalWidth, h: naturalHeight}
		}

		toast(`Image from ${source}`)
	}
}
