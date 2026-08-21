import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/cn';

const baseField =
  'w-full rounded-xl border bg-white px-4 text-[15px] text-espresso placeholder:text-muted/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:bg-sand';

function FieldShell({
  label,
  error,
  hint,
  htmlFor,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wider text-mocha"
        >
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, className, ...props },
  ref,
) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        className={cn(baseField, 'h-11', error ? 'border-red-400' : 'border-border focus:border-gold', className)}
        {...props}
      />
    </FieldShell>
  );
});

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, error, hint, className, rows = 4, ...props }, ref) {
    const id = useId();
    return (
      <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={cn(
            baseField,
            'resize-y py-3 leading-relaxed',
            error ? 'border-red-400' : 'border-border focus:border-gold',
            className,
          )}
          {...props}
        />
      </FieldShell>
    );
  },
);

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, className, children, ...props },
  ref,
) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <select
        ref={ref}
        id={id}
        className={cn(
          baseField,
          'select-arrow h-11 appearance-none pr-10',
          error ? 'border-red-400' : 'border-border focus:border-gold',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
});

interface FileFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
}

export function FileField({ label, error, hint, previewUrl, onChange }: FileFieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-border bg-sand">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
              <ImagePlus size={22} strokeWidth={1.5} />
              <span className="text-[11px]">16:10</span>
            </div>
          )}
        </div>
        <label
          htmlFor={id}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-espresso transition-colors hover:border-gold hover:text-gold-dark"
        >
          <span>{previewUrl ? 'Заменить изображение' : 'Выбрать файл'}</span>
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </FieldShell>
  );
}

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  function CheckboxField({ label, error, className, ...props }, ref) {
    const id = useId();
    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-white px-4 transition-colors hover:border-gold"
        >
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="h-5 w-5 shrink-0 cursor-pointer accent-gold"
            {...props}
          />
          <span className="text-[15px] font-medium text-espresso">{label}</span>
        </label>
        {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  },
);
