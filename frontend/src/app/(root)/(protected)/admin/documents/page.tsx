'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { adminAPI, DocumentQueryParams } from '@/services/admin.services';
import { AdminDocument } from '@/types/admin.types';
import {
  FileText, Trash2, FolderOpen, Search, Filter, ChevronDown,
  RefreshCw, X, Eye, HardDrive, Calendar, User,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

// ── Status Badge ──────────────────────────────────────────────────────────────
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

function formatBytes(bytes?: number) {
  if (!bytes) return 'N/A';
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DocumentDetailModal({
  doc,
  onClose,
  onDelete,
}: {
  doc: AdminDocument;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this document? This affects the user's AI knowledge base.")) return;
    setLoading(true);
    try { await onDelete(doc.id); onClose(); }
    finally { setLoading(false); }
  };

  const field = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-background border border-border/60 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{doc.title || doc.fileName || 'Untitled'}</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{doc.id}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <DocStatusBadge status={doc.status} />
        </div>

        {/* Info */}
        <div className="space-y-2">
          {field(<User className="w-4 h-4" />, 'Owner ID', <span className="font-mono text-xs break-all">{doc.userId}</span>)}
          {field(<HardDrive className="w-4 h-4" />, 'File Size', formatBytes(doc.fileSize))}
          {field(<FileText className="w-4 h-4" />, 'File Type', doc.fileType || '—')}
          {field(<Calendar className="w-4 h-4" />, 'Uploaded', new Date(doc.createdAt).toLocaleString())}
          {field(<Calendar className="w-4 h-4" />, 'Updated', new Date(doc.updatedAt).toLocaleString())}
        </div>

        {/* Delete */}
        <div className="pt-2 border-t border-border/40">
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-9 text-xs"
            disabled={loading}
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Document
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [meta,      setMeta]      = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState<AdminDocument | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');

  const buildParams = useCallback((): DocumentQueryParams => ({
    page,
    limit: 10,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(userIdFilter ? { userId: userIdFilter } : {}),
  }), [page, statusFilter, userIdFilter]);

  const fetchDocuments = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getDocuments({ ...buildParams(), page: p });
      setDocuments(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { fetchDocuments(page); }, [page, fetchDocuments]);

  const applyFilters = () => { setPage(1); fetchDocuments(1); };
  const resetFilters = () => {
    setStatusFilter(''); setUserIdFilter(''); setPage(1); fetchDocuments(1);
  };

  const handleDelete = async (docId: string) => {
    await adminAPI.deleteDocument(docId);
    setDocuments(ds => ds.filter(d => d.id !== docId));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Document Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor and manage all user-uploaded materials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FolderOpen className="w-8 h-8 text-indigo-500 opacity-40" />
          {meta && (
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{meta.total}</span> documents
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Status */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                id="doc-status-filter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-8 pr-7 py-2 text-sm bg-muted/50 border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSED">Processed</option>
                <option value="PROCESSING">Processing</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* User ID */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="doc-user-id"
                type="text"
                placeholder="Filter by User ID…"
                value={userIdFilter}
                onChange={e => setUserIdFilter(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <Button size="sm" onClick={applyFilters} className="bg-violet-600 hover:bg-violet-700 text-white h-9">
              <Search className="w-3.5 h-3.5 mr-1.5" /> Filter
            </Button>
            <Button size="sm" variant="outline" onClick={resetFilters} className="h-9">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading && (!documents || documents.length === 0) ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-b-2 border-violet-600 animate-spin" />
            </div>
          ) : (!documents || documents.length === 0) ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No documents match your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          <span className="font-semibold max-w-[180px] truncate" title={doc.title || doc.fileName}>
                            {doc.title || doc.fileName || 'Untitled'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {doc.user ? (
                          <div>
                            <div className="font-medium text-xs">{doc.user.name}</div>
                            <div className="text-xs text-muted-foreground">{doc.user.email}</div>
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground max-w-[110px] truncate block" title={doc.userId}>
                            {doc.userId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4"><DocStatusBadge status={doc.status} /></td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{formatBytes(doc.fileSize)}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{doc.fileType || '—'}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2"
                            asChild
                          >
                            <Link href={`/admin/documents/${doc.id}`}>
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Delete Document"
                            onClick={() => {
                              if (window.confirm("Delete this document?")) handleDelete(doc.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 border-t border-border/50 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page <span className="font-semibold">{meta.page}</span> of {meta.totalPages}
                {' '}· {meta.total} documents
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
                  Previous
                </Button>
                <Button variant="outline" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages || isLoading}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <DocumentDetailModal
          doc={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
