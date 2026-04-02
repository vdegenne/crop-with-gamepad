import {type PropertyValues} from 'snar'
// import {toast} from 'toastit'

export function copyToClipboard(text: string | number) {
	navigator.clipboard.writeText(text + '')
	// TODO: be careful activating that if you share utils with server.
	// toast('Copied to clipboard.')
}

export function sleep(milli: number = 1000) {
	return new Promise((r) => setTimeout(r, milli))
}

export function preventDefault(event: Event) {
	event.preventDefault()
}
export function stopPropagation(event: Event) {
	event.stopPropagation()
}

/**
 * Re-dispatches an event from the provided element.
 *
 * This function is useful for forwarding non-composed events, such as `change`
 * events.
 *
 * @example
 * class MyInput extends LitElement {
 *   render() {
 *     return html`<input @change=${this.redispatchEvent}>`;
 *   }
 *
 *   protected redispatchEvent(event: Event) {
 *     redispatchEvent(this, event);
 *   }
 * }
 *
 * @param element The element to dispatch the event from.
 * @param event The event to re-dispatch.
 * @return Whether or not the event was dispatched (if cancelable).
 */
export function redispatchEvent(element: Element, event: Event) {
	// For bubbling events in SSR light DOM (or composed), stop their propagation
	// and dispatch the copy.
	if (event.bubbles && (!element.shadowRoot || event.composed)) {
		event.stopPropagation()
	}

	const copy = Reflect.construct(event.constructor, [event.type, event])
	const dispatched = element.dispatchEvent(copy)
	if (!dispatched) {
		event.preventDefault()
	}

	return dispatched
}

const eventOpts = {composed: true, bubbles: true}
export function getElementsTree(node: Element): Promise<Element[]> {
	return new Promise((resolve, _reject) => {
		function f(event: Event) {
			resolve(event.composedPath() as Element[])
			node.removeEventListener('get-elements-tree', f)
		}
		node.addEventListener('get-elements-tree', f)
		node.dispatchEvent(new Event('get-elements-tree', eventOpts))
	})
}
export async function getElementInTree(
	from: Element,
	condition: (element: Element) => boolean,
): Promise<Element | undefined> {
	for (const element of await getElementsTree(from)) {
		if (condition(element)) {
			return element
		}
	}
}

export function shuffleArray<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i]!, array[j]!] = [array[j]!, array[i]!]
	}
}

export async function generateHash(input: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(input)
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function random(min: number, max: number, decimal = 0): number {
	const random = Math.random() * (max - min) + min
	return parseFloat(random.toFixed(decimal))
}

export function saveDataToFile(data: string, filename: string): void {
	const blob = new Blob([data], {type: 'text/plain'})
	const link = document.createElement('a')
	link.download = filename
	link.href = URL.createObjectURL(blob)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

export async function loadDataFromFile(): Promise<string> {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input')
		input.type = 'file'

		input.onchange = () => {
			const file = input.files?.[0]
			if (!file) {
				reject(new Error('No file selected'))
				return
			}

			const reader = new FileReader()

			reader.onload = (event) => {
				const result = event.target?.result
				if (typeof result === 'string') {
					resolve(result)
				} else {
					reject(new Error('File read error: result is not a string'))
				}
			}

			reader.onerror = () => {
				reject(new Error('Error reading file'))
			}

			reader.readAsText(file)
		}

		input.click()
	})
}

export function propertyValuesToJson<T>(
	changed: PropertyValues<T>,
	object: T,
): Partial<T> {
	return Object.fromEntries(
		[...changed.keys()].map((key) => [key, object[key as keyof typeof object]]),
	) as Partial<T>
}

export function changeStyleProperty(cssVar: string, value: number | string) {
	document.documentElement.style.setProperty(`--${cssVar}`, value + '')
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.crossOrigin = 'anonymous' // prevent CORS taint if server allows
		img.onload = () => {
			if (img.naturalWidth === 0 || img.naturalHeight === 0) {
				reject(new Error('Image has zero dimensions'))
			} else {
				resolve(img)
			}
		}
		img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
		img.src = url
	})
}

export function roundFloat(value: number, decimals: number): number {
	const factor = 10 ** decimals
	return Math.round(value * factor) / factor
}

export function waitForTransition(element: HTMLElement) {
	return new Promise<void>((resolve) => {
		const handler = () => {
			element.removeEventListener('transitionend', handler)
			resolve()
		}
		element.addEventListener('transitionend', handler)
	})
}

export function createHighlightedHtml(
	input: string,
	search: string | string[],
): string {
	if (!search || (Array.isArray(search) && search.length === 0)) return input

	const esc = function (s: string): string {
		return s
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
	}

	const escapedInput = esc(input)

	// Normalize search to array of strings
	const keywords = Array.isArray(search)
		? search.filter(Boolean)
		: search.split(/\s+/).filter(Boolean)

	if (keywords.length === 0) return escapedInput

	// Escape regex characters in each keyword
	const escapedKeywords = keywords.map((k) =>
		k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
	)

	// Create a regex matching any keyword
	const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi')

	return escapedInput.replace(regex, '<span class="highlight">$1</span>')
}

export function loremIpsum(paragraphs: number = 1): string {
	const base =
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
		'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
		'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
		'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
		'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

	if (paragraphs <= 1) {
		return base
	}

	return Array(paragraphs).fill(base).join('\n\n')
}

/**
 * Returns a new reference
 */
export function removeObjectKeys(arr: any, keys: string[]) {
	const clone = {...arr}
	for (const key of keys) {
		delete clone[key]
	}
	return clone
}

export async function getBlobKey(blob: Blob) {
	const buf = await blob.slice(0, 64 * 1024).arrayBuffer()
	const hash = await crypto.subtle.digest('SHA-256', buf)
	return [...new Uint8Array(hash)].join('')
}

export async function getClipboardImage(): Promise<Blob | null> {
	const items = await navigator.clipboard.read()

	for (const item of items) {
		for (const type of item.types) {
			if (type.startsWith('image/')) {
				return await item.getType(type)
			}
		}
	}

	return null
}
function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('screenshot-db', 1)

		request.onupgradeneeded = () => {
			const db = request.result
			if (!db.objectStoreNames.contains('store')) {
				db.createObjectStore('store')
			}
		}

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}

export async function saveImageToDB(blob: Blob): Promise<void> {
	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction('store', 'readwrite')
		tx.objectStore('store').put(blob, 'lastScreenshot')

		tx.oncomplete = () => resolve()
		tx.onerror = () => reject(tx.error)
	})
}

export async function loadImageFromDB(): Promise<Blob | null> {
	const db = await openDB()

	return new Promise((resolve, reject) => {
		const tx = db.transaction('store', 'readonly')
		const req = tx.objectStore('store').get('lastScreenshot')

		req.onsuccess = () => resolve(req.result ?? null)
		req.onerror = () => reject(req.error)
	})
}
