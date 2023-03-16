import { ClientOnly } from "remix-utils";
import Draw from "~/components/draw.client";

export default function Index() {
  return (
    <ClientOnly fallback={<></>}>
      {() => <Draw id={""} />}
    </ClientOnly>
  );
}
