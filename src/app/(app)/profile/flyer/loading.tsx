import Loader, { MSGS } from "@/components/Loader";

export default function FlyerLoading() {
  return <Loader variant="page" messages={["Loading your flyer…", "Getting your details…", "Almost ready…"]} />;
}
