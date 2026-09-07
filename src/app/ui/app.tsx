import { useEffect, useState, lazy, Suspense } from "react";
import {
  PanelsTopLeft,
  PanelLeftClose,
  SquarePen,
  FileText,
  CalendarDays,
  CalendarClock,
  Plus,
  Folder,
  Settings,
  ChevronDown,
  Search,
  BriefcaseBusiness,
  Database,
} from "lucide-react";
import { SyncPanel } from "./sync-panel";
import { OperationsPanel } from "./operations-panel";
import { CareerPage } from "@/pages/career";
import { ApplicationsPage } from "@/pages/applications";
const DocumentsPage = lazy(() =>
  import("@/pages/documents").then((module) => ({
    default: module.DocumentsPage,
  })),
);
import { CalendarPage } from "@/pages/calendar";
import { InterviewsPage } from "@/pages/interviews";
import { ProjectsPage } from "@/pages/projects";
import { SettingsPage, completeAuth } from "@/pages/settings";
import { ChatPage } from "@/pages/chat";
import { usePreferences, useT } from "@/shared/config";
import { useSession } from "@/shared/auth";
import { useResources } from "@/shared/api";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
export const App = () => {
  const t = useT();
  const [documentId, setDocumentId] = useState("");
  const [documentVersionId, setDocumentVersionId] = useState("");
  const pins = useResources("pins");
  const documents = useResources("documents");
  const [page, setPage] = useState("chat");
  const [collapsed, setCollapsed] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [search, setSearch] = useState("");
  const prefs = usePreferences();
  const session = useSession();
  const apps = useResources("applications");
  const conversations = useResources("conversations");
  const projects = useResources("projects");
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        prefs.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : prefs.theme;
      document.documentElement.lang = prefs.locale;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefs.theme, prefs.locale]);
  useEffect(() => {
    if (!isTauri()) return;
    let dispose: (() => void) | undefined;
    void getCurrent().then((urls) =>
      urls?.forEach((url) => void completeAuth(url)),
    );
    void onOpenUrl((urls) =>
      urls.forEach((url) => void completeAuth(url)),
    ).then((fn) => {
      dispose = fn;
    });
    return () => dispose?.();
  }, []);
  useEffect(() => {
    setApplicationId("");
    setConversationId("");
  }, [session.accountId]);
  const openApplication = (id: string) => {
    setApplicationId(id);
    setConversationId("");
    setPage("chat");
  };
  const nav = [
    {
      id: "applications",
      label: t("지원 현황", "Applications"),
      icon: SquarePen,
    },
    { id: "documents", label: t("내 서류", "My documents"), icon: FileText },
    { id: "calendar", label: t("캘린더", "Calendar"), icon: CalendarDays },
    {
      id: "interviews",
      label: t("면접 준비", "Interviews"),
      icon: CalendarClock,
    },
  ];
  const title =
    page === "chat"
      ? apps.data.find((a) => a.id === applicationId)?.company || "Push"
      : page === "career"
        ? "Career Vault"
        : page === "projects"
          ? t("프로젝트", "Projects")
          : page === "settings"
            ? t("설정", "Settings")
            : nav.find((n) => n.id === page)?.label;
  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-toolbar">
          <button
            aria-label={t("사이드바 접기", "Collapse sidebar")}
            onClick={() => setCollapsed(true)}
          >
            <PanelLeftClose size={19} />
          </button>
        </div>
        <div className="sidebar-scroll">
          <div className="section-label">
            {t("기능", "Features")}
            <ChevronDown size={15} />
          </div>
          <nav aria-label={t("기능", "Features")}>
            {nav.map((n) => (
              <button
                className={`nav-row ${page === n.id ? "selected" : ""}`}
                key={n.id}
                onClick={() => setPage(n.id)}
              >
                <n.icon size={19} />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
          {pins.data.length > 0 && (
            <div className="sidebar-section">
              <div className="section-label">
                {t("고정한 항목", "Pinned items")}
              </div>
              {pins.data.map((pin) => {
                const doc =
                  pin.resourceType === "DOCUMENT"
                    ? documents.data.find((item) => item.id === pin.resourceId)
                    : undefined;
                const application =
                  pin.resourceType === "JOB"
                    ? apps.data.find((item) => item.jobId === pin.resourceId)
                    : undefined;
                if (!doc && !application) return null;
                return (
                  <button
                    className="nav-row"
                    key={pin.id}
                    onClick={() => {
                      if (doc) {
                        setDocumentId(doc.id);
                        setDocumentVersionId("");
                        setPage("documents");
                      } else if (application) {
                        openApplication(application.id);
                      }
                    }}
                  >
                    {doc
                      ? doc.title
                      : `${application!.company} · ${application!.title}`}
                  </button>
                );
              })}
            </div>
          )}
          <div className="sidebar-section">
            <div className="section-label">{t("채팅", "Chats")}</div>
            <button
              className="nav-row"
              onClick={() => {
                setConversationId("");
                setPage("chat");
              }}
            >
              <Plus size={19} />
              {t("새 채팅", "New chat")}
            </button>
            {conversations.data
              .filter(
                (c) =>
                  !search ||
                  c.title.toLowerCase().includes(search.toLowerCase()),
              )
              .map((c) => (
                <button
                  className={`nav-row ${conversationId === c.id && page === "chat" ? "selected" : ""}`}
                  key={c.id}
                  onClick={() => {
                    setApplicationId(c.applicationId);
                    setConversationId(c.id);
                    setPage("chat");
                  }}
                >
                  <Folder size={18} />
                  <span>{c.title}</span>
                </button>
              ))}
            {!conversations.data.length && (
              <p className="sidebar-empty">
                {t(
                  "대화가 여기에 표시됩니다",
                  "Your conversations appear here",
                )}
              </p>
            )}
          </div>
          <div className="sidebar-section">
            <div className="section-label">
              {t("프로젝트", "Projects")}
              <ChevronDown size={15} />
            </div>
            <button className="nav-row" onClick={() => setPage("projects")}>
              <Plus size={19} />
              {t("새 프로젝트", "New project")}
            </button>
            {projects.data.map((p) => (
              <button
                className="nav-row"
                key={p.id}
                onClick={() => setPage("projects")}
              >
                <Folder size={18} />
                <span>{p.title}</span>
              </button>
            ))}
            {apps.data
              .filter(
                (a) =>
                  !search ||
                  `${a.company} ${a.title}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((a) => (
                <button
                  className={`nav-row ${a.id === applicationId && page === "chat" ? "selected" : ""}`}
                  key={a.id}
                  onClick={() => openApplication(a.id)}
                >
                  <Folder size={18} />
                  <span>{a.company}</span>
                </button>
              ))}
          </div>
          <button
            className={`nav-row vault-link ${page === "career" ? "selected" : ""}`}
            onClick={() => setPage("career")}
          >
            <Database size={18} />
            Career Vault
          </button>
        </div>
        <div className="sidebar-footer">
          <button
            className="account-button"
            onClick={() => setPage("settings")}
          >
            <span className="avatar">P</span>
            <span>
              {session.accountId
                ? t("내 계정", "Account")
                : t("로그인", "Sign in")}
            </span>
            <ChevronDown size={13} />
          </button>
          <button
            aria-label={t("검색", "Search")}
            onClick={() => setSearch(search ? "" : " ")}
          >
            <Search size={19} />
          </button>
        </div>
        {search !== "" && (
          <input
            autoFocus
            className="sidebar-search"
            aria-label={t("채팅·회사 검색", "Search chats and companies")}
            value={search.trimStart()}
            onChange={(e) => setSearch(e.target.value || " ")}
            placeholder={t("검색…", "Search…")}
          />
        )}
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="row">
            {collapsed && (
              <button
                aria-label={t("사이드바 열기", "Open sidebar")}
                onClick={() => setCollapsed(false)}
              >
                <PanelsTopLeft size={20} />
              </button>
            )}
            <span className="brand">P</span>
            <strong>{title}</strong>
            {page === "chat" && applicationId && (
              <>
                <span className="breadcrumb">/</span>
                <span>
                  {apps.data.find((a) => a.id === applicationId)?.title}
                </span>
              </>
            )}
          </div>
          <div className="workspace-tools">
            <SyncPanel />
            <OperationsPanel />
            <button
              aria-label={t("설정", "Settings")}
              onClick={() => setPage("settings")}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>
        {!session.accessToken && page !== "settings" && (
          <div className="connection-banner">
            <span>
              {t(
                "서버에 연결하면 지원과 문서를 불러옵니다.",
                "Connect to load your applications and documents.",
              )}
            </span>
            <button onClick={() => setPage("settings")}>
              {t("연결 설정", "Connect")}
            </button>
          </div>
        )}
        <div className="main-content">
          {page === "chat" ? (
            <ChatPage
              applicationId={applicationId}
              conversationId={conversationId}
              onConversation={(id) => {
                setConversationId(id);
                void conversations.reload();
              }}
              onNavigate={(page, id, versionId) => {
                if (page === "documents") {
                  setDocumentId(id || "");
                  setDocumentVersionId(versionId || "");
                }
                setPage(page);
              }}
            />
          ) : page === "applications" ? (
            <ApplicationsPage onOpen={openApplication} />
          ) : page === "documents" ? (
            <Suspense fallback={<div className="empty">…</div>}>
              <DocumentsPage
                key={`${documentId}:${documentVersionId}`}
                initialDocumentId={documentId}
                initialVersionId={documentVersionId}
              />
            </Suspense>
          ) : page === "career" ? (
            <CareerPage />
          ) : page === "calendar" ? (
            <CalendarPage />
          ) : page === "interviews" ? (
            <InterviewsPage />
          ) : page === "projects" ? (
            <ProjectsPage />
          ) : (
            <SettingsPage />
          )}
        </div>
      </main>
    </div>
  );
};
