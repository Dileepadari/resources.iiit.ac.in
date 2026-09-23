import { z } from "zod";

export const RESOURCE_TYPES = [
  "NOTES",
  "SLIDES",
  "VIDEO",
  "ASSIGNMENT",
  "PAST_PAPER",
  "BOOK",
  "LINK",
];

export const RESOURCE_TYPE_LABELS = {
  NOTES: "Notes",
  SLIDES: "Slides",
  VIDEO: "Video",
  ASSIGNMENT: "Assignment",
  PAST_PAPER: "Past paper",
  BOOK: "Book",
  LINK: "Link",
};

const trimmed = (min, max, label) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

// Only http(s) is allowed. javascript: and data: URLs would otherwise be
// rendered as clickable links to every visitor.
const httpUrl = z
  .string({ error: "Link is required" })
  .trim()
  .max(2048, "Link must be at most 2048 characters")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Link must be a valid http or https URL");

export const registerSchema = z.object({
  name: trimmed(2, 80, "Name"),
  // Trim and lower-case *before* the format check, not after. `z.email().trim()`
  // reads as though it cleans the value first, and does the opposite: the
  // pattern runs on the raw string and the transform only applies to what
  // survives, so an address pasted with a trailing space was rejected as
  // invalid rather than tidied up.
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .max(160, "Email must be at most 160 characters")
    .pipe(z.email("Enter a valid email address")),
  password: trimmed(8, 128, "Password").regex(
    /^(?=.*[a-zA-Z])(?=.*\d).*$/,
    "Password must contain at least one letter and one number",
  ),
});

export const courseSchema = z.object({
  code: trimmed(2, 24, "Course code").transform((value) => value.toUpperCase()),
  name: trimmed(3, 120, "Course name"),
  description: trimmed(10, 2000, "Description"),
  instructor: z.string().trim().max(120).optional().or(z.literal("")),
  semester: z.string().trim().max(60).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
});

export const courseUpdateSchema = courseSchema.partial();

export const resourceSchema = z.object({
  title: trimmed(3, 160, "Title"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  url: httpUrl,
  type: z.enum(RESOURCE_TYPES).default("NOTES"),
});

export const resourceUpdateSchema = resourceSchema.partial();

/**
 * Flattens a ZodError into `{ field: message }` for form rendering.
 */
export function fieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ?? "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
