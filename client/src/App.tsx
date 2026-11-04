import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { TaskComposer, TaskComposerHandle } from "./components/TaskComposer";
import { TaskList } from "./components/TaskList";
import { Toast } from "./components/Toast";
import { Preloader } from "./components/Preloader";
import { SmartCategoryGrid, SmartCategory } from "./components/SmartCategoryGrid";
import { AuthPage } from "./components/AuthPage";
import { AuthModal } from "./components/AuthModal";
import { GuestModal } from "./components/GuestModal";
import { ProfileModal } from "./components/ProfileModal";
import { useTheme } from "./hooks/useTheme";
import { useTasks } from "./hooks/useTasks";
import { useAuth } from "./hooks/useAuth";
import { usePwaInstall } from "./hooks/usePwaInstall";
import { TaskFilter } from "./types/task";
import { clearGuestTasks, migrateGuestTasksToCloud } from "./utils/syncBuffer";

const getLocalTodayIso = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const App: React.FC = () => {
  const [showPreloader, setShowPreloader] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [smartCategory, setSmartCategory] = useState<SmartCategory>("all");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  const composerRef = useRef<TaskComposerHandle>(null);
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { isInstallable, triggerInstall } = usePwaInstall();
  const {
    user,
    isGuest,
    isLoading: isAuthLoading,
    continueAsGuest,
    exitGuestMode,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getSessions,
    logoutAll,
    deleteAccount,
  } = useAuth();

  const {
    tasks,
    isLoading,
    filter,
    setFilter,
    search,
    setSearch,
    priorityFilter,
    setPriorityFilter,
    activeCount,
    completedCount,
    toast,
    dismissToast,
    isOffline,
    pendingSyncCount,
    syncNow,
    addTask,
    toggleTask,
    editTask,
    removeTask,
    clearCompleted,
    refresh,
  } = useTasks(isGuest, Boolean(user), continueAsGuest);

  const todayIso = getLocalTodayIso();

  const handleSelectCategory = (cat: SmartCategory) => {
    setSmartCategory(cat);
    if (cat === "completed") {
      setFilter("completed");
    } else if (cat === "today" || cat === "scheduled") {
      setFilter("active");
    } else {
      setFilter("all");
    }
  };

  const handleFilterChange = (newFilter: TaskFilter) => {
    setFilter(newFilter);
    if (newFilter === "completed") {
      setSmartCategory("completed");
    } else if (smartCategory === "completed") {
      setSmartCategory("all");
    }
  };

  const displayedTasks = tasks.filter((t) => {
    if (smartCategory === "today") {
      return !t.completed && Boolean(t.dueDate && t.dueDate.startsWith(todayIso));
    }
    if (smartCategory === "scheduled") {
      return !t.completed && Boolean(t.dueDate);
    }
    if (smartCategory === "completed") {
      return t.completed;
    }
    return true;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toUpperCase();
      const isInputActive =
        activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";

      if (e.key === "Escape") {
        if (editingTaskId) {
          e.preventDefault();
          setEditingTaskId(null);
          return;
        }
        if (composerRef.current) {
          composerRef.current.dismiss();
        }
        if (selectedTaskId) {
          setSelectedTaskId(null);
        }
        if (isInputActive) {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      if (isInputActive) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "c") {
        e.preventDefault();
        composerRef.current?.focus();
        return;
      }

      if (key === "e") {
        e.preventDefault();
        if (displayedTasks.length === 0) return;
        const targetId = selectedTaskId || displayedTasks[0].id;
        setSelectedTaskId(targetId);
        setEditingTaskId(targetId);
        return;
      }

      if (e.key === "ArrowDown" || key === "j") {
        e.preventDefault();
        if (displayedTasks.length === 0) return;
        const currentIndex = displayedTasks.findIndex((t) => t.id === selectedTaskId);
        const nextIndex =
          currentIndex >= 0 && currentIndex < displayedTasks.length - 1
            ? currentIndex + 1
            : 0;
        setSelectedTaskId(displayedTasks[nextIndex].id);
        return;
      }

      if (e.key === "ArrowUp" || key === "k") {
        e.preventDefault();
        if (displayedTasks.length === 0) return;
        const currentIndex = displayedTasks.findIndex((t) => t.id === selectedTaskId);
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : displayedTasks.length - 1;
        setSelectedTaskId(displayedTasks[prevIndex].id);
        return;
      }

      if (e.key === " " && selectedTaskId) {
        e.preventDefault();
        toggleTask(selectedTaskId);
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedTaskId) {
        e.preventDefault();
        removeTask(selectedTaskId);
        setSelectedTaskId(null);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayedTasks, selectedTaskId, editingTaskId, toggleTask, removeTask]);

  // render auth page if unauthenticated and not guest
  if (!isAuthLoading && !user && !isGuest) {
    return (
      <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-200">
        {showPreloader && (
          <Preloader onFinish={() => setShowPreloader(false)} />
        )}
        <AuthPage
          onLogin={async (payload) => {
            const success = await login(payload);
            if (success) {
              await migrateGuestTasksToCloud();
            }
            return success;
          }}
          onRegister={async (payload) => {
            const success = await register(payload);
            if (success) {
              await migrateGuestTasksToCloud();
            }
            return success;
          }}
          onContinueAsGuest={() => {
            continueAsGuest();
          }}
          resolvedTheme={resolvedTheme}
          onToggleTheme={toggleTheme}
          isInstallable={isInstallable}
          onInstall={triggerInstall}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-200">
      {showPreloader && (
        <Preloader onFinish={() => setShowPreloader(false)} />
      )}

      <div className="max-w-2xl mx-auto px-3.5 sm:px-6 pb-24 safe-bottom">
        <Header
          activeCount={activeCount}
          completedCount={completedCount}
          totalCount={tasks.length}
          theme={theme}
          resolvedTheme={resolvedTheme}
          onToggleTheme={toggleTheme}
          isOffline={isOffline}
          pendingSyncCount={pendingSyncCount}
          onSyncNow={syncNow}
          isInstallable={isInstallable}
          onInstall={triggerInstall}
          user={user}
          isGuest={isGuest}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenGuestModal={() => setIsGuestModalOpen(true)}
          onLogout={async () => {
            if (isGuest) {
              exitGuestMode();
            } else {
              await logout();
            }
          }}
        />

        <SmartCategoryGrid
          tasks={tasks}
          activeCategory={smartCategory}
          onSelectCategory={handleSelectCategory}
        />

        <TaskComposer ref={composerRef} onAdd={addTask} />

        <FilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          search={search}
          onSearchChange={setSearch}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          completedCount={completedCount}
          onClearCompleted={clearCompleted}
        />

        <main>
          <TaskList
            tasks={displayedTasks}
            isLoading={isLoading}
            filter={filter}
            search={search}
            selectedTaskId={selectedTaskId}
            editingTaskId={editingTaskId}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onStartEdit={(id) => {
              setSelectedTaskId(id);
              setEditingTaskId(id);
            }}
            onCancelEdit={() => setEditingTaskId(null)}
            onToggle={toggleTask}
            onEdit={editTask}
            onDelete={removeTask}
          />
        </main>

        <footer className="mt-16 pt-6 border-t border-app-border text-center space-y-2.5">
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-app-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-md bg-app-surface border border-app-border font-mono text-[10px] text-app-text shadow-2xs">
                C
              </kbd>
              <span>Compose</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-md bg-app-surface border border-app-border font-mono text-[10px] text-app-text shadow-2xs">
                E
              </kbd>
              <span>Edit</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-md bg-app-surface border border-app-border font-mono text-[10px] text-app-text shadow-2xs">
                Esc
              </kbd>
              <span>Dismiss</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-md bg-app-surface border border-app-border font-mono text-[10px] text-app-text shadow-2xs">
                ↑/↓
              </kbd>
              <span>Select</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-md bg-app-surface border border-app-border font-mono text-[10px] text-app-text shadow-2xs">
                Space
              </kbd>
              <span>Toggle</span>
            </span>
          </div>
          <p className="sm:hidden text-[11px] text-app-text-muted">
            Tap task to select • Double tap to edit
          </p>
          <p className="text-[11px] text-app-text-muted">
            Slate (Task List) by{" "}
            <a
              href="https://www.linkedin.com/in/John--Varghese"
              target="_blank"
              rel="noopener noreferrer"
              className="text-app-text-secondary hover:text-app-text underline-offset-2 hover:underline transition-colors"
            >
              John Varghese (J0X)
            </a>
          </p>
        </footer>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onRegister={register}
        onSuccess={async () => {
          await migrateGuestTasksToCloud();
          refresh();
        }}
        onContinueAsGuest={() => {
          continueAsGuest();
          refresh();
        }}
      />

      <GuestModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        taskCount={tasks.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onExitGuest={() => {
          exitGuestMode();
          refresh();
        }}
        onClearGuestTasks={() => {
          clearGuestTasks();
          refresh();
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateProfile={updateProfile}
        onChangePassword={changePassword}
        onGetSessions={getSessions}
        onLogoutAll={async () => {
          await logoutAll();
          refresh();
        }}
        onLogout={async () => {
          await logout();
          refresh();
        }}
        onDeleteAccount={async (payload) => {
          await deleteAccount(payload);
          refresh();
        }}
      />
    </div>
  );
};

export default App;
