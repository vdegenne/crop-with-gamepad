export class AudioLooper {
	private audio: HTMLAudioElement
	private loopStart: number
	private loopEnd: number
	private isLooping: boolean = false
	private isStopping: boolean = false
	private intervalId?: number

	constructor(src: string, loopStart: number, loopEnd: number) {
		this.audio = new Audio(src)
		this.loopStart = loopStart
		this.loopEnd = loopEnd
	}

	start() {
		this.isLooping = true
		this.isStopping = false

		this.audio.currentTime = 0
		this.audio.play()

		this.intervalId = window.setInterval(() => {
			if (!this.isLooping) return

			if (this.audio.currentTime >= this.loopEnd) {
				if (this.isStopping) {
					this.isLooping = false
					this.isStopping = false
					window.clearInterval(this.intervalId)
					this.intervalId = undefined
					return
				}
				this.audio.currentTime = this.loopStart
			}
		}, 10) // check every 10ms
	}

	stop() {
		this.isStopping = true
	}
}
