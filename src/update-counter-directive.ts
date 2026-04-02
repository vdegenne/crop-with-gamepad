import {directive, Directive} from 'lit/directive.js';

class UpdateCountDirective extends Directive {
	count = 0;

	update() {
		this.count++;
		return this.render();
	}

	render() {
		return this.count;
	}
}

export const updateCount = directive(UpdateCountDirective);
