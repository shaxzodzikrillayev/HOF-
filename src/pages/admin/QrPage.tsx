import { useEffect, useMemo, useState } from 'react';
import {
  Armchair,
  Copy,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getSettings } from '@/services/settingsService';
import {
  addTable,
  deleteTable,
  getTables,
  updateTable,
} from '@/services/tableStorage';
import { logActivity } from '@/services/activityStorage';
import { toast } from '@/store/toastStore';
import { getErrorMessage } from '@/lib/errors';
import type { CafeTable } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/States';
import { QrCodeImage, generateQrDataUrl } from '@/components/admin/QrCodeImage';
import { cn } from '@/lib/cn';

/** Builds the public menu URL that carries the table number. */
function tableUrl(number: number): string {
  return `${window.location.origin}/menu?table=${number}`;
}

interface TableFormState {
  number: string;
  error: string | null;
}

export function QrPage() {
  const { t } = useTranslation();
  const settings = useMemo(() => getSettings(), []);

  const [tables, setTables] = useState<CafeTable[]>(() => getTables());
  const [nonces, setNonces] = useState<Record<string, number>>({});
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CafeTable | null>(null);
  const [form, setForm] = useState<TableFormState>({ number: '', error: null });
  const [toDelete, setToDelete] = useState<CafeTable | null>(null);
  const [printTable, setPrintTable] = useState<CafeTable | null>(null);

  const refresh = () => setTables(getTables());

  // ----- Print flow: close the print area once printing finishes
  useEffect(() => {
    if (!printTable) return;
    const afterPrint = () => setPrintTable(null);
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, [printTable]);

  const openCreate = () => {
    setForm({ number: '', error: null });
    setCreating(true);
  };

  const openEdit = (table: CafeTable) => {
    setForm({ number: String(table.number), error: null });
    setEditing(table);
  };

  const handleSubmit = () => {
    const parsed = Number(form.number.trim());
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 999 || !/^\d+$/.test(form.number.trim())) {
      setForm((prev) => ({ ...prev, error: t('qr.tableNumberInvalid') }));
      return;
    }
    try {
      if (editing) {
        const updated = updateTable(editing.id, parsed);
        if (!updated) {
          toast.error(t('common.error'));
          return;
        }
        logActivity('activity.tableUpdated', `№${updated.number}`);
        toast.success(t('qr.tableUpdated'));
        setEditing(null);
      } else {
        const created = addTable(parsed);
        logActivity('activity.tableCreated', `№${created.number}`);
        toast.success(t('qr.tableCreated', { number: created.number }));
        setCreating(false);
      }
      refresh();
    } catch (err) {
      setForm((prev) => ({ ...prev, error: getErrorMessage(err) }));
    }
  };

  const handleDelete = () => {
    if (!toDelete) return;
    try {
      const removed = deleteTable(toDelete.id);
      if (removed) {
        logActivity('activity.tableDeleted', `№${toDelete.number}`);
        toast.success(t('qr.tableDeleted', { number: toDelete.number }));
        refresh();
      } else {
        toast.error(t('common.error'));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToDelete(null);
    }
  };

  const handleRecreate = (table: CafeTable) => {
    setNonces((prev) => ({ ...prev, [table.id]: (prev[table.id] ?? 0) + 1 }));
    toast.info(t('qr.recreated'));
  };

  const handleDownload = async (table: CafeTable) => {
    try {
      const dataUrl = await generateQrDataUrl(tableUrl(table.number), 1024);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `hofe-table-${table.number}-qr.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCopyLink = async (table: CafeTable) => {
    const url = tableUrl(table.number);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    toast.success(t('qr.linkCopied'));
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
            {t('qr.title')}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted sm:text-[15px]">{t('qr.subtitle')}</p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate} className="shrink-0">
          <Plus size={17} />
          {t('qr.addTable')}
        </Button>
      </div>

      {tables.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Armchair} title={t('qr.empty')} subtitle={t('qr.emptyHint')} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => (
            <article
              key={table.id}
              className="group flex animate-fade-up flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift"
            >
              {/* Card header */}
              <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-sand/70 to-transparent px-5 py-3.5">
                <span className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-espresso text-gold-light">
                    <Armchair size={17} strokeWidth={1.8} />
                  </span>
                  <span className="font-display text-lg font-bold text-espresso">
                    {t('table.banner', { number: table.number })}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(table)}
                  title={t('common.edit')}
                  aria-label={t('common.edit')}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-mocha transition-colors hover:bg-sand hover:text-gold-dark"
                >
                  <Pencil size={14} />
                </button>
              </div>

              {/* QR code */}
              <div className="flex flex-col items-center px-5 pb-4 pt-5">
                <QrCodeImage
                  url={tableUrl(table.number)}
                  nonce={nonces[table.id] ?? 0}
                  className="w-full max-w-[220px]"
                />
                <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
                  {settings.cafeName}
                </p>
                <p className="mt-1 break-all text-center text-[11px] text-muted/80">
                  /menu?table={table.number}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border/70 p-4">
                <button
                  type="button"
                  onClick={() => handleDownload(table)}
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-espresso text-xs font-bold text-cream transition-all duration-200 hover:bg-gold active:scale-[0.98]"
                >
                  <Download size={14} />
                  {t('qr.downloadPng')}
                </button>
                <button
                  type="button"
                  onClick={() => setPrintTable(table)}
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
                >
                  <Printer size={14} />
                  {t('qr.print')}
                </button>
                <button
                  type="button"
                  onClick={() => window.open(tableUrl(table.number), '_blank', 'noopener')}
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
                >
                  <ExternalLink size={14} />
                  {t('qr.open')}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink(table)}
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
                >
                  <Copy size={14} />
                  {t('qr.copyLink')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRecreate(table)}
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
                >
                  <RefreshCw size={14} />
                  {t('qr.recreate')}
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(table)}
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  {t('common.delete')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? t('qr.editTableTitle') : t('qr.newTableTitle')}
        size="sm"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-coffee">
              {t('qr.tableNumber')}
            </span>
            <input
              type="number"
              min={1}
              max={999}
              inputMode="numeric"
              value={form.number}
              onChange={(e) =>
                setForm({ number: e.target.value, error: null })
              }
              placeholder="1"
              autoFocus
              className={cn(
                'h-12 w-full rounded-xl border bg-white px-4 text-lg font-bold text-espresso outline-none transition-colors placeholder:text-muted/60 focus:ring-2 focus:ring-gold/40',
                form.error ? 'border-red-400' : 'border-border focus:border-gold',
              )}
            />
            {form.error && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{form.error}</p>
            )}
          </label>

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              className="min-h-11 rounded-full border border-border px-6 text-sm font-semibold text-coffee transition-colors hover:border-gold hover:text-gold-dark"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-full bg-espresso px-7 text-sm font-bold text-cream transition-colors hover:bg-gold"
            >
              {editing ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={toDelete !== null}
        title={t('qr.deleteTitle')}
        message={
          toDelete ? t('qr.deleteText', { number: toDelete.number }) : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

      {/* Hidden print area — only this is visible while printing */}
      {printTable && (
        <div className="qr-print-area" aria-hidden>
          <div className="text-center">
            <p className="font-display text-4xl font-bold tracking-wide text-espresso">
              {settings.cafeName}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-gold-dark">
              {settings.tagline}
            </p>
            <div className="mx-auto mt-6 w-[340px]">
              <StaticPrintQr url={tableUrl(printTable.number)} />
            </div>
            <p className="mt-6 font-display text-3xl font-bold text-espresso">
              {t('table.banner', { number: printTable.number })}
            </p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted">
              {t('qr.scanHint')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Synchronously rendered <img> used inside the print area: the data URL is
 * generated first and window.print() fires once the image is ready.
 */
function StaticPrintQr({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(url, 720)
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!src) return;
    const timer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timer);
  }, [src]);

  if (!src) {
    return (
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-sand" aria-hidden />
    );
  }
  return <img src={src} alt={`QR ${url}`} className="w-full rounded-2xl border border-border" />;
}
