import UpdateRunner from "$lib/server/update-runner";

const runner = new UpdateRunner();

export async function GET({ url }) {
  let queryParams = url.searchParams;
  let tag = queryParams.get("tag");
  if (!tag) {
    throw new Error("tag is required");
  }
  let taskId = runner.GetTaskId(tag);
  return Response.json({ taskId });
}
