import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import type { FastifyInstance } from 'fastify';
import ExcelJS from 'exceljs';

import { buildApp } from '../src/createApp.js';

const csvBuffer = (rows: string[][]): Buffer =>
  Buffer.from(rows.map(r => r.join(',')).join('\n'));

const SIMPLE_CSV = csvBuffer([
  ['month', 'sales'],
  ['Jan', '100'],
  ['Feb', '150'],
  ['Mar', '120'],
]);

const SCATTER_CSV = csvBuffer([
  ['height', 'weight'],
  ['170', '65'],
  ['180', '78'],
  ['165', '55'],
]);

const MULTI_COLUMN_CSV = csvBuffer([
  ['category', 'revenue', 'expenses', 'profit'],
  ['Q1', '1000', '600', '400'],
  ['Q2', '1500', '800', '700'],
  ['Q3', '1200', '700', '500'],
  ['Q4', '1800', '900', '900'],
]);

const ONE_COLUMN_CSV = csvBuffer([['name'], ['Jan'], ['Feb']]);

const EMPTY_CSV = csvBuffer([['name', 'value']]);

const createXlsxBuffer = async (
  headers: string[],
  rows: (string | number)[][],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data');
  sheet.addRow(headers);
  for (const row of rows) {
    sheet.addRow(row);
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
};

describe('Stateless Dataset Chart Generation API', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await buildApp();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    test('returns health status ok', async () => {
      const response = await request(app.server).get('/health');
      assert.equal(response.status, 200);
      assert.equal(response.body.status, 'ok');
      assert.equal(response.body.service, 'dataset-chart-generation-backend');
      assert.ok(response.body.timestamp);
    });
  });

  describe('POST /api/chart/generate-from-dataset', () => {
    test('successfully generates a bar chart from CSV', async () => {
      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', SIMPLE_CSV, { filename: 'sales.csv', contentType: 'text/csv' })
        .field('chartType', 'bar');

      assert.equal(response.status, 200);
      assert.ok(response.body.chartData?.option);
      assert.equal(response.body.selectedType, 'bar');
      assert.equal(response.body.selectedXField, 'month');
      assert.equal(response.body.selectedYField, 'sales');
      assert.equal(response.body.truncated, false);
      assert.equal(response.body.datasetInfo.fileName, 'sales.csv');
      assert.equal(response.body.datasetInfo.mimeType, 'text/csv');

      const option = response.body.chartData.option;
      assert.equal(option.series[0].type, 'bar');
      assert.deepEqual(option.xAxis.data, ['Jan', 'Feb', 'Mar']);
      assert.deepEqual(option.series[0].data, [100, 150, 120]);

      // Check fields
      const fields = response.body.fields;
      assert.equal(fields.length, 2);
      assert.deepEqual(fields.find((f: { name: string }) => f.name === 'month'), {
        name: 'month',
        type: 'string',
      });
      assert.deepEqual(fields.find((f: { name: string }) => f.name === 'sales'), {
        name: 'sales',
        type: 'number',
      });
    });

    test('generates a line chart with specified xField and yField', async () => {
      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', MULTI_COLUMN_CSV, { filename: 'finance.csv', contentType: 'text/csv' })
        .field('chartType', 'line')
        .field('xField', 'category')
        .field('yField', 'profit');

      assert.equal(response.status, 200);
      assert.equal(response.body.selectedType, 'line');
      assert.equal(response.body.selectedXField, 'category');
      assert.equal(response.body.selectedYField, 'profit');

      const option = response.body.chartData.option;
      assert.equal(option.series[0].type, 'line');
      assert.deepEqual(option.xAxis.data, ['Q1', 'Q2', 'Q3', 'Q4']);
      assert.deepEqual(option.series[0].data, [400, 700, 500, 900]);
    });

    test('generates a pie chart with category names and numeric values', async () => {
      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', SIMPLE_CSV, { filename: 'sales.csv', contentType: 'text/csv' })
        .field('chartType', 'pie');

      assert.equal(response.status, 200);
      assert.equal(response.body.selectedType, 'pie');

      const option = response.body.chartData.option;
      assert.equal(option.series[0].type, 'pie');
      assert.deepEqual(option.series[0].data, [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 150 },
        { name: 'Mar', value: 120 },
      ]);
    });

    test('generates a scatter chart with 2D numeric points', async () => {
      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', SCATTER_CSV, { filename: 'scatter.csv', contentType: 'text/csv' })
        .field('chartType', 'scatter');

      assert.equal(response.status, 200);
      assert.equal(response.body.selectedType, 'scatter');
      assert.equal(response.body.selectedXField, 'height');
      assert.equal(response.body.selectedYField, 'weight');

      const option = response.body.chartData.option;
      assert.equal(option.series[0].type, 'scatter');
      assert.deepEqual(option.series[0].data, [
        [170, 65],
        [180, 78],
        [165, 55],
      ]);
    });

    test('successfully generates a chart from an XLSX workbook', async () => {
      const xlsxBuffer = await createXlsxBuffer(
        ['Department', 'Headcount'],
        [
          ['Engineering', 45],
          ['Design', 12],
          ['Marketing', 20],
        ],
      );

      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', xlsxBuffer, {
          filename: 'departments.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .field('chartType', 'bar');

      assert.equal(response.status, 200);
      assert.equal(response.body.selectedType, 'bar');
      assert.equal(response.body.selectedXField, 'Department');
      assert.equal(response.body.selectedYField, 'Headcount');
      assert.deepEqual(response.body.chartData.option.xAxis.data, [
        'Engineering',
        'Design',
        'Marketing',
      ]);
      assert.deepEqual(response.body.chartData.option.series[0].data, [45, 12, 20]);
    });

    test('handles datasets exceeding 5000 rows by truncating', async () => {
      const largeRows = [['id', 'val']];
      for (let i = 1; i <= 5050; i += 1) {
        largeRows.push([`id_${i}`, `${i * 2}`]);
      }
      const largeCsv = csvBuffer(largeRows);

      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', largeCsv, { filename: 'large.csv', contentType: 'text/csv' })
        .field('chartType', 'line');

      assert.equal(response.status, 200);
      assert.equal(response.body.truncated, true);
      assert.equal(response.body.chartData.option.series[0].data.length, 5000);
    });

    test('returns 400 when no file is uploaded', async () => {
      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .field('chartType', 'bar');

      assert.equal(response.status, 400);
      assert.equal(response.body.message, 'File is required');
    });

    test('returns 400 when file format is unsupported', async () => {
      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', Buffer.from('hello plain text'), {
          filename: 'readme.txt',
          contentType: 'text/plain',
        });

      assert.equal(response.status, 400);
      assert.match(response.body.message, /Unsupported file type/);
    });

    test('returns 400 when CSV has less than two columns', async () => {
      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', ONE_COLUMN_CSV, {
          filename: 'single_col.csv',
          contentType: 'text/csv',
        });

      assert.equal(response.status, 400);
      assert.match(response.body.message, /Dataset must have at least two columns/);
    });

    test('returns 400 when CSV has no data rows', async () => {
      const response = await request(app.server)
        .post('/api/chart/generate-from-dataset')
        .attach('file', EMPTY_CSV, {
          filename: 'empty.csv',
          contentType: 'text/csv',
        });

      assert.equal(response.status, 400);
      assert.match(response.body.message, /File contains no data rows/);
    });
  });
});
