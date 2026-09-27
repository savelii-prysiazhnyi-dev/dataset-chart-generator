import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Loader2, BarChart2, AlertCircle } from 'lucide-react';
import type { ChartConfig } from '../../types/dataset';

interface ChartPreviewProps {
  chartData: ChartConfig | null;
  generating: boolean;
  error?: string | null;
  chartTitle?: string;
}

const DEFAULT_TOOLBOX = {
  show: true,
  right: 16,
  top: 16,
  itemSize: 18,
  feature: {
    restore: { title: 'Restore' },
    saveAsImage: {
      title: 'Save as image',
      type: 'png',
      pixelRatio: 2,
    },
  },
};

export const ChartPreview: React.FC<ChartPreviewProps> = ({
  chartData,
  generating,
  error,
  chartTitle,
}) => {
  const mergedOption = useMemo(() => {
    if (!chartData?.option) return null;

    const option = { ...chartData.option };
    option.toolbox = {
      ...DEFAULT_TOOLBOX,
      ...(option.toolbox as Record<string, unknown>),
    };

    if (chartTitle && chartTitle.trim()) {
      option.title = {
        text: chartTitle.trim(),
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#111827',
        },
      };
    }

    return option;
  }, [chartData, chartTitle]);

  return (
    <div className="w-full h-full min-h-[460px] bg-white border border-gray-200 rounded-2xl shadow-xs flex flex-col relative overflow-hidden">
      {/* Top bar info */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            ECharts Preview Canvas
          </span>
        </div>
        {chartData && (
          <span className="text-xs text-gray-400">
            Toolbox active (save image, restore)
          </span>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="relative flex-1 p-4 flex items-center justify-center min-h-[400px]">
        {/* Loading Overlay */}
        {generating && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs transition-opacity">
            <Loader2 className="w-8 h-8 animate-spin text-gray-900 mb-2" />
            <span className="text-sm font-medium text-gray-700">
              Generating chart visualization...
            </span>
          </div>
        )}

        {/* Error Overlay */}
        {error && !generating && (
          <div className="absolute top-4 left-4 right-4 z-10 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Chart Render or Empty State */}
        {mergedOption ? (
          <div className="w-full h-full min-h-[380px]">
            <ReactECharts
              option={mergedOption}
              style={{ height: '100%', width: '100%', minHeight: '380px' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4 shadow-inner">
              <BarChart2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              No Dataset Loaded
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Upload a CSV or XLSX spreadsheet, or click one of the quick samples on the left to instantly render an interactive Apache ECharts visualization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
