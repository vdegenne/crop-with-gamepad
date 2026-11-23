import {AudioPlayer} from '@vdegenne/audio-player'
import {VoicevoxProxyClient} from '@vdegenne/voicevox'
import {handleAsync} from './errors.js'
import {AvailableOcrLanguages} from './lang.js'
import {toast} from './snackbar.js'
import {store} from './store.js'

export const voicevoxProxy = new VoicevoxProxyClient({
	endpoint: 'http://127.0.0.1:50021',
})

export const ttsPlayer = new AudioPlayer(
	async (input: string, lang: AvailableOcrLanguages) => {
		// Other TTS

		switch (lang) {
			case 'japan':
				voicevoxProxy.getVoiceById(store.voicevoxVoiceId).then((voice) =>
					toast({
						message: voice!.name,
					}),
				)
				return voicevoxProxy.createAudioRequest({
					input,
					speaker: store.voicevoxVoiceId,
				})
		}

		return {} as any
	},
)

export async function playTTS(text: string, lang: AvailableOcrLanguages) {
	const {playPromise} = ttsPlayer.play([text, lang], {volume: 1})

	return handleAsync(playPromise, function (error) {
		toast({
			message: error instanceof Error ? error.message : String(error),
			actionLabel: 'Close',
		})
		console.error('TTS playback failed:', error)
	})
}

export async function setVoicevoxRandomVoice() {
	const voices = await voicevoxProxy.getVoices()

	if (voices.length === 0) {
		throw new Error('No VOICEVOX voices available')
	}

	const randomVoice = voices[Math.floor(Math.random() * voices.length)]!
	store.voicevoxVoiceId = randomVoice.id

	const voice = voices.find((voice) => voice.id === store.voicevoxVoiceId)

	if (!voice) {
		throw new Error(`VOICEVOX voice not found: ${store.voicevoxVoiceId}`)
	}

	return voice.name
}
