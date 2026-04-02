import type {TemplateResult} from 'lit-html'

interface Options {
	headline: string
	content: string | TemplateResult
}

function dialog(
	headline: string | TemplateResult,
	content: string | TemplateResult
) {
	return new Promise(async (resolve, reject) => {
		const {materialDialog} = await import('material-3-dialog')
		materialDialog({
			headline,
			content(dialog) {
				dialog.addEventListener('closed', () => {
					// resolve is called first on confirm so it's fine.
					reject()
				})
				return content
			},
			confirmButton(dialog) {
				resolve(dialog)
				dialog.close()
			},
		})
	})
}

export function confirm({
	headline = 'Are you sure?',
	content = 'Are you sure to perform this action?',
}: Partial<Options> = {}) {
	return function (
		_target: any,
		_propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		import('./material/dialog-patch.js')
		const originalMethod = descriptor.value
		descriptor.value = async function (...args: any[]) {
			try {
				await dialog(headline, content)
			} catch {
				// Canceled just ignore
				return
			}
			return originalMethod.apply(this, args)
		}
		return descriptor
	}
}
