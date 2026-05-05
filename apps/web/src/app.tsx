import { Button } from "@plan-with-ai/ui-components";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

type UserRole = "user" | "admin";

interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredSession {
  accessToken: string;
  user: PublicUser;
}

interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

interface ApiErrorPayload {
  message?: string;
  issues?: Array<{ path: string; message: string }>;
}

class ApiError extends Error {
  public readonly status: number;
  public readonly issues?: ApiErrorPayload["issues"];

  constructor(
    status: number,
    message: string,
    issues?: ApiErrorPayload["issues"],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

const storageKey = "plan-with-ai.auth-session";

const emptyAuthForm = {
  name: "",
  email: "",
  password: "",
};

const emptyProfileForm = {
  name: "",
  email: "",
  bio: "",
  avatarUrl: "",
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
};

function getDisplayRole(role: UserRole): string {
  return role === "admin" ? "Administrator" : "Member";
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredSession>;

    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.user !== "object" ||
      parsed.user === null ||
      typeof parsed.user.id !== "string"
    ) {
      return null;
    }

    return parsed as StoredSession;
  } catch {
    return null;
  }
}

function saveStoredSession(session: StoredSession | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

function buildHeaders(
  accessToken?: string | null,
  body?: BodyInit | null,
): Headers {
  const headers = new Headers();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (body) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: buildHeaders(accessToken, options.body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | null;

    throw new ApiError(
      response.status,
      errorPayload?.message ?? `Request failed with status ${response.status}`,
      errorPayload?.issues,
    );
  }

  return payload as T;
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}

function StatusPill({
  kind,
  children,
}: {
  kind: "success" | "warning" | "neutral";
  children: ReactNode;
}) {
  return <span className={`pill pill--${kind}`}>{children}</span>;
}

export function App() {
  const [booting, setBooting] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<PublicUser[]>([]);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    kind: "success" | "error" | "neutral" | "warning";
    text: string;
  } | null>(null);

  function syncUser(user: PublicUser): void {
    setCurrentUser(user);
    setProfileForm({
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    });
  }

  function signOutLocal(message?: string): void {
    setCurrentUser(null);
    setAccessToken(null);
    setAdminUsers([]);
    setPasswordForm(emptyPasswordForm);
    saveStoredSession(null);

    if (message) {
      setStatusMessage({ kind: "neutral", text: message });
    }
  }

  async function loadAdminUsers(token: string): Promise<void> {
    const response = await requestJson<{ users: PublicUser[] }>(
      "/admin/users",
      { method: "GET" },
      token,
    );

    setAdminUsers(response.users);
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const storedSession = readStoredSession();

      if (storedSession) {
        setAccessToken(storedSession.accessToken);
        syncUser(storedSession.user);
      }

      try {
        const session = await requestJson<AuthResponse>("/auth/session", {
          method: "POST",
        });

        if (!active) {
          return;
        }

        setAccessToken(session.accessToken);
        syncUser(session.user);
        saveStoredSession(session);
        setStatusMessage({
          kind: "success",
          text: `Welcome back, ${session.user.name}. Your session is ready.`,
        });

        if (session.user.role === "admin") {
          await loadAdminUsers(session.accessToken);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        if (!storedSession) {
          saveStoredSession(null);
          setStatusMessage({
            kind: "neutral",
            text: "Sign in to unlock your profile and authorization dashboard.",
          });
        } else if (error instanceof ApiError && error.status === 401) {
          setStatusMessage({
            kind: "warning",
            text: "Your refresh session expired. Continue using the current sign-in or log in again.",
          });
        }
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("auth");
    setStatusMessage(null);

    try {
      const payload =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password,
            }
          : {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            };

      const response = await requestJson<AuthResponse>(
        authMode === "login" ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      setAccessToken(response.accessToken);
      syncUser(response.user);
      saveStoredSession(response);
      setAuthForm(emptyAuthForm);
      setStatusMessage({
        kind: "success",
        text:
          authMode === "login"
            ? `Signed in as ${response.user.name}.`
            : `Account created for ${response.user.name}.`,
      });

      if (response.user.role === "admin") {
        await loadAdminUsers(response.accessToken);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const validationMessage = error.issues?.[0]
          ? `${error.message}: ${error.issues[0].path} ${error.issues[0].message}`
          : error.message;
        setStatusMessage({ kind: "error", text: validationMessage });
      } else {
        setStatusMessage({
          kind: "error",
          text:
            error instanceof Error ? error.message : "Authentication failed.",
        });
      }
    } finally {
      setBusyAction(null);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      signOutLocal("Please sign in again to update your profile.");
      return;
    }

    setBusyAction("profile");
    setStatusMessage(null);

    try {
      const response = await requestJson<{ user: PublicUser }>(
        "/auth/me",
        {
          method: "PATCH",
          body: JSON.stringify(profileForm),
        },
        accessToken,
      );

      syncUser(response.user);
      saveStoredSession({ accessToken, user: response.user });
      setStatusMessage({
        kind: "success",
        text: "Profile updated successfully.",
      });

      if (response.user.role === "admin") {
        await loadAdminUsers(accessToken);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOutLocal("Your session expired. Please sign in again.");
        return;
      }

      setStatusMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Profile update failed.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      signOutLocal("Please sign in again to change your password.");
      return;
    }

    setBusyAction("password");
    setStatusMessage(null);

    try {
      await requestJson<{ message: string }>(
        "/auth/password",
        {
          method: "PATCH",
          body: JSON.stringify(passwordForm),
        },
        accessToken,
      );

      setPasswordForm(emptyPasswordForm);
      signOutLocal("Password updated. Sign in again to continue.");
      setAuthMode("login");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOutLocal("Your session expired. Please sign in again.");
        return;
      }

      setStatusMessage({
        kind: "error",
        text:
          error instanceof Error ? error.message : "Password update failed.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleLogout() {
    setBusyAction("logout");

    try {
      await requestJson<void>("/auth/logout", { method: "POST" }, accessToken);
    } catch {
      // Logout should always clear local session state even if the backend rejects the request.
    } finally {
      signOutLocal("You have been signed out.");
      setAuthMode("login");
      setBusyAction(null);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-page__glow auth-page__glow--one" />
      <div className="auth-page__glow auth-page__glow--two" />

      <div className="auth-shell">
        <section className="hero card card--hero">
          <div className="hero__badge-row">
            <StatusPill kind={currentUser ? "success" : "neutral"}>
              {currentUser
                ? `${getDisplayRole(currentUser.role)} access active`
                : "Plan with AI workspace"}
            </StatusPill>
            <StatusPill kind="neutral">Plan workflow ready</StatusPill>
          </div>

          <h1 className="hero__title">
            Your Plan with AI workspace starts here.
          </h1>
          <p className="hero__copy">
            Sign up, sign in, and manage your Plan with AI profile in a focused
            workspace that feels built for planning, tasks, and team access.
          </p>
        </section>

        <div className="workspace">
          {statusMessage ? (
            <div className={`banner banner--${statusMessage.kind}`}>
              {statusMessage.text}
            </div>
          ) : null}

          {booting ? (
            <Card className="workspace__loading">
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line" />
            </Card>
          ) : currentUser ? (
            <div className="dashboard-grid">
              <Card className="profile-card profile-card--summary">
                <div className="profile-card__avatar">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={`${currentUser.name} avatar`}
                    />
                  ) : (
                    <span>{getInitials(currentUser.name)}</span>
                  )}
                </div>

                <div className="profile-card__body">
                  <div className="profile-card__header">
                    <div>
                      <p className="eyebrow">Signed in</p>
                      <h2>{currentUser.name}</h2>
                    </div>
                    <StatusPill
                      kind={
                        currentUser.role === "admin" ? "success" : "neutral"
                      }
                    >
                      {getDisplayRole(currentUser.role)}
                    </StatusPill>
                  </div>

                  <p className="profile-card__email">{currentUser.email}</p>
                  <p className="profile-card__bio">
                    {currentUser.bio ||
                      "No bio set yet. Add one in your profile editor."}
                  </p>

                  <dl className="meta-grid">
                    <div>
                      <dt>Joined</dt>
                      <dd>{formatDate(currentUser.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>Updated</dt>
                      <dd>{formatDate(currentUser.updatedAt)}</dd>
                    </div>
                  </dl>

                  <Button
                    type="button"
                    className="button button--ghost"
                    onClick={() => void handleLogout()}
                    disabled={busyAction === "logout"}
                  >
                    {busyAction === "logout" ? "Signing out..." : "Sign out"}
                  </Button>
                </div>
              </Card>

              <div className="stack">
                <Card>
                  <div className="section-head">
                    <div>
                      <p className="eyebrow">Plan profile</p>
                      <h3>Profile management</h3>
                    </div>
                    <StatusPill kind="neutral">Workspace profile</StatusPill>
                  </div>

                  <form
                    className="form-grid"
                    onSubmit={(event) => void handleProfileSubmit(event)}
                  >
                    <Field label="Name">
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Your display name"
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="you@example.com"
                      />
                    </Field>

                    <Field label="Avatar URL" hint="Optional public image URL.">
                      <input
                        type="url"
                        value={profileForm.avatarUrl}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            avatarUrl: event.target.value,
                          }))
                        }
                        placeholder="https://..."
                      />
                    </Field>

                    <Field label="Bio" hint="Up to 320 characters.">
                      <textarea
                        value={profileForm.bio}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            bio: event.target.value,
                          }))
                        }
                        placeholder="Write a short introduction."
                        rows={4}
                      />
                    </Field>

                    <div className="form-actions">
                      <Button
                        type="submit"
                        className="button button--primary"
                        disabled={busyAction === "profile"}
                      >
                        {busyAction === "profile"
                          ? "Saving..."
                          : "Save profile"}
                      </Button>
                    </div>
                  </form>
                </Card>

                <Card>
                  <div className="section-head">
                    <div>
                      <p className="eyebrow">Plan security</p>
                      <h3>Change password</h3>
                    </div>
                    <StatusPill kind="warning">Session refresh</StatusPill>
                  </div>

                  <form
                    className="form-grid"
                    onSubmit={(event) => void handlePasswordSubmit(event)}
                  >
                    <Field label="Current password">
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            currentPassword: event.target.value,
                          }))
                        }
                        placeholder="••••••••"
                      />
                    </Field>

                    <Field
                      label="New password"
                      hint="Use at least 8 characters."
                    >
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            newPassword: event.target.value,
                          }))
                        }
                        placeholder="Create a stronger password"
                      />
                    </Field>

                    <div className="form-actions">
                      <Button
                        type="submit"
                        className="button button--secondary"
                        disabled={busyAction === "password"}
                      >
                        {busyAction === "password"
                          ? "Updating..."
                          : "Update password"}
                      </Button>
                    </div>
                  </form>
                </Card>

                {currentUser.role === "admin" ? (
                  <Card>
                    <div className="section-head">
                      <div>
                        <p className="eyebrow">Team access</p>
                        <h3>Admin users</h3>
                      </div>
                      <StatusPill kind="success">Plan admin only</StatusPill>
                    </div>

                    <div className="admin-list">
                      {adminUsers.map((user) => (
                        <article key={user.id} className="admin-list__item">
                          <div className="admin-list__avatar">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <strong>{user.name}</strong>
                            <p>{user.email}</p>
                          </div>
                          <StatusPill
                            kind={user.role === "admin" ? "success" : "neutral"}
                          >
                            {getDisplayRole(user.role)}
                          </StatusPill>
                        </article>
                      ))}
                    </div>
                  </Card>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="auth-grid">
              <Card className="auth-card">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">Welcome to Plan with AI</p>
                    <h2>
                      {authMode === "login" ? "Sign in" : "Create your account"}
                    </h2>
                  </div>
                  <div className="auth-toggle">
                    <Button
                      type="button"
                      className={`button button--toggle ${authMode === "login" ? "is-active" : ""}`}
                      onClick={() => setAuthMode("login")}
                    >
                      Sign in
                    </Button>
                    <Button
                      type="button"
                      className={`button button--toggle ${authMode === "register" ? "is-active" : ""}`}
                      onClick={() => setAuthMode("register")}
                    >
                      Register
                    </Button>
                  </div>
                </div>

                <div className="auth-card__intro">
                  <p>
                    Pick up your planning flow, keep your profile in sync, and
                    jump back into the workspace with one secure sign-in.
                  </p>
                  <div className="auth-card__chips">
                    <StatusPill kind="neutral">
                      Plan with AI workspace
                    </StatusPill>
                    <StatusPill kind="neutral">Team-ready access</StatusPill>
                  </div>
                </div>

                <form
                  className="form-grid"
                  onSubmit={(event) => void handleAuthSubmit(event)}
                >
                  {authMode === "register" ? (
                    <Field label="Full name">
                      <input
                        type="text"
                        value={authForm.name}
                        onChange={(event) =>
                          setAuthForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Jane Doe"
                      />
                    </Field>
                  ) : null}

                  <Field label="Email address">
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(event) =>
                        setAuthForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="you@example.com"
                    />
                  </Field>

                  <Field
                    label="Password"
                    hint={
                      authMode === "register"
                        ? "At least 8 characters."
                        : undefined
                    }
                  >
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(event) =>
                        setAuthForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="••••••••"
                    />
                  </Field>

                  <div className="form-actions">
                    <Button
                      type="submit"
                      className="button button--primary button--wide"
                      disabled={busyAction === "auth"}
                    >
                      {busyAction === "auth"
                        ? authMode === "login"
                          ? "Signing in..."
                          : "Creating account..."
                        : authMode === "login"
                          ? "Sign in"
                          : "Create account"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
