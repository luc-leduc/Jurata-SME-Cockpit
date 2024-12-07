import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/services/profile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ProfitLossChart } from "@/components/dashboard/ProfitLossChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { TaskList } from "@/components/tasks/TaskList";
import { JurataAICard } from "@/components/dashboard/JurataAICard";

// Icons
import { Plus } from "lucide-react";

// Hooks
import { useImportantTasks } from "@/hooks/use-important-tasks";

function WelcomeMessage() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile
  });

  if (isLoading) {
    return <Skeleton className="h-9 w-64" />;
  }

  const name = profile?.first_name
    ? profile.first_name
    : t('dashboard.welcome.default', 'Welcome back');

  return <h2 className="text-4xl font-bold mt-4 mb-8">{t('dashboard.welcome.greeting', 'Hello')}, {name}</h2>;
}

function WelcomeText() {
  const { t } = useTranslation();
  return (
    <p className="text-muted-foreground text-lg mb-8">
      {t('dashboard.welcome.message', 'Welcome to your personal dashboard. Here you will find an overview of your most important tasks, current financial metrics, and the development of revenue and profit throughout the year.')}
    </p>
  );
}

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: tasks = [], isLoading: isLoadingTasks } = useImportantTasks();

  return (
    <div className="space-y-8">
      <WelcomeMessage />
      <WelcomeText />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-white dark:bg-background h-fit">
          <CardHeader>
            <div>
              <CardTitle className="text-2xl font-bold">{t('dashboard.tasks.title', 'Important Tasks')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('dashboard.tasks.description', 'Tasks due in the next 2 weeks')}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TaskList
              tasks={tasks}
              isLoading={isLoadingTasks}
              compact
              onTaskClick={(id) => navigate(`/tasks/${id}`)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/tasks')}>
                {t('dashboard.tasks.allTasks', 'All Tasks')}
              </Button>
              <Button onClick={() => navigate('/tasks/new')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('dashboard.tasks.newTask', 'New Task')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <JurataAICard />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-6">{t('dashboard.financialMetrics.title', 'Financial Metrics')}</h3>
        <div className="space-y-4">
          <h4 className="text-lg font-medium mb-2">{t('dashboard.financialMetrics.monthlyOverview', 'Monthly Overview')}</h4>
          <StatsOverview />
        </div>
      </div>

      <div className="mt-6 mb-1">
        <h3 className="text-lg font-medium">{t('dashboard.yearlyOverview.title', 'Yearly Overview 2024')}</h3>
      </div>

      <ProfitLossChart />
      <RevenueChart />
      <CashFlowChart />
    </div>
  );
}