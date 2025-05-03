import { data } from 'react-router';
import { generate } from 'namor/dist/generate';

export async function loader() {
	return data(generate({ words: 3 }));
}
