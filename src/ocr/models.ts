const CACHE_NAME = 'paddleocr-models-v1'

const MODEL_URLS = {
	detection:
		'https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/PP-OCRv6_small_det_onnx_infer.tar',
	recognition:
		'https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/PP-OCRv6_small_rec_onnx_infer.tar',
} as const

export type OcrModelName = keyof typeof MODEL_URLS

export interface OcrModelProgress {
	stage: 'cached' | 'downloading' | 'downloaded'
	model: OcrModelName
	loaded: number
	total?: number
}

export interface OcrModelAssets {
	detectionUrl: string
	recognitionUrl: string
	release(): void
}

type ProgressCallback = (progress: OcrModelProgress) => void

function reportProgress(
	callback: ProgressCallback | undefined,
	progress: OcrModelProgress,
) {
	try {
		callback?.(progress)
	} catch {
		// Progress reporting must not interrupt model loading.
	}
}

async function downloadModel(
	model: OcrModelName,
	onProgress?: ProgressCallback,
): Promise<Blob> {
	const url = MODEL_URLS[model]
	const request = new Request(url)

	let cache: Cache | undefined

	try {
		cache = await globalThis.caches.open(CACHE_NAME)
	} catch {
		// Cache Storage may be unavailable or disabled.
	}

	if (cache) {
		try {
			const cachedResponse = await cache.match(request)

			if (cachedResponse) {
				const blob = await cachedResponse.blob()

				if (blob.size > 0) {
					reportProgress(onProgress, {
						stage: 'cached',
						model,
						loaded: blob.size,
						total: blob.size,
					})

					return blob
				}

				await cache.delete(request)
			}
		} catch {
			// Ignore cache errors and download the model again.
		}
	}

	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`Failed to download ${model}: HTTP ${response.status}`)
	}

	const contentLength = Number(response.headers.get('content-length'))
	const total =
		Number.isFinite(contentLength) && contentLength > 0
			? contentLength
			: undefined

	reportProgress(onProgress, {
		stage: 'downloading',
		model,
		loaded: 0,
		total,
	})

	let blob: Blob

	if (!response.body) {
		blob = await response.blob()

		reportProgress(onProgress, {
			stage: 'downloaded',
			model,
			loaded: blob.size,
			total: total ?? blob.size,
		})
	} else {
		const reader = response.body.getReader()
		const chunks: BlobPart[] = []
		let loaded = 0

		try {
			while (true) {
				const {done, value} = await reader.read()

				if (done) break

				chunks.push(value as BlobPart)
				loaded += value.byteLength

				reportProgress(onProgress, {
					stage: 'downloading',
					model,
					loaded,
					total,
				})
			}
		} finally {
			reader.releaseLock()
		}

		blob = new Blob(chunks)

		reportProgress(onProgress, {
			stage: 'downloaded',
			model,
			loaded: blob.size,
			total: total ?? blob.size,
		})
	}

	if (blob.size === 0) {
		throw new Error(`Downloaded model ${model} is empty.`)
	}

	if (cache) {
		try {
			await cache.put(request, new Response(blob))
		} catch {
			// Model remains usable even if persistent caching fails.
		}
	}

	return blob
}

export async function getOcrModelAssets(
	onProgress?: ProgressCallback,
): Promise<OcrModelAssets> {
	const [detection, recognition] = await Promise.all([
		downloadModel('detection', onProgress),
		downloadModel('recognition', onProgress),
	])

	const detectionUrl = URL.createObjectURL(detection)
	const recognitionUrl = URL.createObjectURL(recognition)

	return {
		detectionUrl,
		recognitionUrl,

		release() {
			URL.revokeObjectURL(detectionUrl)
			URL.revokeObjectURL(recognitionUrl)
		},
	}
}
