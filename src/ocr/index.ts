import type {OcrResultItem} from '@paddleocr/paddleocr-js'
import {AvailableOcrLanguages} from '../lang.js'
import {toast} from '../snackbar.js'
import {sleep} from '../utils.js'
import {getOcrModelAssets, type OcrModelProgress} from './models.js'

export const unimplementedOcrLanguages = ['grc'] as const

export type OcrProgress =
	OcrModelProgress | {stage: 'initializing'} | {stage: 'ready'}

type PaddleOCRInstance = Awaited<
	ReturnType<typeof import('@paddleocr/paddleocr-js').PaddleOCR.create>
>

export class OCR {
	#language: AvailableOcrLanguages
	#languageGeneration = 0

	#paddleOCR: PaddleOCRInstance | undefined
	#paddleOCRPromise: Promise<PaddleOCRInstance> | undefined

	#framedIndex = 0
	#framedTextItems: OcrResultItem[] | undefined
	#frames: OcrResultItem[] | undefined
	#framesMergeDistance: number | undefined

	onProgress?: (progress: OcrProgress) => void

	constructor(language: AvailableOcrLanguages) {
		this.#language = language
	}

	setLanguage(language: AvailableOcrLanguages) {
		if (this.#language === language) return

		this.#language = language
		this.#languageGeneration++

		this.#paddleOCR = undefined
		this.#paddleOCRPromise = undefined

		this.#framedIndex = 0
		this.#framedTextItems = undefined
		this.#frames = undefined
		this.#framesMergeDistance = undefined
	}

	async createPaddleOCR(language: AvailableOcrLanguages, generation: number) {
		const assets = await getOcrModelAssets((progress) => {
			if (generation === this.#languageGeneration) {
				this.onProgress?.(progress)
			}
		})

		try {
			if (generation === this.#languageGeneration) {
				this.onProgress?.({stage: 'initializing'})
			}

			const {PaddleOCR} = await import('@paddleocr/paddleocr-js')

			return await PaddleOCR.create({
				lang: language,
				ocrVersion: 'PP-OCRv6',

				textDetectionModelName: 'PP-OCRv6_small_det',
				textDetectionModelAsset: {
					url: assets.detectionUrl,
				},

				textRecognitionModelName: 'PP-OCRv6_small_rec',
				textRecognitionModelAsset: {
					url: assets.recognitionUrl,
				},
			})
		} finally {
			assets.release()
		}
	}

	async getPaddleOCR() {
		if (this.#language === 'grc') {
			toast({
				message: `OCR language "${this.#language}" is not implemented.`,
			})
			return
		}

		if (this.#paddleOCR) return this.#paddleOCR

		const language = this.#language
		const generation = this.#languageGeneration

		let promise = this.#paddleOCRPromise

		if (!promise) {
			promise = this.createPaddleOCR(language, generation)
			this.#paddleOCRPromise = promise
		}

		try {
			const ocr = await promise

			if (generation !== this.#languageGeneration) return

			this.#paddleOCR = ocr
			this.onProgress?.({stage: 'ready'})

			return ocr
		} catch (error) {
			console.error("Couldn't create paddleOCR:", error)

			if (generation === this.#languageGeneration) {
				toast({message: "Couldn't create paddleOCR"})
			}
		} finally {
			if (this.#paddleOCRPromise === promise) {
				this.#paddleOCRPromise = undefined
			}
		}
	}

	async loadFrames(
		image: HTMLImageElement,
		{
			mergeDistance = 20,
		}: {
			mergeDistance?: number
		} = {},
	) {
		if (!this.#framedTextItems) {
			try {
				const ocr = await this.getPaddleOCR()
				if (!ocr) return

				toast({message: 'Analyzing, please wait...'})
				await sleep(100)
				const [result] = await ocr.predict(image)
				this.#framedTextItems = result?.items ?? []
			} catch {
				toast({message: 'Failed to load OCR.'})
				return
			}
		}

		if (!this.#framedTextItems.length) {
			toast({message: 'No text found.'})
			return
		}

		if (this.#frames && this.#framesMergeDistance === mergeDistance) {
			return this.#frames
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

		this.#frames = items
		this.#framesMergeDistance = mergeDistance

		return this.#frames
	}

	async nextFrame(image: HTMLImageElement, padding = 15) {
		const frames = await this.loadFrames(image)

		if (!frames) return

		const item = frames[this.#framedIndex % frames.length]

		if (!item) return

		this.#framedIndex++

		const xs = item.poly.map(([x]) => x)
		const ys = item.poly.map(([, y]) => y)

		return {
			x1: Math.min(...xs) - padding,
			y1: Math.min(...ys) - padding,
			x2: Math.max(...xs) + padding,
			y2: Math.max(...ys) + padding,
		}
	}

	getFrameText() {
		const frames = this.#frames
		if (!frames) return

		return frames[this.#framedIndex - 1]?.text
	}

	async recognize(blob: Blob) {
		try {
			const ocr = await this.getPaddleOCR()
			if (!ocr) return

			const [result] = await ocr.predict(blob)

			if (result === undefined) {
				toast({message: 'No text found.'})
				return
			}

			return result.items.map((item) => item.text).join('\n')
		} catch {
			toast({message: 'Something went wrong'})
		}
	}
}
