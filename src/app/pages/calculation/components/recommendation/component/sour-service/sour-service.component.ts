import { Component, ElementRef, ViewChild, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ChartData, ChartType, TooltipItem } from 'chart.js';
import { CommonModule } from '@angular/common';
import { mapRegion, region } from '../../../../../../core/enums/calculation.enum';

@Component({
  selector: 'app-sour-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sour-service.component.html',
  styleUrl: './sour-service.component.scss'
})

export class SourServiceComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  @Input() details: any;
  @Input() title: string = 'Position 4';
  chart!: Chart;
  Oirx: number = 0;
  sourServiceData: any;
  bgZone0: string = 'rgba(173, 216, 230, 0.2)';
  bgZone1: string = 'rgba(144, 238, 144, 0.2)';
  bgZone2: string = 'rgba(255, 255, 153, 0.2)';
  bgZone3: string = 'rgba(255, 99, 132, 0.2)';
  bgShadowBlurZone0: number = 0;
  bgShadowBlurZone1: number = 0;
  bgShadowBlurZone2: number = 0;
  bgShadowBlurZone3: number = 0;
  bgShadowColorZone0: string = 'rgba(0,0,0,0)';
  bgShadowColorZone1: string = 'rgba(0,0,0,0)';
  bgShadowColorZone2: string = 'rgba(0,0,0,0)';
  bgShadowColorZone3: string = 'rgba(0,0,0,0)';
  shadowOffsetXZone0: number = 0;
  shadowOffsetXZone1: number = 0;
  shadowOffsetXZone2: number = 0;
  shadowOffsetXZone3: number = 0;
  shadowOffsetYZone0: number = 0;
  shadowOffsetYZone1: number = 0;
  shadowOffsetYZone2: number = 0;
  shadowOffsetYZone3: number = 0;
  public scatterChartType: ChartType = 'scatter';

  public scatterChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [{ x: 0.1, y: 6}],
        label: 'Result',
        pointStyle: 'crossRot',
        radius: 8,
        backgroundColor: '#0CBA92',
        borderColor: '#0CBA92',
        pointBorderWidth: 3,
        pointHoverRadius: 10
      },
      {
        data: [
          { x: 0, y: 3.5 },
          { x: 0.001, y: 3.5 },
          { x: 0.001, y: 3.5 },
          { x: 0.0035, y: 4 },
          { x: 0.001, y: 3.5 },
          { x: 0.0035, y: 3.5 },
          { x: 0.001, y: 3.5 },
          { x: 0.001, y: 2.5 },
        ],
        label: 'เส้นแบ่งโซน 0/1',
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderDash: [],
        fill: false,
        showLine: true,
        pointRadius: 0,
        hoverRadius: 0,
        hoverBackgroundColor: 'transparent',
        hoverBorderColor: 'transparent',
        hitRadius: 0,
      },
      {
        data: [
          { x: 0.0035, y: 2.5 },
          { x: 0.0035, y: 7 },
        ],
        label: 'เส้นแบ่งโซน 0/1',
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
        fill: false,
        showLine: true,
        pointRadius: 0,
      },
      {
        data: [
          { x: 0.0035, y: 4 },
          { x: 1, y: 6.5 },
          { x: 1, y: 6.5 },
          { x: 10, y: 6.5 },
        ],
        label: 'เส้นแบ่งโซน 0/1',
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderDash: [],
        fill: false,
        showLine: true,
        pointRadius: 0,
        hoverRadius: 0,
        hoverBackgroundColor: 'transparent',
        hoverBorderColor: 'transparent',
        hitRadius: 0,
      },
      {
        data: [
          { x: 0.0035, y: 3.5 },
          { x: 0.01, y: 3.5 },
          { x: 1, y: 5.5 },
          { x: 1, y: 5.5 },
          { x: 10, y: 5.5 },
        ],
        label: 'เส้นแบ่งโซน 0/1',
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderDash: [],
        fill: false,
        showLine: true,
        pointRadius: 0,
        hoverRadius: 0,
        hoverBackgroundColor: 'transparent',
        hoverBorderColor: 'transparent',
        hitRadius: 0,
      }
    ]
  };

  public scatterChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'logarithmic',
        title: {
          display: true,
          text: 'H₂S Partial Pressure (bar)'
        },
        min: 0.0001,
        max: 10,
        grid: {
          drawOnChartArea: true,
        },
        ticks: {
          callback: function (value) {
            return value.toString();
          }
        },
        afterBuildTicks: (scale) => {
          scale.ticks = [
            { value: 0 },
            { value: 0.001 },
            { value: 0.0035 },
            { value: 0.01 },
            { value: 0.1 },
            { value: 1 },
            { value: 10 },
          ];
          return scale.ticks;
        }
      },
      y: {
        title: {
          display: true,
          text: 'In-situ pH'
        },
        min: 2.5,
        max: 7,
        grid: {
          drawOnChartArea: true,
        },
        ticks: {
          stepSize: 0.5
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: (legendItem: any, chartData: ChartData<'scatter'>) => {
            return legendItem.text !== 'เส้นแบ่งโซน 0/1' && legendItem.text !== 'Result';
          }
        }
      },
      tooltip: {
        callbacks: {
          title: (context: TooltipItem<'scatter'>[]): string => {
            return `H₂S: ${this.formatValue(context[0].parsed.x)} bar`;
          },
          label: (context: TooltipItem<'scatter'>): string => {
            if (context.dataset.label === 'เส้นแบ่งโซน 0/1') return '';
            return `pH: ${this.formatValue(context.parsed.y)}`;
          }
        }
      },
    }
  };

  ngAfterViewInit(): void {
    if (this.chartCanvas) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['details']) {
      this.mappingDataChart();
      this.highlightZone();
    }
  }

  mappingDataChart() {
    this.sourServiceData = this.details[0].items.find((e: any) => e.type === 'sour_service');
    this.scatterChartData.datasets[0].data = [{
      x: this.sourServiceData.details.xCoordinate  < 0.001 ?  0 : this.sourServiceData.details.xCoordinate,
      y: this.sourServiceData.details.yCoordinate
    }]
  }

  highlightZone() {
    switch (this.displayRegion(this.sourServiceData?.input?.pipelineDesignRegion)) {
      case region.REGION_NAME_0:
        this.bgZone0 = 'rgba(173, 216, 230, 2)';
        this.bgShadowBlurZone0 = 8;
        this.bgShadowColorZone0 = 'rgba(0,0,0,0.5)';
        this.shadowOffsetXZone0 = 2;
        this.shadowOffsetYZone0 = 2;
        break;
      case region.REGION_NAME_1:
        this.bgZone1 = 'rgba(144, 238, 144, 2)';
        this.bgShadowBlurZone1 = 8;
        this.bgShadowColorZone1 = 'rgba(0,0,0,0.5)';
        this.shadowOffsetXZone1 = 2;
        this.shadowOffsetYZone1 = 2;
        break;
      case region.REGION_NAME_2:
        this.bgZone2 = 'rgba(255, 255, 153, 2)';
        this.bgShadowBlurZone2 = 8;
        this.bgShadowColorZone2 = 'rgba(0,0,0,0.5)';
        this.shadowOffsetXZone2 = 2;
        this.shadowOffsetYZone2 = 2;
        break;
      case region.REGION_NAME_3:
        this.bgZone3 = 'rgba(255, 99, 132, 1)';
        this.bgShadowBlurZone3 = 8;
        this.bgShadowColorZone3 = 'rgba(0,0,0,0.5)';
        this.shadowOffsetXZone3 = 2;
        this.shadowOffsetYZone3 = 2;
        break;
      default:
        break;
    }
  }

  displayRegion(text: string): string {
    return mapRegion[text] ?? '';
  }

  createChart(): void {
    Chart.register(...registerables);

    this.chart = new Chart(this.chartCanvas!.nativeElement, {
      type: this.scatterChartType,
      data: this.scatterChartData,
      options: this.scatterChartOptions,
      plugins: [
        {
          id: 'backgroundZone',
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const xScale = chart.scales['x'];
            const yScale = chart.scales['y'];

            ctx.save();
            ctx.fillStyle = this.bgZone0;
            ctx.shadowColor = this.bgShadowColorZone0;
            ctx.shadowBlur = this.bgShadowBlurZone0;
            ctx.shadowOffsetX = this.shadowOffsetXZone0;
            ctx.shadowOffsetY = this.shadowOffsetYZone0;
            ctx.beginPath();
            ctx.moveTo(xScale.getPixelForValue(xScale.min), yScale.getPixelForValue(7));
            ctx.lineTo(xScale.getPixelForValue(xScale.min), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(0.001), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(0.001), yScale.getPixelForValue(7));
            ctx.moveTo(xScale.getPixelForValue(0.001), yScale.getPixelForValue(3.5));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(4));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(7));
            ctx.lineTo(xScale.getPixelForValue(0.001), yScale.getPixelForValue(7));
            ctx.closePath();
            ctx.fill();
            ctx.restore();

           
            ctx.save();
            ctx.fillStyle = this.bgZone1;
            ctx.shadowColor = this.bgShadowColorZone1;
            ctx.shadowBlur = this.bgShadowBlurZone1;
            ctx.shadowOffsetX = this.shadowOffsetXZone1;
            ctx.shadowOffsetY = this.shadowOffsetYZone1;
            ctx.beginPath();
            ctx.moveTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(4));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(6.5));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(7));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(7));
            ctx.moveTo(xScale.getPixelForValue(1), yScale.getPixelForValue(6.5));
            ctx.lineTo(xScale.getPixelForValue(10), yScale.getPixelForValue(6.5));
            ctx.lineTo(xScale.getPixelForValue(10), yScale.getPixelForValue(7));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(7));
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = this.bgZone2;
            ctx.shadowColor = this.bgShadowColorZone2;
            ctx.shadowBlur = this.bgShadowBlurZone2;
            ctx.shadowOffsetX = this.shadowOffsetXZone2;
            ctx.shadowOffsetY = this.shadowOffsetYZone2;
            ctx.beginPath();
            ctx.moveTo(xScale.getPixelForValue(0.001), yScale.getPixelForValue(3.5));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(3.5));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(4));
            ctx.moveTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(3.5));
            ctx.lineTo(xScale.getPixelForValue(0.01), yScale.getPixelForValue(3.5));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(4));
            ctx.moveTo(xScale.getPixelForValue(0.01), yScale.getPixelForValue(3.5));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(5.5));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(6.5));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(4));
            ctx.moveTo(xScale.getPixelForValue(1), yScale.getPixelForValue(5.5));
            ctx.lineTo(xScale.getPixelForValue(10), yScale.getPixelForValue(5.5));
            ctx.lineTo(xScale.getPixelForValue(10), yScale.getPixelForValue(6.5));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(6.5));
            ctx.closePath();
            ctx.fill();
            ctx.restore();


            ctx.save();
            ctx.fillStyle = this.bgZone3;
            ctx.shadowColor = this.bgShadowColorZone3;
            ctx.shadowBlur = this.bgShadowBlurZone3;
            ctx.shadowOffsetX = this.shadowOffsetXZone3;
            ctx.shadowOffsetY = this.shadowOffsetYZone3;
            ctx.beginPath();
            ctx.moveTo(xScale.getPixelForValue(0.001), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(3.5));
            ctx.lineTo(xScale.getPixelForValue(0.001), yScale.getPixelForValue(3.5));
            ctx.moveTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(0.01), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(0.01), yScale.getPixelForValue(3.5));
            ctx.lineTo(xScale.getPixelForValue(0.0035), yScale.getPixelForValue(3.5));
            ctx.moveTo(xScale.getPixelForValue(0.01), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(5.5));
            ctx.lineTo(xScale.getPixelForValue(0.01), yScale.getPixelForValue(3.5));
            ctx.moveTo(xScale.getPixelForValue(1), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(10), yScale.getPixelForValue(2.5));
            ctx.lineTo(xScale.getPixelForValue(10), yScale.getPixelForValue(5.5));
            ctx.lineTo(xScale.getPixelForValue(1), yScale.getPixelForValue(5.5));
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        },
        {
          id: 'zoneLabel',
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const xScale = chart.scales['x'];
            const yScale = chart.scales['y'];

            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Zone 0', xScale.getPixelForValue(0.0003), yScale.getPixelForValue(6));
            ctx.fillText('Zone 1', xScale.getPixelForValue(0.03), yScale.getPixelForValue(6));
            ctx.fillText('Zone 2', xScale.getPixelForValue(2), yScale.getPixelForValue(6));
            ctx.fillText('Zone 3', xScale.getPixelForValue(2), yScale.getPixelForValue(3.5));
            ctx.restore();
          }
        }
      ]
    });
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
