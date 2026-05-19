import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import { TrendingUp } from 'lucide-react'
import type { WeightEntry } from '@/types/bariatric'

interface WeightChartProps {
  entries: WeightEntry[]
  targetWeight: number
  initialWeight: number
}

export default function WeightChart({ entries, targetWeight, initialWeight }: WeightChartProps) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [entries],
  )

  const hasRegain = useMemo(() => {
    if (sorted.length < 3) return false
    return sorted[sorted.length - 1].weight_kg > sorted[sorted.length - 3].weight_kg
  }, [sorted])

  const series = useMemo(
    () => [
      {
        name: 'Peso (kg)',
        data: sorted.map((e: WeightEntry) => e.weight_kg),
      },
    ],
    [sorted],
  )

  const chartOptions = useMemo(
    () => ({
      chart: {
        fontFamily: 'Outfit, sans-serif',
        toolbar: { show: false },
      },
      colors: ['#0f2743'],
      stroke: {
        curve: 'smooth' as const,
        width: 3,
      },
      markers: {
        size: 4,
        colors: sorted.map((e: WeightEntry) =>
          e.weight_kg > initialWeight ? '#ef4444' : '#0f2743',
        ),
        strokeWidth: 0,
      },
      xaxis: {
        categories: sorted.map((e: WeightEntry) =>
          new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        ),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#94a3b8', fontFamily: 'Outfit, sans-serif' },
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#94a3b8', fontFamily: 'Outfit, sans-serif' },
          formatter: (val: number) => `${val} kg`,
        },
      },
      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      annotations: {
        yaxis: [
          {
            y: targetWeight,
            borderColor: '#FFE14D',
            strokeDashArray: 6,
            label: {
              text: `Meta: ${targetWeight} kg`,
              borderColor: '#FFE14D',
              style: {
                color: '#0f2743',
                background: '#FFE14D',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '12px',
                padding: { left: 8, right: 8, top: 2, bottom: 2 },
              },
            },
          },
        ],
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) => `${val} kg`,
        },
      },
      dataLabels: { enabled: false },
    }),
    [sorted, targetWeight, initialWeight],
  )

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
        Evolucao de Peso
      </h3>
      {hasRegain && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <TrendingUp className="h-4 w-4" />
          <span>Alerta: possivel reganho de peso detectado</span>
        </div>
      )}
      <div className="-ml-2">
        <Chart type="line" height={300} options={chartOptions} series={series} />
      </div>
    </div>
  )
}
