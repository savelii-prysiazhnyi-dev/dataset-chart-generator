import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { DatasetDropzone } from './components/chart/DatasetDropzone';
import { SampleDatasets } from './components/chart/SampleDatasets';
import { ChartTypeSelector } from './components/chart/ChartTypeSelector';
import { FieldSelectors } from './components/chart/FieldSelectors';
import { DetectedFieldsList } from './components/chart/DetectedFieldsList';
import { ChartPreview } from './components/chart/ChartPreview';
import { chartService } from './services/chartService';
import type {
  ChartConfig,
  DatasetChartType,
  DatasetField,
} from './types/dataset';

export const App: React.FC = () => {
  const [chartTitle, setChartTitle] = useState('Dataset Analysis');
  const [file, setFile] = useState<File | null>(null);
  const [chartType, setChartType] = useState<DatasetChartType>('bar');
  const [fields, setFields] = useState<DatasetField[]>([]);
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');
  const [truncated, setTruncated] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartConfig | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    targetFile: File,
    targetType: DatasetChartType,
    targetX?: string,
    targetY?: string,
  ) => {
    setGenerating(true);
    setError(null);

    const result = await chartService.generateFromDataset(
      targetFile,
      targetType,
      targetX || undefined,
      targetY || undefined,
    );

    setGenerating(false);

    if (result.errorMessage || !result.data) {
      setError(result.errorMessage || 'Failed to generate chart');
      return;
    }

    const {
      chartData: newChartData,
      fields: newFields,
      selectedXField,
      selectedYField,
      truncated: isTruncated,
    } = result.data;

    setChartData(newChartData);
    setFields(newFields);
    setXField(selectedXField);
    setYField(selectedYField);
    setTruncated(isTruncated);
  };

  const handleFileSelect = (newFile: File | null) => {
    setFile(newFile);
    if (!newFile) {
      setChartData(null);
      setFields([]);
      setXField('');
      setYField('');
      setTruncated(false);
      setError(null);
      return;
    }

    // Default title from file name
    const rawName = newFile.name.replace(/\.[^/.]+$/, '');
    setChartTitle(rawName.charAt(0).toUpperCase() + rawName.slice(1));
    generate(newFile, chartType);
  };

  const handleSelectSample = (sampleFile: File, preferredType: DatasetChartType) => {
    setFile(sampleFile);
    setChartType(preferredType);
    setXField('');
    setYField('');
    const rawName = sampleFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    setChartTitle(rawName.charAt(0).toUpperCase() + rawName.slice(1));
    generate(sampleFile, preferredType);
  };

  const handleChartTypeSelect = (nextType: DatasetChartType) => {
    setChartType(nextType);
    if (file) {
      generate(file, nextType, xField, yField);
    }
  };

  const handleSelectX = (nextX: string) => {
    setXField(nextX);
    if (file) {
      generate(file, chartType, nextX, yField);
    }
  };

  const handleSelectY = (nextY: string) => {
    setYField(nextY);
    if (file) {
      generate(file, chartType, xField, nextY);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            {/* Chart Title input */}
            <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs">
              <label
                htmlFor="chart-title-input"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block"
              >
                Chart Title
              </label>
              <input
                id="chart-title-input"
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title..."
                className="w-full text-base font-semibold text-gray-900 border-b border-gray-200 pb-1 focus:border-black outline-none transition-colors"
              />
            </div>

            {/* File Upload Zone */}
            <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs space-y-4">
              <DatasetDropzone
                file={file}
                onFileSelect={handleFileSelect}
                disabled={generating}
              />

              <SampleDatasets
                onSelectSample={handleSelectSample}
                disabled={generating}
              />
            </div>

            {/* Type & Field Selectors */}
            <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs space-y-5">
              <ChartTypeSelector
                currentType={chartType}
                onSelect={handleChartTypeSelect}
                disabled={generating}
              />

              <FieldSelectors
                fields={fields}
                chartType={chartType}
                xField={xField}
                yField={yField}
                onSelectX={handleSelectX}
                onSelectY={handleSelectY}
                disabled={generating}
              />
            </div>

            {/* Detected Fields list */}
            {fields.length > 0 && (
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs">
                <DetectedFieldsList fields={fields} truncated={truncated} />
              </div>
            )}
          </div>

          {/* Visualization Column (Right) */}
          <div className="lg:col-span-7 xl:col-span-8 h-[600px] lg:h-[750px] sticky top-24">
            <ChartPreview
              chartData={chartData}
              generating={generating}
              error={error}
              chartTitle={chartTitle}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
