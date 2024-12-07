import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { useProfitLossChart } from "@/hooks/use-profit-loss-chart";
import { useTranslation } from "react-i18next";
import { translateMonth } from "@/lib/utils/date";

export function ProfitLossChart() {
  const { t } = useTranslation();
  const { data: profitLossData = [], isLoading } = useProfitLossChart();

  // Remove dots from month abbreviations
  const cleanedData = profitLossData.map(item => ({
    ...item,
    month: translateMonth(item.month)
  }));

  // Calculate totals
  const totalProfit = cleanedData.reduce((sum, item) => 
    item.value > 0 ? sum + item.value : sum, 0
  );
  const totalLoss = cleanedData.reduce((sum, item) => 
    item.value < 0 ? sum + Math.abs(item.value) : sum, 0
  );

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">{t('charts.profitLoss')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t('charts.profitLoss.subtitle', 'Monthly business result development')}
          </p>
        </div>
        <div className="text-sm text-right">
          <div>
            <span className="text-green-500 font-medium">{t('charts.profitLoss.totalProfit', 'Total Profit')}:</span>
            <span className="ml-2 tabular-nums">
              CHF {totalProfit.toLocaleString('de-CH', { 
                minimumFractionDigits: 2 
              })}
            </span>
          </div>
          <div>
            <span className="text-red-500 font-medium">{t('charts.profitLoss.totalLoss', 'Total Loss')}:</span>
            <span className="ml-2 tabular-nums">
              CHF {totalLoss.toLocaleString('de-CH', { 
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
            {t('charts.noDataAvailable', 'No data available')}
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
                  const isProfit = data.value >= 0;
                  
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg min-w-[300px]">
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {t('charts.month', 'Month')}
                        </span>
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {t('charts.result', 'Result')}
                        </span>
                        <span className="font-medium">
                          {data.month}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={isProfit ? "text-green-500" : "text-red-500"}>
                              {isProfit ? t('charts.profit', 'Profit') : t('charts.loss', 'Loss')}
                            </span>
                            <span className="font-medium tabular-nums">
                              {Math.abs(data.value).toLocaleString('de-CH', {
                                style: 'currency',
                                currency: 'CHF'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{t('charts.revenue.short')}</span>
                            <span className="tabular-nums">
                              {data.revenue.toLocaleString('de-CH', {
                                style: 'currency',
                                currency: 'CHF'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{t('charts.expenses', 'Expenses')}</span>
                            <span className="tabular-nums">
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
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                maxBarSize={80}
                fill="currentColor"
                className="text-primary"
                fillOpacity={0.85}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-in"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}