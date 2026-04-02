import {type MdDialog} from '@material/web/dialog/dialog.js'

export async function makeDialogDraggable(dialogEl: MdDialog) {
	await dialogEl.updateComplete

	const shadowDialog = dialogEl.renderRoot.querySelector('dialog')
	if (!shadowDialog) return

	const handle = shadowDialog.querySelector<HTMLElement>('.headline')
	if (!handle) return

	handle.style.cursor = 'grab'

	let startX = 0
	let startY = 0
	let currentX = 0
	let currentY = 0
	let isDragging = false

	handle.addEventListener('mousedown', (e) => {
		isDragging = true
		handle.style.cursor = 'grabbing'
		startX = e.clientX
		startY = e.clientY
		e.preventDefault()
	})

	const onMouseMove = (e: MouseEvent) => {
		if (!isDragging) return
		const dx = e.clientX - startX
		const dy = e.clientY - startY
		shadowDialog.style.transform = `translate(${currentX + dx}px, ${currentY + dy}px)`
	}

	const onMouseUp = (e: MouseEvent) => {
		if (!isDragging) return
		const dx = e.clientX - startX
		const dy = e.clientY - startY
		currentX += dx
		currentY += dy
		isDragging = false
		handle.style.cursor = 'grab'
	}

	document.addEventListener('mousemove', onMouseMove)
	document.addEventListener('mouseup', onMouseUp)
}
