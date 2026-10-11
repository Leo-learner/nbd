import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type ButtonHTMLAttributes,
} from "react";
import { api, ApiError, type Meta, type User } from "./api";
export interface UIContext {
  meta: Meta;
  user: User;
  refreshUser: () => Promise<void>;
  navigate: (path: string, replace?: boolean) => void;
  notify: (
    message: string,
    action?: { label: string; run: () => void | Promise<void> },
  ) => void;
  confirm: (
    title: string,
    body: string,
    danger?: boolean,
    acknowledge?: string,
  ) => Promise<boolean>;
  report: (error: unknown) => void;
}
export const Context = createContext<UIContext | null>(null);
export const useApp = () => {
  const value = useContext(Context);
  if (!value) throw Error("Missing app context");
  return value;
};
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<{
    data?: T;
    error?: unknown;
    loading: boolean;
  }>({ loading: true });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    if (!path) {
      setState({ loading: false });
      return;
    }
    setState((old) => ({ ...old, error: undefined, loading: true }));
    api<T>("GET", path).then(
      (data) => {
        if (active) setState({ data, loading: false });
      },
      (error) => {
        if (active) setState({ error, loading: false });
      },
    );
    return () => {
      active = false;
    };
  }, [path, revision]);
  return { ...state, reload: () => setRevision((n) => n + 1) };
}
export function label(
  meta: Meta,
  group: keyof Meta["enums"],
  key: string | null | undefined,
) {
  return (
    meta.enums[group].find((item) => item.key === key)?.label ?? key ?? "—"
  );
}
export function Logo({ large = false }: { large?: boolean }) {
  return (
    <span className={`brand ${large ? "brand-large" : ""}`}>
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="3.6" className="ripple-core" />
        <circle cx="14" cy="14" r="8" className="ripple-mid" />
        <circle cx="14" cy="14" r="12.4" className="ripple-outer" />
      </svg>
      <span>
        <strong>NBD</strong>
        <small>没什么大不了</small>
      </span>
    </span>
  );
}
export function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    timeline: "M5 4v16M10 5h9M10 12h9M10 19h9",
    insights: "M4 20V10m8 10V4m8 16v-7",
    lessons:
      "M4 4h7a3 3 0 013 3v13a4 4 0 00-4-2H4zM14 7a3 3 0 013-3h3v14h-3a3 3 0 00-3 2",
    tags: "M3 3h8l10 10-8 8L3 11zM7 7h.01",
    trash: "M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
    access:
      "M8 14l-2 2a3 3 0 01-4-4l5-5a3 3 0 014 0m2 3l2-2a3 3 0 014 4l-5 5a3 3 0 01-4 0m-3-2l8-8",
    settings:
      "M12 8a4 4 0 100 8 4 4 0 000-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10l2 2M5 19l2-2M17 7l2-2",
    activity: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
    logout: "M10 4H4v16h6M8 12h13m-4-4l4 4-4 4",
    menu: "M4 6h16M4 12h16M4 18h16",
    search: "M10 3a7 7 0 100 14 7 7 0 000-14M15 15l6 6",
    arrow: "M5 12h14m-6-6l6 6-6 6",
    close: "M5 5l14 14M5 19L19 5",
    back: "M19 12H5m6-6l-6 6 6 6",
    plus: "M12 5v14M5 12h14",
    copy: "M8 8h12v13H8zM16 8V3H3v13h5",
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.timeline} />
    </svg>
  );
}
export function Button({
  tone = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: string }) {
  return (
    <button
      type="button"
      className={`button button-${tone} ${className}`}
      {...props}
    />
  );
}
export function Card({
  children,
  tone = "",
  className = "",
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
}) {
  return <section className={`card ${tone} ${className}`}>{children}</section>;
}
export function IntensityTile({
  value,
  size = "md",
  label: caption,
}: {
  value: number;
  size?: string;
  label?: string;
}) {
  const n = Math.max(0, Math.min(10, Math.round(value)));
  return (
    <span className="intensity-wrap">
      <span
        className={`intensity-tile intensity-${size}`}
        style={
          {
            "--tile-color": `var(--intensity-${n})`,
            "--tile-text": n >= 7 ? "var(--white)" : "var(--intensity-text)",
          } as CSSProperties
        }
      >
        {Number.isInteger(value) ? value : value.toFixed(1)}
      </span>
      {caption && <small>{caption}</small>}
    </span>
  );
}
export function ThenNow({
  then,
  now,
  size = "md",
}: {
  then: number;
  now?: number | null;
  size?: string;
}) {
  return (
    <div className="then-now">
      <IntensityTile value={then} size={size} label="当时" />
      {now != null && (
        <>
          <Icon name="arrow" />
          <IntensityTile value={now} size={size} label="现在" />
        </>
      )}
    </div>
  );
}
export function StatusBadge({ status }: { status: string }) {
  const { meta } = useApp();
  return (
    <span className={`status-badge status-${status}`}>
      {label(meta, "status", status)}
    </span>
  );
}
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Logo />
      <h2>{title}</h2>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="skeletons" aria-label="正在加载" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const e = error instanceof Error ? error.message : "暂时无法加载";
  return (
    <div className="error-state" role="alert">
      <h2>暂时无法加载</h2>
      <p>{e}</p>
      {error instanceof ApiError && (
        <small className="mono">
          {error.code} · {error.requestId}
        </small>
      )}
      {retry && <Button onClick={retry}>重试</Button>}
    </div>
  );
}
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <div className="form-error" role="alert">
      {error instanceof Error ? error.message : String(error)}
      {error instanceof ApiError && (
        <small className="mono">
          {error.code} {error.requestId && `· 编号 ${error.requestId}`}
        </small>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  locked = false,
  danger = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  locked?: boolean;
  danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const focus = dialog.querySelector<HTMLElement>(
      danger ? "[data-cancel]" : "input, textarea, button",
    );
    focus?.focus();
    return () => {
      dialog.close();
      trigger?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      role={danger ? "alertdialog" : "dialog"}
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!locked) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !locked) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  );
}
