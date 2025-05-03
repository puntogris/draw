import { generate } from 'namor/dist/generate';

export async function loader() {
	return { name: generate({ words: 3 }) };
}
