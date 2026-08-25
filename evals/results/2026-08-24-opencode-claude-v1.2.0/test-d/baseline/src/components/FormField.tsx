import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: "input" };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: "textarea" };

export function FormField(props: InputProps | TextareaProps) {
  const { label, error, hint } = props;
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  const fieldClass = `w-full rounded-md border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${
    error ? "border-danger-500 focus-visible:outline-danger-500" : "border-border-strong focus-visible:outline-accent-500"
  }`;

  let field: ReactNode;
  if (props.as === "textarea") {
    const { label: _label, error: _error, hint: _hint, as: _as, ...rest } = props;
    field = (
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`${fieldClass} min-h-24 resize-y`}
        {...rest}
      />
    );
  } else {
    const { label: _label, error: _error, hint: _hint, as: _as, ...rest } = props;
    field = (
      <input id={id} aria-invalid={!!error} aria-describedby={describedBy} className={fieldClass} {...rest} />
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      {field}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  hint,
  children,
  ...rest
}: BaseProps & { children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${
          error ? "border-danger-500" : "border-border-strong focus-visible:outline-accent-500"
        }`}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}
