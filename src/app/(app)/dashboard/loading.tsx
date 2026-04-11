import Loader, { MSGS } from "@/components/Loader";

export default function DashboardLoading() {
  return <Loader variant="page" messages={MSGS.dashboard} />;
}
