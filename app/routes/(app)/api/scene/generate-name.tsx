import { json } from "@remix-run/node";
import { generate } from "namor/dist/generate";

export async function loader() {
  return json(generate({ words: 3 }));
}
