import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCashFlow } from "@/hooks/use-cash-flow";
import { useTranslation } from "react-i18next";
import { translateMonth } from "@/lib/utils/date";

export function CashFlowChart() {
  const { t } = useTranslation();
  const { data: cashFlowData = [], isLoading } = useCashFlow();

  // Remove dots from month abbreviations and calculate totals
  const cleanedData = cashFlowData.map(item => ({
    ...item,
    month: translateMonth(item.month)
  }));

  const totalInflow = cleanedData.reduce((sum, item) => sum + item.income, 0);
  const totalOutflow = cleanedData.reduce((sum, item) => sum + item.expenses, 0);

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">
            {t('charts.cashFlow')}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t('charts.cashFlow.subtitle')}
          </p>
        </div>
        <div className="text-sm text-right">
          <div>
            <span className="text-green-500 font-medium">
              {t('charts.cashFlow.inflow')}:
            </span>
            <span className="ml-2 tabular-nums">
              CHF {totalInflow.toLocaleString('de-CH', { 
                minimumFractionDigits: 2 
              })}
            </span>
          </div>
          <div>
            <span className="text-red-500 font-medium">
              {t('charts.cashFlow.outflow')}:
            </span>
            <span className="ml-2 tabular-nums">
              CHF {totalOutflow.toLocaleString('de-CH', { 
                minimumFractionDigits: 2 
              })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[350px] w-full flex items-center justify-center">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : cleanedData.length === 0 ? (
          <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
            {t('charts.noDataAvailable')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={cleanedData}>
              <XAxis
                height={50}
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                width={80}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => 
                  `CHF ${(value / 1000).toLocaleString('de-CH')}k`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  
                  const data = payload[0].payload;
                  
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg min-w-[300px]">
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {t('charts.month')}
                        </span>
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {t('charts.amount')}
                        </span>
                        <span className="font-medium">
                          {data.month}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-green-500">
                              {t('charts.cashFlow.inflow')}
                            </span>
                            <span className="font-medium tabular-nums">
                              {data.income.toLocaleString('de-CH', {
                                style: 'currency',
                                currency: 'CHF'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-red-500">
                              {t('charts.cashFlow.outflow')}
                            </span>
                            <span className="font-medium tabular-nums">
                              {data.expenses.toLocaleString('de-CH', {
                                style: 'currency',
                                currency: 'CHF'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
              />
              <Bar
                dataKey="income"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                fill="hsl(142.1 76.2% 36.3%)"
                fillOpacity={0.85}
                name={t('charts.cashFlow.inflow')}
              />
              <Bar
                dataKey="expenses"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                fill="hsl(346.8 77.2% 49.8%)"
                fillOpacity={0.85}
                name={t('charts.cashFlow.outflow')}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}