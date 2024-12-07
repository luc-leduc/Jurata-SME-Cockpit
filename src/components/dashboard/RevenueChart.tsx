import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useRevenueChart } from "@/hooks/use-revenue-chart";
import { ChartTooltip } from "./ChartTooltip";
import { useTranslation } from "react-i18next";
import { translateMonth } from "@/lib/utils/date";

export function RevenueChart() {
  const { t } = useTranslation();
  const { data: revenueData = [], isLoading } = useRevenueChart();

  // Remove dots from month abbreviations
  const cleanedData = revenueData.map(item => ({
    ...item,
    month: translateMonth(item.month)
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {t('charts.revenue')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[350px] w-full flex items-center justify-center">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : cleanedData.length === 0 ? (
          <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
            {t('dashboard.revenue.noData', 'No revenue data available')}
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
                content={<ChartTooltip />}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                position={{ x: 0, y: 0 }}
                wrapperStyle={{ visibility: 'visible', pointerEvents: 'none' }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                maxBarSize={80}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-in"
                fill="hsl(var(--primary))"
                fillOpacity={0.85}
                activeBar={{ 
                  fillOpacity: 1,
                  style: { 
                    transform: 'scaleY(1.02)',
                    transformOrigin: 'bottom',
                    transition: 'transform 0.3s ease, fill-opacity 0.3s ease'
                  }
                }}
                isAnimationActive={true}
                onAnimationStart={(_, index) => {
                  // Stagger the fade-in animation
                  return index * 150;
                }}
                animationProps={[
                  {
                    attribute: "opacity",
                    from: 0,
                    to: 0.85
                  }
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}