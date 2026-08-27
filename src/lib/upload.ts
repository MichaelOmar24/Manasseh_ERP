import { supabase } from "@/integrations/supabase/client";

const CV_BUCKET = "cvs";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXT = ["pdf", "doc", "docx"];

export function validateCv(file: File): string | null {
  if (file.size > MAX_SIZE) {
    return "File is too large. Maximum size is 10 MB.";
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) {
    return "Unsupported file type. Please upload a PDF or Word document (PDF, DOC, DOCX).";
  }
  if (file.type && !ALLOWED_MIME.includes(file.type)) {
    return "Unsupported file type. Please upload a PDF or Word document (PDF, DOC, DOCX).";
  }
  return null;
}

/**
 * Upload a CV to Enter Cloud Storage and return the storage path (e.g. cvs/xxxx.pdf).
 */
export async function uploadCv(file: File): Promise<string> {
  const err = validateCv(file);
  if (err) throw new Error(err);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const path = `cvs/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(CV_BUCKET)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw error;
  return path;
}

/**
 * Resolve a CV reference to a viewable URL. Storage paths (cvs/...) are
 * converted to short-lived signed URLs for staff; external URLs pass through.
 */
export async function cvUrlToLink(reference: string | null): Promise<string | null> {
  if (!reference) return null;
  if (reference.startsWith("cvs/")) {
    const { data, error } = await supabase.storage
      .from(CV_BUCKET)
      .createSignedUrl(reference, 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }
  return reference;
}
