import animate from './animate'
import sequence from './sequence'

import { requestAnimationFrame } from '../../polyfills/requestAnimationFrame'
import { getGeometry, getScrolled, isElementVisible } from '../../utils/core'
import { each } from '../../utils/generic'

export default function delegate (event = { type: 'init' }, elements = this.store.elements) {
	requestAnimationFrame(() => {
		const stale = event.type === 'init' || event.type === 'resize'

		each(this.store.containers, container => {
			if (stale) {
				container.geometry = getGeometry.call(this, container, true)
			}
			const scroll = getScrolled.call(this, container)
			if (container.scroll) {
				container.direction = {
					x: Math.sign(scroll.left - container.scroll.left),
					y: Math.sign(scroll.top - container.scroll.top),
				}
			}
			container.scroll = scroll
		})

		/**
		 * Due to how the sequencer is implemented, it’s
		 * important that we update the state of all
		 * elements, before any animation logic is
		 * evaluated (in the second loop below).
		 */
		each(elements, element => {
			if (stale) {
				element.geometry = getGeometry.call(this, element)
			}
			element.visible = isElementVisible.call(this, element)
		})

		each(elements, element => {
			if (element.sequence) {
				sequence.call(this, element)
			} else {
				animate.call(this, element)
			}
		})

		this.pristine = false
	})
}
