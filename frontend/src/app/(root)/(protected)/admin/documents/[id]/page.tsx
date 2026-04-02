'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/admin.services';
import { AdminDocument } from '@/types/admin.types';
import {
  ArrowLeft, FileText, Calendar, HardDrive,
  User, Trash2, XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function formatBytes(bytes?: number) {
  if (!bytes) return 'N/A';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function DocStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    PROCESSED:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    FAILED:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    PENDING:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

export default function AdminDocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doc,       setDoc]       = useState<AdminDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    adminAPI.getDocumentById(params.id)
      .then(res => setDoc(res.data.data))
      .catch(() => setError('Document not found.'))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-b-2 border-violet-600 animate-spin" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="font-medium">{error || 'Document not found.'}</p>
        <Button variant="outline" onClick={() => router.push('/admin/documents')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Documents
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this document? This removes it from the user's AI knowledge base.")) return;
    setBusy(true);
    try {
      await adminAPI.deleteDocument(doc.id);
      router.push('/admin/documents');
    } catch {
      setError('Failed to delete document.');
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">

      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/documents')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Documents
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight truncate">{doc.title || doc.fileName || 'Untitled Document'}</h1>
            <p className="text-muted-foreground text-xs font-mono mt-0.5">{doc.id}</p>
          </div>
        </div>
      </div>

      {/* Status chip */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Processing Status:</span>
        <DocStatusBadge status={doc.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: <FileText className="w-4 h-4 text-violet-500" />,          label: 'File Name',   value: doc.fileName || '—' },
          { icon: <HardDrive className="w-4 h-4 text-blue-500" />,           label: 'File Size',   value: formatBytes(doc.fileSize) },
          { icon: <FileText className="w-4 h-4 text-indigo-400" />,          label: 'File Type',   value: doc.fileType || '—' },
          { icon: <User className="w-4 h-4 text-orange-500" />,              label: 'Owner ID',    value: <span className="font-mono text-xs break-all">{doc.userId}</span> },
          { icon: <Calendar className="w-4 h-4 text-muted-foreground" />,    label: 'Uploaded At', value: new Date(doc.createdAt).toLocaleString() },
          { icon: <Calendar className="w-4 h-4 text-muted-foreground" />,    label: 'Updated At',  value: new Date(doc.updatedAt).toLocaleString() },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl">
            <div className="mt-0.5">{icon}</div>
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-1">{label}</p>
              <div className="text-sm font-medium">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-base">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Deleting this document will permanently remove it from the user's AI knowledge base and cannot be undone.
          </p>
          <Button
            variant="destructive" className="w-full" disabled={busy}
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Document
          </Button>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </CardContent>
      </Card>

    </div>
  );
}
