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

async function blobToBase64Async(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onerror = (e) => reject(fileReader.error);
		fileReader.onloadend = (e) => {
			const dataUrl = fileReader.result as string;
			// remove "data:mime/type;base64," prefix from data url
			const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
			resolve(base64);
		};
		fileReader.readAsDataURL(blob);
	});
}

export { resolvablePromise, getDataURLFromBlob, blobToBase64Async };
