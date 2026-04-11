import Loader, { MSGS } from "@/components/Loader";

export default function CalendarLoading() {
  return <Loader variant="page" messages={MSGS.calendar} />;
}
