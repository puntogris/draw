const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function compress(input) {
	var output = [],
		ol = 1,
		output_,
		chr1,
		chr2,
		chr3,
		enc1,
		enc2,
		enc3,
		enc4,
		i = 0,
		flush = false;

	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

	while (i < input.length) {
		enc1 = keyStr.indexOf(input.charAt(i++));
		enc2 = keyStr.indexOf(input.charAt(i++));
		enc3 = keyStr.indexOf(input.charAt(i++));
		enc4 = keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		if (ol % 2 == 0) {
			output_ = chr1 << 8;
			flush = true;

			if (enc3 != 64) {
				output.push(String.fromCharCode(output_ | chr2));
				flush = false;
			}
			if (enc4 != 64) {
				output_ = chr3 << 8;
				flush = true;
			}
		} else {
			output.push(String.fromCharCode(output_ | chr1));
			flush = false;

			if (enc3 != 64) {
				output_ = chr2 << 8;
				flush = true;
			}
			if (enc4 != 64) {
				output.push(String.fromCharCode(output_ | chr3));
				flush = false;
			}
		}
		ol += 3;
	}

	if (flush) {
		output.push(String.fromCharCode(output_));
		output = output.join('');
		output = String.fromCharCode(output.charCodeAt(0) | 256) + output.substring(1);
	} else {
		output = output.join('');
	}

	return output;
}

export function decompress(input) {
	var output = [];
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 1;
	var odd = input.charCodeAt(0) >> 8;

	while (i < input.length * 2 && (i < input.length * 2 - 1 || odd == 0)) {
		if (i % 2 == 0) {
			chr1 = input.charCodeAt(i / 2) >> 8;
			chr2 = input.charCodeAt(i / 2) & 255;
			if (i / 2 + 1 < input.length) chr3 = input.charCodeAt(i / 2 + 1) >> 8;
			else chr3 = NaN;
		} else {
			chr1 = input.charCodeAt((i - 1) / 2) & 255;
			if ((i + 1) / 2 < input.length) {
				chr2 = input.charCodeAt((i + 1) / 2) >> 8;
				chr3 = input.charCodeAt((i + 1) / 2) & 255;
			} else chr2 = chr3 = NaN;
		}
		i += 3;

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2) || (i == input.length * 2 + 1 && odd)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3) || (i == input.length * 2 && odd)) {
			enc4 = 64;
		}

		output.push(keyStr.charAt(enc1));
		output.push(keyStr.charAt(enc2));
		output.push(keyStr.charAt(enc3));
		output.push(keyStr.charAt(enc4));
	}

	return output.join('');
}

export async function blobToBase64Async(blob) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onerror = (e) => reject(fileReader.error);
		fileReader.onloadend = (e) => {
			const dataUrl = fileReader.result;
			// remove "data:mime/type;base64," prefix from data url
			const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
			resolve(base64);
		};
		fileReader.readAsDataURL(blob);
	});
}
