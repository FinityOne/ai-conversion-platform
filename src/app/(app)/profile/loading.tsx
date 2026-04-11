import Loader, { MSGS } from "@/components/Loader";

export default function ProfileLoading() {
  return <Loader variant="page" messages={MSGS.profile} />;
}
