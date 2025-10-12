import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartData, LegendItem, registerables } from 'chart.js';
@Component({
  selector: 'app-pressure-profile',
  imports: [CommonModule],
  templateUrl: './pressure-profile.component.html',
  styleUrl: './pressure-profile.component.scss'
})
export class PressureProfileComponent {

  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  @Input() details: any;
  @Input() title: string = 'Position 4';
  chart!: Chart;
  pressureData: any;
  pipeLineLength: any;
  criteriaUs: any;
  criteriaPipeLine: any;
  backPressure: any
  chartX: number = 0;
  chartY: number = 0;
  ngAfterViewInit(): void {
    if (this.chartCanvas) {
      this.createChart();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['details']) {
      this.mappingDataChart();
    }
  }

  mappingDataChart() {
    this.pressureData = this.details[0].items.find((e: any) => e.type === 'pressure');
    this.pipeLineLength = this.pressureData?.details?.map((e: any) => {
      return {
        name: e.name,
        data: {
          x: e.data[e.data.length - 1].xCoordinate,
          y: e.data[e.data.length - 1].yCoordinate
        }
      }
    })

    const criteriaUsData = this.pressureData.criteria.find((e: any) => e.name === 'U/S Platform Pressure');
    const criteriaPipeLineData = this.pressureData.criteria.find((e: any) => e.name === 'Pipeline Design Pressure');
    this.criteriaUs = [{ x: 0, y: criteriaUsData?.value }, { x: 0, y: criteriaUsData?.value }];
    this.criteriaPipeLine = [{ x: 0, y: criteriaPipeLineData?.value }, { x: 0, y: criteriaPipeLineData?.value }];
    this.backPressure = this.pressureData?.details?.flatMap((detail: any) =>
      detail.data.map((point: any) => ({
        x: point.xCoordinate,
        y: point.yCoordinate
      }))
    ) ?? [];

    const overAll = [...this.criteriaUs, ...this.criteriaPipeLine, ...this.backPressure];
    const maxX = Math.max(...overAll.map(item => item.x));
    const maxY = Math.max(...overAll.map(item => item.y));
    const convertNumX = Math.floor(maxX / 1000) * 1000;
    const convertNumY = Math.floor(maxY / 10) * 10;
    this.chartX = convertNumX + 2000;
    this.chartY = convertNumY + 20;
    this.criteriaUs[1].x = this.chartX;
    this.criteriaPipeLine[1].x = this.chartX;
  }


