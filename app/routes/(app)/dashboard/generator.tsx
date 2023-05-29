import { LoaderArgs, json } from "@remix-run/node";
import { generate } from "namor/dist/generate";

export async function loader({ params }: LoaderArgs) {
  return json(generate({ words: 3 }));
}
