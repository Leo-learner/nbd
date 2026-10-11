import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createRoot } from "react-dom/client";
import { api, ApiError, type Meta, type User, type ResponseOf } from "./api";
import {
  Context,
  Button,
  Logo,
  Icon,
  Modal,
  FormError,
  Loading,
  ErrorState,
  type UIContext,
} from "./shared";
import {
  Timeline,
  MomentPage,
  ReflectPage,
  RevisionsPage,
} from "./pages/Moments";
import {
  LessonsPage,
  TagsPage,
  TrashPage,
  AccessPage,
  SettingsPage,
  ActivityPage,
} from "./pages/Management";
import { InsightsPage } from "./pages/Insights";
import "./styles.css";

const groups = [
  [
    ["/", "时间线", "timeline"],
    ["/insights", "洞察", "insights"],
    ["/lessons", "经验库", "lessons"],
  ],
  [
    ["/settings/tags", "标签", "tags"],
    ["/settings/trash", "回收站", "trash"],
  ],
  [
    ["/settings/access", "接入管理", "access"],
    ["/settings", "设置", "settings"],
    ["/settings/activity", "操作记录", "activity"],
  ],
];
function safeNext(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/";
  const url = new URL(value, location.origin);
  return url.origin === location.origin &&
    !/^\/(?:login|api|oauth|mcp|\.well-known)(?:\/|$)/.test(url.pathname)
    ? url.pathname + url.search
    : "/";
}
function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [error, setError] = useState<unknown>(),
    [pending, setPending] = useState(false),
    [until, setUntil] = useState(0),
    [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (until > Date.now()) {
      const id = setInterval(() => setNow(Date.now()), 500);
      return () => clearInterval(id);
    }
  }, [until]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || until > Date.now()) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(undefined);
    try {
      const result = await api<ResponseOf<"login">>("POST", "/auth/login", {
        username: data.get("username"),
        password: data.get("password"),
      });
      onLogin(result.user);
    } catch (e) {
      setError(e);
      if (e instanceof ApiError && e.retryAfter)
        setUntil(Date.now() + e.retryAfter * 1000);
    } finally {
      setPending(false);
    }
  }
  const remaining = Math.max(0, Math.ceil((until - now) / 1000));
  return (
    <div className="login-layout">
      <section className="login-art" aria-hidden="true">
        <svg className="login-ripples" viewBox="0 0 400 400">
          {[180, 150, 120, 90, 60, 25].map((r, i) => (
            <circle
              key={r}
              cx="200"
              cy="200"
              r={r}
              className={`login-ring ring-${i}`}
            />
          ))}
        </svg>
        <p>
          当时觉得天塌了的事，
          <br />
          过一阵子再看，
          <br />
          大多没什么大不了。
        </p>
      </section>
      <main className="login-form">
        <div className="login-content">
          <Logo large />
          <form onSubmit={submit}>
            <label className="form-field">
              用户名
              <input
                name="username"
                autoComplete="username"
                required
                maxLength={20}
                autoFocus
              />
            </label>
            <label className="form-field">
              密码
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
              />
            </label>
            <FormError error={error} />
            <Button
              tone="primary"
              type="submit"
              disabled={pending || remaining > 0}
            >
              {remaining > 0
                ? `${remaining} 秒后重试`
                : pending
                  ? "登录中…"
                  : "登录"}
            </Button>
          </form>
          <p className="login-footnote">
            这是一个只给一个人用的私人网站。
            <br />
            新的事请在 Claude 或 ChatGPT 里说「帮我记一笔」。
          </p>
        </div>
      </main>
    </div>
  );
}
function App() {
  const [route, setRoute] = useState(location.pathname + location.search),
    [user, setUser] = useState<User | null>(),
    [meta, setMeta] = useState<Meta>(),
    [startupError, setStartupError] = useState<unknown>();
  const [menu, setMenu] = useState(false),
    [toast, setToast] = useState<{
      message: string;
      error?: unknown;
      action?: { label: string; run: () => void | Promise<void> };
    }>();
  const [confirmation, setConfirmation] = useState<{
      title: string;
      body: string;
      danger: boolean;
      acknowledge?: string;
      resolve: (ok: boolean) => void;
    }>(),
    [checked, setChecked] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const load = useCallback(async () => {
    setStartupError(undefined);
    try {
      const [me, m] = await Promise.all([
        api<ResponseOf<"getMe">>("GET", "/auth/me"),
        api<Meta>("GET", "/meta"),
      ]);
      setUser(me.user);
      setMeta(m);
    } catch (e) {
      setStartupError(e);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const perform = useCallback((path: string, replace = false) => {
    (replace ? history.replaceState : history.pushState).call(
      history,
      {},
      "",
      path,
    );
    setRoute(location.pathname + location.search);
    setMenu(false);
    window.dispatchEvent(new Event("nbd-route-changed"));
    window.scrollTo(0, 0);
  }, []);
  const navigate = useCallback(
    (path: string, replace = false) => {
      if (path === location.pathname + location.search) return;
      let cancelled = false;
      window.dispatchEvent(
        new CustomEvent("nbd-before-navigate", {
          detail: {
            path,
            cancel: () => {
              cancelled = true;
            },
            resume: () => perform(path, replace),
          },
        }),
      );
      if (!cancelled) perform(path, replace);
    },
    [perform],
  );
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const a = (event.target as Element).closest("a");
      if (
        !a ||
        a.target ||
        a.download ||
        a.origin !== location.origin ||
        a.pathname.startsWith("/api/") ||
        a.hash
      )
        return;
      event.preventDefault();
      navigate(a.pathname + a.search);
    };
    const pop = () => {
      const path = location.pathname + location.search;
      let cancelled = false;
      window.dispatchEvent(
        new CustomEvent("nbd-before-navigate", {
          detail: {
            path,
            cancel: () => {
              cancelled = true;
            },
            resume: () => perform(path),
          },
        }),
      );
      if (cancelled) history.pushState({}, "", route);
      else {
        setRoute(path);
        setMenu(false);
        window.scrollTo(0, 0);
      }
    };
    const expired = () => {
      setUser(null);
      perform(
        `/login?next=${encodeURIComponent(safeNext(location.pathname + location.search))}`,
        true,
      );
    };
    const sync = () => setRoute(location.pathname + location.search);
    document.addEventListener("click", click);
    window.addEventListener("popstate", pop);
    window.addEventListener("nbd-auth-required", expired);
    window.addEventListener("nbd-route-changed", sync);
    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("popstate", pop);
      window.removeEventListener("nbd-auth-required", expired);
      window.removeEventListener("nbd-route-changed", sync);
    };
  }, [navigate, perform, route]);
  useEffect(() => {
    if (user === null && !route.startsWith("/login"))
      perform(`/login?next=${encodeURIComponent(safeNext(route))}`, true);
  }, [user, route, perform]);
  const notify: UIContext["notify"] = (message, action) => {
    clearTimeout(toastTimer.current);
    setToast({ message, action });
    toastTimer.current = setTimeout(
      () => setToast(undefined),
      action ? 10000 : 5000,
    );
  };
  const report = (error: unknown) => {
    clearTimeout(toastTimer.current);
    setToast({
      message: error instanceof Error ? error.message : "出错了，请稍后再试",
      error,
    });
  };
  const confirm: UIContext["confirm"] = (
    title,
    body,
    danger = false,
    acknowledge,
  ) =>
    new Promise((resolve) => {
      setChecked(false);
      setConfirmation({ title, body, danger, acknowledge, resolve });
    });
  const finishConfirmation = (ok: boolean) => {
    confirmation?.resolve(ok);
    setConfirmation(undefined);
  };
  if (startupError)
    return (
      <main className="page-main">
        <Logo />
        <ErrorState error={startupError} retry={() => void load()} />
      </main>
    );
  if (user === undefined || !meta)
    return (
      <main className="page-main">
        <Logo />
        <Loading />
      </main>
    );
  if (user === null)
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          perform(
            safeNext(new URLSearchParams(location.search).get("next")),
            true,
          );
        }}
      />
    );
  const path = route.split("?")[0],
    match = path.match(/^\/moments\/([^/]+)(?:\/(reflect|revisions))?$/),
    focus = match?.[2] === "reflect";
  let page;
  if (match) {
    let id = match[1];
    try {
      id = decodeURIComponent(id);
    } catch {
      /* Invalid paths still receive a normal API error page. */
    }
    page = focus ? (
      <ReflectPage id={id} />
    ) : match[2] === "revisions" ? (
      <RevisionsPage id={id} />
    ) : (
      <MomentPage id={id} />
    );
  } else if (path === "/" || path === "/login") page = <Timeline />;
  else if (path === "/insights") page = <InsightsPage />;
  else if (path === "/lessons" || /^\/lessons\/[^/]+$/.test(path))
    page = <LessonsPage id={path.split("/")[2]} />;
  else if (path === "/settings/tags") page = <TagsPage />;
  else if (path === "/settings/trash") page = <TrashPage />;
  else if (path === "/settings/access") page = <AccessPage />;
  else if (path === "/settings/activity") page = <ActivityPage />;
  else if (path === "/settings") page = <SettingsPage />;
  else
    page = (
      <div className="empty-state">
        <h1>找不到这个页面</h1>
        <a href="/">回到时间线</a>
      </div>
    );
  const current = match
    ? "时间线"
    : (groups.flat().find((item) => item[0] === path)?.[1] ??
      (path.startsWith("/lessons/") ? "经验库" : "NBD"));
  const logout = async () => {
    try {
      await api("POST", "/auth/logout");
      setUser(null);
      perform("/login", true);
    } catch (e) {
      report(e);
    }
  };
  const nav = (
    <>
      <a href="/" aria-label="NBD 首页">
        <Logo />
      </a>
      {groups.map((group, i) => (
        <div className="nav-group" key={i}>
          {i > 0 && <p className="nav-label">{i === 1 ? "整理" : "账号"}</p>}
          {group.map(([url, text, icon]) => {
            const active =
              url === "/"
                ? !!match || path === "/"
                : url === "/lessons"
                  ? path.startsWith("/lessons")
                  : url === path;
            return (
              <a
                className="nav-link"
                href={url}
                key={url}
                aria-current={active ? "page" : undefined}
              >
                <Icon name={icon} />
                {text}
              </a>
            );
          })}
        </div>
      ))}
      <div className="user-row">
        <span className="avatar">{user.displayName.slice(0, 1)}</span>
        <span>{user.displayName}</span>
        <Button
          tone="quiet"
          aria-label="退出登录"
          onClick={() => void logout()}
        >
          <Icon name="logout" />
        </Button>
      </div>
    </>
  );
  return (
    <Context
      value={{
        meta,
        user,
        refreshUser: load,
        navigate,
        notify,
        confirm,
        report,
      }}
    >
      <div className={`app-shell ${focus ? "focus-shell" : ""}`}>
        {!focus && (
          <nav className="sidebar" aria-label="主导航">
            {nav}
          </nav>
        )}
        {!focus && (
          <header className="mobile-header">
            {match ? (
              <a href="/" className="mobile-back">
                <Icon name="back" />
                时间线
              </a>
            ) : (
              <span className="mobile-title">
                <Logo />
                {current}
              </span>
            )}
            <div>
              <Button
                tone="quiet"
                aria-label="搜索"
                onClick={() => {
                  navigate("/");
                  setTimeout(
                    () =>
                      document
                        .querySelector<HTMLInputElement>('input[type="search"]')
                        ?.focus(),
                    50,
                  );
                }}
              >
                <Icon name="search" />
              </Button>
              <Button
                tone="quiet"
                aria-label={match ? "更多操作" : "打开菜单"}
                aria-expanded={menu}
                onClick={() => setMenu(true)}
              >
                <Icon name="menu" />
              </Button>
            </div>
          </header>
        )}
        <main className={`page-main ${match ? "moment-main" : ""}`}>
          <div
            className={`page-content ${path === "/" ? "timeline-content" : ""}`}
          >
            {page}
          </div>
        </main>
      </div>
      {menu && (
        <Modal title="菜单" onClose={() => setMenu(false)}>
          <nav className="mobile-menu" aria-label="手机主导航">
            {nav}
          </nav>
          <Button onClick={() => setMenu(false)}>关闭菜单</Button>
        </Modal>
      )}
      {confirmation && (
        <Modal
          title={confirmation.title}
          danger={confirmation.danger}
          onClose={() => finishConfirmation(false)}
        >
          <p className="confirm-body">{confirmation.body}</p>
          {confirmation.acknowledge && (
            <label className="acknowledge">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              {confirmation.acknowledge}
            </label>
          )}
          <div className="actions">
            <Button data-cancel onClick={() => finishConfirmation(false)}>
              取消
            </Button>
            <Button
              tone={confirmation.danger ? "danger-solid" : "primary"}
              disabled={!!confirmation.acknowledge && !checked}
              onClick={() => finishConfirmation(true)}
            >
              确认
            </Button>
          </div>
        </Modal>
      )}
      {toast && (
        <div
          className={`toast ${toast.error ? "toast-error" : ""}`}
          role={toast.error ? "alert" : "status"}
        >
          <div>
            {toast.message}
            {toast.error instanceof ApiError && (
              <small className="mono">
                {toast.error.code} · 编号 {toast.error.requestId}
              </small>
            )}
          </div>
          {toast.action && (
            <Button
              onClick={() => {
                Promise.resolve(toast.action!.run()).catch(report);
                setToast(undefined);
              }}
            >
              {toast.action.label}
            </Button>
          )}
          <Button
            tone="quiet"
            aria-label="关闭提示"
            onClick={() => setToast(undefined)}
          >
            <Icon name="close" />
          </Button>
        </div>
      )}
    </Context>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
