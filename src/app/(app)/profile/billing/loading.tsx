import Loader, { MSGS } from "@/components/Loader";

export default function BillingLoading() {
  return <Loader variant="page" messages={MSGS.billing} />;
}
