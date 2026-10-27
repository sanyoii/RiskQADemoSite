import { LegacyRedirect, redirectMetadata } from "../_redirect";

export const metadata = redirectMetadata;
export const dynamic = "force-static";

export default function Page() {
  return <LegacyRedirect from="/dashboard-demo/ac" />;
}
