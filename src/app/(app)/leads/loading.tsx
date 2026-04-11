import Loader, { MSGS } from "@/components/Loader";

export default function LeadsLoading() {
  return <Loader variant="skeleton" messages={MSGS.leads} skeletonCount={5} />;
}
