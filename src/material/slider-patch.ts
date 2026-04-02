import {MdSlider} from '@material/web/slider/slider.js';
import {css} from 'lit';

// MdSlider.elementStyles.push(css`
// 	:host([persist]) .label {
// 		transform: scale(1);
// 	}
// `);

MdSlider.addInitializer(async (instance) => {
	await instance.updateComplete;
	if (instance.hasAttribute('persist-label')) {
		instance.renderRoot
			.querySelectorAll<HTMLElement>('.label')
			.forEach((label) => (label.style.transform = 'scale(1)'));
	}
});
