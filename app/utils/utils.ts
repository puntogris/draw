import { ResolvablePromise } from '@excalidraw/excalidraw/types/utils';

const resolvablePromise = <T>() => {
	let resolve!: any;
	let reject!: any;
	const promise = new Promise((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});
	(promise as any).resolve = resolve;
	(promise as any).reject = reject;
	return promise as ResolvablePromise<T>;
};

async function getDataURLFromBlob(blob: Blob) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onerror = (e) => reject(fileReader.error);
		fileReader.onloadend = (e) => {
			resolve(fileReader.result);
		};
		fileReader.readAsDataURL(blob);
	});
}

export { resolvablePromise, getDataURLFromBlob };
