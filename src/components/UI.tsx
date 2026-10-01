import { ReactNode, useEffect, useRef, useState } from "react";
import { Plus, X, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button className="button primary" onClick={onClick}>
      <Plus size={17} />
      {children}
    </button>
  );
}
export function Card({
  title,
  link,
  children,
  className = "",
}: {
  title?: string;
  link?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <div className="card-heading">
          <h2>{title}</h2>
          {link && (
            <Link className="icon-link" aria-label={`View ${title}`} to={link}>
              <ArrowUpRight size={18} />
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
export function Progress({
  value,
  max,
  color = "var(--accent)",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  return (
    <div className="progress">
      <div
        style={{
          width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%`,
          background: color,
        }}
      />
    </div>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [opener] = useState(() => document.activeElement as HTMLElement);
  useEffect(() => {
    const previous = opener;
    const first =
      ref.current?.querySelector<HTMLElement>("input,select,textarea") ??
      ref.current?.querySelector<HTMLElement>("button");
    first?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Tab") {
            const list = e.currentTarget.querySelectorAll<HTMLElement>(
              "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]",
            );
            const first = list[0],
              last = list[list.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <header>
          <div>
            <span className="eyebrow">MAKE A LITTLE PROGRESS</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
