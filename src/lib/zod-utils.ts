import { ZodError } from "zod";

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}