  createChart(): void {

    Chart.register(...registerables);

    const yMax = this.chartY;
    const groupConfig: Record<string, string[]> = {
      "Pipeline/Riser": ["Riser Down", "Pipeline Hot", "Pipeline Cold 1", "Pipeline Cold 2", "Riser Up"]
    };
    const hiddenLabels = ["Riser Down", "Pipeline Hot", "Pipeline Cold 1", "Pipeline Cold 2", "Riser Up"];

    const createVerticalLine = (
      label: string,
      x: number,
      y: number,
      color = 'orange',
      borderWidth = 2,
      borderDash = [5, 5]
    ) => ({
      label: label,
      data: [
        { x: x, y: 0 },
        { x: x, y: yMax }
      ],
      borderColor: color,
      borderWidth: borderWidth,
      fill: false,
      showLine: true,
      borderDash: [5, 5],
      pointRadius: 0,
      pointHoverRadius: 0,
      segment: {
        borderDash: borderDash
      },
      hoverBackgroundColor: color,
      isReference: true,
      tooltip: {
        callbacks: {
          label: (context: {
            dataset: any; parsed: {
              y: any; x: any;
            }; formattedValue: any;
          }) => {
            const dataset = context.dataset as any;
            if (dataset.isReference) {
              if (context.parsed.y === 0) {
                return;
              }
              return `${dataset.label} : ${this.formatValue(context.parsed.x)}`;
            }

            return `${dataset.label} : ${this.formatValue(context.formattedValue)}`;
          }
        },

        mode: 'nearest',
        intersect: false
      }

    });



    this.chart = new Chart(this.chartCanvas!.nativeElement, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'U/S Wellhead Platform PAHH',
            data: this.criteriaUs,
            borderColor: '#7B7B7B',
            borderWidth: 2,
            fill: false,
            pointHoverBackgroundColor: '#7B7B7B',
            pointHoverBorderColor: '#475569',
            pointHoverBorderWidth: 3,
            pointHoverRadius: 8,
            hoverBorderWidth: 4
          },
          {
            label: 'Pipeline Design Pressure',
            data: this.criteriaPipeLine,
            borderColor: '#0291C7',
            borderWidth: 2,
            fill: false,
            pointHoverBackgroundColor: '#0291C7',
            pointHoverBorderColor: '#475569',
            pointHoverBorderWidth: 3,
            pointHoverRadius: 8,
            hoverBorderWidth: 4
          },
          {
            label: 'Back Pressure',
            data: this.backPressure,
            borderColor: '#0CBA92',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointHoverBackgroundColor: '#0CBA92',
            pointHoverBorderColor: '#475569',
            pointHoverBorderWidth: 3,
            pointHoverRadius: 8,
            hoverBorderWidth: 4
          },

          createVerticalLine(this.pipeLineLength.find((e: any) => e.name === 'Riser Down').name, this.pipeLineLength.find((e: any) => e.name === 'Riser Down').data.x, 0, 'orange'),
          createVerticalLine(this.pipeLineLength.find((e: any) => e.name === 'Pipeline Hot').name, this.pipeLineLength.find((e: any) => e.name === 'Pipeline Hot').data.x, 0, 'orange'),
          createVerticalLine(this.pipeLineLength.find((e: any) => e.name === 'Pipeline Cold 1').name, this.pipeLineLength.find((e: any) => e.name === 'Pipeline Cold 1').data.x, 0, 'orange'),
          createVerticalLine(this.pipeLineLength.find((e: any) => e.name === 'Pipeline Cold 2').name, this.pipeLineLength.find((e: any) => e.name === 'Pipeline Cold 2').data.x, 0, 'orange'),
          createVerticalLine(this.pipeLineLength.find((e: any) => e.name === 'Riser Up').name, this.pipeLineLength.find((e: any) => e.name === 'Riser Up').data.x, 0, 'orange')
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: this.chartX,
            title: {
              display: true,
              text: 'Length (m) '
            }
          },
          y: {
            min: 0,
            max: yMax,
            title: {
              display: true,
              text: 'Pressure (barg)'
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              generateLabels: function (chart: Chart): LegendItem[] {
                const datasets = chart.data.datasets;
                const usedGroups: Set<string> = new Set();

                return datasets.map((ds, i) => {
                  const groupName =
                    Object.keys(groupConfig).find(g =>
                      groupConfig[g].includes(ds.label ?? "")
                    ) || ds.label || "";

                  const meta = chart.getDatasetMeta(i);
                  return {
                    text: groupName,
                    fillStyle: (ds as any).backgroundColor ?? "transparent",
                    strokeStyle: (ds as any).borderColor ?? "transparent",
                    hidden: !chart.isDatasetVisible(i),
                    lineCap: (ds as any).borderCapStyle ?? "butt",
                    lineDash: (ds as any).borderDash ?? [],
                    lineDashOffset: (ds as any).borderDashOffset ?? 0,
                    lineJoin: (ds as any).borderJoinStyle ?? "miter",
                    lineWidth: (ds as any).borderWidth ?? 1,
                    pointStyle: (ds as any).pointStyle ?? "circle",
                    rotation: (ds as any).rotation ?? 0,
                    datasetIndex: i
                  };
                }).filter(item => {
                  if (usedGroups.has(item.text)) return false;
                  usedGroups.add(item.text);
                  return true;
                });
              }
            }
          },
          tooltip: {
            filter: (item) => {
              const label = item.dataset?.label ?? '';
              if (hiddenLabels.includes(label) && item.parsed?.y === 0) {
                return false;
              }
              return true;
            },
            callbacks: {
              label: (context) => {
                const datasetLabel = context.dataset.label ?? '';
                return `${datasetLabel} : ${this.formatValue(context.formattedValue)}`;
              }
            }
          }

        }
      }
    });
  }

  displayOneDecimal(value: number): string {
  return value?.toFixed(1);
}
  formatValue(valueOrItem: any, verification?: string): string {
    const value = typeof valueOrItem === 'object' ? valueOrItem.value : valueOrItem;
    const key = typeof valueOrItem === 'object' ? valueOrItem.verification : verification;

    const isIntegerLike = (num: number) => Math.abs(num - Math.round(num)) < 1e-9;

    switch (key) {
      default:
        if (isIntegerLike(value)) {
          return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
    }
  }
}
