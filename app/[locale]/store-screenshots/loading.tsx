import { cookies } from "next/headers";
import { StoreWorkspaceLoading } from "@/components/store-screenshots/StoreWorkspaceLoading";
import { STORE_PROJECT_HINT_COOKIE } from "@/lib/store-screenshots/storage";

export default async function Loading(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const hasSavedProject = cookieStore.get(STORE_PROJECT_HINT_COOKIE)?.value === "1";

  return <StoreWorkspaceLoading variant={hasSavedProject ? "editor" : "templates"} />;
}
