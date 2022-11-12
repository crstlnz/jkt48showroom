import ShowroomLog from "~/library/database/schema/showroom/ShowroomLog";
import { calculateFansPoints } from "../stats.get";
export default defineEventHandler(async (event) => {
  const data_id = event.context.params?.id;
  const data = await ShowroomLog.getDetails(data_id);
  const fansRank = calculateFansPoints(data.users, data.live_info?.stage_list ?? []);
  if (!data) throw createError({ statusMessage: "Data not found!", statusCode: 404 });
  return { ...data, fans: fansRank };
});
