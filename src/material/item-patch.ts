import {MdItem} from '@material/web/labs/item/item.js';
import {css} from 'lit';

MdItem.elementStyles.push(css`
	:host,
	.text,
	.default-slot,
	.text ::slotted(*),
	[name='start']::slotted(*) {
		overflow: initial;
	}
`);
