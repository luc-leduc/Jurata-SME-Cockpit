import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskSorting, type SortField, type SortDirection } from "@/components/tasks/TaskSorting";

// Hooks
import { useTasks } from "@/hooks/use-tasks";

export function Tasks() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { data: tasks = [], isLoading } = useTasks();
  const navigate = useNavigate();

  // Filter tasks based on search term
  const filteredTasks = tasks.filter((task) => {
    const searchTerm = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm) ||
      [
        task.creator?.first_name,
        task.creator?.last_name,
        task.assignee?.first_name,
        task.assignee?.last_name,
      ]
        .filter(Boolean)
        .some((text) => text?.toLowerCase().includes(searchTerm))
    );
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'due_date':
        // Handle null dates by putting them at the end
        if (!a.due_date && !b.due_date) comparison = 0;
        else if (!a.due_date) comparison = 1;
        else if (!b.due_date) comparison = -1;
        else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        break;

      case 'priority':
        const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
        comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        break;

      case 'created_at':
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        break;

      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t('tasksPage.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('tasksPage.description')}
          </p>
        </div>
        <Button asChild>
          <Link to="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('tasksPage.newTask')}
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder={t('tasksPage.search.placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <TaskSorting
          field={sortField}
          direction={sortDirection}
          onSort={handleSort}
        />
      </div>

      <TaskList
        tasks={sortedTasks}
        isLoading={isLoading}
        showFilters
        onTaskClick={(id) => navigate(`/tasks/${id}`)}
        noTasksMessage={search ? t('tasksPage.noResults') : t('tasksPage.noTasks')}
        loadingMessage={t('tasksPage.loading')}
      />
    </div>
  );
}