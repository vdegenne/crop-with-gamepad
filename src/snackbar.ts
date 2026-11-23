import '@material/web/labs/gb/components/snackbar/md-gb-snackbar.js'

import type {SnackbarElement} from '@material/web/labs/gb/components/snackbar/snackbar-element.js'

export interface ToastOptions {
	message: string
	actionLabel?: string
	hasCloseButton?: boolean
	closeLabel?: string
	timeoutMs?: number
	fixed?: boolean
	quick?: boolean
	onAction?: () => void
	onClose?: (reason: string) => void
}

let snackbar: SnackbarElement | null = null

function getSnackbar() {
	if (!snackbar) {
		snackbar = document.createElement('md-gb-snackbar') as SnackbarElement
		document.body.append(snackbar)
	}

	return snackbar
}

export function toast(options: ToastOptions) {
	const snackbar = getSnackbar()

	snackbar.labelText = options.message
	snackbar.actionLabel = options.actionLabel ?? ''
	snackbar.hasCloseButton = options.hasCloseButton ?? false
	snackbar.closeLabel = options.closeLabel ?? 'Close'
	snackbar.timeoutMs = options.timeoutMs ?? 5000
	snackbar.fixed = options.fixed ?? true
	snackbar.quick = options.quick ?? false

	snackbar.addEventListener(
		'close',
		function (event) {
			const reason = (event as CustomEvent<{reason: string}>).detail.reason
			options.onClose?.(reason)
		},
		{once: true},
	)

	if (options.onAction) {
		snackbar.addEventListener(
			'click',
			function (event) {
				const target = event.target as HTMLElement
				if (target.closest('[slot="action"]')) {
					options.onAction?.()
				}
			},
			{once: true},
		)
	}

	return snackbar.show()
}
