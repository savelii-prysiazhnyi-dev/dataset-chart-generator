import React from 'react';
import { Database, ArrowUpRight } from 'lucide-react';
import type { DatasetChartType } from '../../types/dataset';

interface SampleDatasetsProps {
  onSelectSample: (file: File, preferredType: DatasetChartType) => void;
  disabled?: boolean;
}

const SAMPLES: {
  title: string;
  description: string;
  preferredType: DatasetChartType;
  fileName: string;
  csvContent: string;
}[] = [
  {
    title: 'Monthly Sales',
    description: 'Category & Value',
    preferredType: 'bar',
    fileName: 'monthly_sales.csv',
    csvContent: `Month,Sales,Customers\nJan,18500,420\nFeb,22100,510\nMar,19800,480\nApr,27400,630\nMay,31200,720\nJun,29500,680\nJul,34800,810\nAug,33200,790\nSep,38900,890\nOct,41200,940\nNov,45600,1050\nDec,52000,1200`,
  },
  {
    title: 'Market Share',
    description: 'Distribution',
    preferredType: 'pie',
    fileName: 'market_share.csv',
    csvContent: `Company,Share\nAlpha Corp,34\nBeta Inc,26\nGamma LLC,18\nDelta Systems,14\nOthers,8`,
  },
  {
    title: 'Height vs Weight',
    description: 'Scatter 2D',
    preferredType: 'scatter',
    fileName: 'height_weight.csv',
    csvContent: `Height_cm,Weight_kg\n155,50\n160,54\n162,58\n165,60\n168,63\n170,68\n172,70\n175,74\n178,79\n180,82\n183,85\n185,89\n188,92\n190,95`,
  },
];

export const SampleDatasets: React.FC<SampleDatasetsProps> = ({
  onSelectSample,
  disabled = false,
}) => {
  const handleLoadSample = (sample: typeof SAMPLES[number]) => {
    const blob = new Blob([sample.csvContent], { type: 'text/csv' });
    const file = new File([blob], sample.fileName, { type: 'text/csv' });
    onSelectSample(file, sample.preferredType);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
          Quick Samples
        </label>
        <span className="text-[11px] text-gray-400">1-click demo</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.title}
            type="button"
            onClick={() => handleLoadSample(sample)}
            disabled={disabled}
            className="flex flex-col text-left p-2.5 bg-white border border-gray-200 hover:border-gray-400 hover:shadow-xs rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <Database className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition-colors" />
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-black transition-colors" />
            </div>
            <span className="text-xs font-semibold text-gray-800 truncate">
              {sample.title}
            </span>
            <span className="text-[10px] text-gray-400 truncate">
              {sample.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
