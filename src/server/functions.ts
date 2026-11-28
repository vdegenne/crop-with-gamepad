import {cropper} from '../cropper'
import {toast} from '../snackbar'
import {store} from '../store'

export function lockDefaultCropRegion() {
	store.defaultCropValues = {
		x1: cropper.x1,
		y1: cropper.y1,
		x2: cropper.x2,
		y2: cropper.y2,
	}
	toast({message: 'Crop values saved'})
}
