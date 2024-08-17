// Implementation from https://github.com/pieroxy/lz-string/blob/master/src/base64/base64-string.ts

interface Base64String {
	compress: (input: string) => string;
	decompress: (input: string) => string;
	_keyStr: string;
}

const Base64String: Base64String = {
	// private property
	_keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

	decompress: function (input: string): string {
		const output: string[] = [];
		let chr1: number, chr2: number, chr3: number;
		let enc1: number, enc2: number, enc3: number, enc4: number;
		let i: number = 1;
		const odd: number = input.charCodeAt(0) >> 8;

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

			output.push(this._keyStr.charAt(enc1));
			output.push(this._keyStr.charAt(enc2));
			output.push(this._keyStr.charAt(enc3));
			output.push(this._keyStr.charAt(enc4));
		}

		return output.join('');
	},

	compress: function (input: string) {
		let output: string[] | string = [];
		let ol = 1;
		let output_: number;
		let chr1: number, chr2: number, chr3: number;
		let enc1: number, enc2: number, enc3: number, enc4: number;
		let i: number = 0;
		let flush: boolean = false;

		input = input.replace(/[^A-Za-z0-9+/=]/g, '');

		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

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
				if (output_! === undefined) {
					throw new Error('Impossible output error 1');
				}
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
			if (output_! === undefined) {
				throw new Error('Impossible output error 1');
			}
			output.push(String.fromCharCode(output_));
			output = output.join('');
			output = String.fromCharCode(output.charCodeAt(0) | 256) + output.substring(1);
		} else {
			output = output.join('');
		}

		return output;
	}
};

export { Base64String };
