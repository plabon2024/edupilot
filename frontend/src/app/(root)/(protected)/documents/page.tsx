"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Trash2,
  BrainCircuit,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Inbox,
  ChevronRight,
  X,
  FilePlus,
  AlertCircle,
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/v1";

interface Document {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: "PROCESSING" | "READY" | "FAILED";
  flashcardCount: number;
  quizCount: number;
  uploadDate: string;
  lastAccessed?: string;
}

const STATUS_CONFIG = {
  READY: {
    label: "Ready",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
  },
};

function formatFileSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/documents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDocuments(res.data.data || []);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;
    setUploading(true);
    setUploadError(null);
    try {
      // 1. Get Signature from backend
      const sigRes = await axios.get(`${API_BASE}/documents/upload-signature`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const { signature, timestamp, cloudName, apiKey } = sigRes.data.data;

      // 2. Upload file directly to Cloudinary
      const cloudinaryForm = new FormData();
      cloudinaryForm.append("file", uploadFile);
      cloudinaryForm.append("signature", signature);
      cloudinaryForm.append("timestamp", timestamp.toString());
      cloudinaryForm.append("api_key", apiKey);
      cloudinaryForm.append("folder", "documents");

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        cloudinaryForm
      );
      
      const cloudinaryData = uploadRes.data;

      // 3. Send metadata to our backend
      await axios.post(`${API_BASE}/documents/upload`, {
        title: uploadTitle.trim(),
        fileName: uploadFile.name,
        fileSize: cloudinaryData.bytes,
        cloudinaryPublicId: cloudinaryData.public_id,
        filePath: cloudinaryData.secure_url,
      }, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setShowUpload(false);
      setUploadTitle("");
      setUploadFile(null);
      fetchDocuments();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error?.message || err.response?.data?.message || err.response?.data?.error || "Upload failed.";
        setUploadError(msg);
      } else {
        setUploadError("Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document? This removes all associated flashcards and quizzes.")) return;
    setDeleting(id);
    try {
      await axios.delete(`${API_BASE}/documents/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to delete document.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <FileText className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
              <p className="text-sm text-muted-foreground">
                Upload PDFs and generate study materials with AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocuments}
              disabled={loading}
              id="refresh-docs-btn"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              size="sm"
              onClick={() => setShowUpload(true)}
              id="upload-doc-btn"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            >
              <FilePlus className="size-4" />
              Upload PDF
            </Button>
          </div>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="size-4" />
                    Upload Document
                  </CardTitle>
                  <button
                    onClick={() => { setShowUpload(false); setUploadError(null); setUploadFile(null); setUploadTitle(""); }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                    id="close-upload-modal"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <CardDescription>Upload a PDF to generate flashcards and quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="doc-title">
                      Document Title
                    </label>
                    <input
                      id="doc-title"
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Biology Chapter 5"
                      required
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="doc-file">
                      PDF File
                    </label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10 ${
                        uploadFile ? "border-blue-400 bg-blue-50/30 dark:bg-blue-950/10" : "border-border/60"
                      }`}
                    >
                      <FileText className={`size-8 ${uploadFile ? "text-blue-500" : "text-muted-foreground/50"}`} />
                      <p className="text-sm text-center">
                        {uploadFile ? (
                          <span className="font-medium text-blue-600 dark:text-blue-400">{uploadFile.name}</span>
                        ) : (
                          <span className="text-muted-foreground">
                            Click to select a PDF file
                          </span>
                        )}
                      </p>
                      {uploadFile && (
                        <p className="text-xs text-muted-foreground">{formatFileSize(uploadFile.size)}</p>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      id="doc-file"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  {uploadError && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      {uploadError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button type="submit" disabled={uploading || !uploadFile || !uploadTitle.trim()} className="flex-1" id="submit-upload-btn">
                      {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                      {uploading ? "Uploading…" : "Upload"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowUpload(false); setUploadError(null); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Documents List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-border/50 bg-muted/40" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No documents yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your first PDF to start generating study materials.
                </p>
              </div>
              <Button onClick={() => setShowUpload(true)} id="upload-first-doc-btn">
                <FilePlus className="size-4" />
                Upload your first PDF
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, i) => {
              const status = STATUS_CONFIG[doc.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={doc.id}
                  id={`doc-card-${i}`}
                  className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  style={{ animation: `fadeInUp 0.35s ease-out ${i * 50}ms both` }}
                >
                  {/* Left */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200/50 dark:border-blue-800/30">
                      <FileText className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{doc.title}</p>
                        <Badge variant="outline" className={status.className}>
                          <StatusIcon className={`size-3 ${doc.status === "PROCESSING" ? "animate-spin" : ""}`} />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {doc.fileName} · {formatFileSize(doc.fileSize)} ·{" "}
                        {new Date(doc.uploadDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="size-3" />
                          {doc.flashcardCount} flashcard sets
                        </span>
                        <span className="flex items-center gap-1">
                          <BrainCircuit className="size-3" />
                          {doc.quizCount} quizzes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      id={`delete-doc-${i}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      asChild
                      id={`open-doc-${i}`}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                    >
                      <Link href={`/documents/${doc.id}`}>
                        Open
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
