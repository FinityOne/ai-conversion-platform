import Loader, { MSGS } from "@/components/Loader";

export default function LeadDetailLoading() {
  return <Loader variant="page" messages={MSGS.leadDetail} />;
}
