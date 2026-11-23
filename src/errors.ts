export async function handleAsync<T>(
	promise: Promise<T>,
	onError?: (error: unknown) => void,
): Promise<T | undefined> {
	try {
		return await promise
	} catch (error) {
		// console.error(error)
		onError?.(error)
		return undefined
	}
}
