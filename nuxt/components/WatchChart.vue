<template>
  <canvas />
</template>

<script>
import moment from "moment";

import "chartjs-adapter-moment";
// moment.locale("id");
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  DatasetController,
} from "chart.js";

// Chart.defaults.global.tooltips.enabled = false;

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip
);

export default {
  // components: true,
  props: ["data", "sdate"],
  mounted() {
    // this.data.history.map((i) => {
    //   i.waktu = new Date(i.waktu);
    // });
    let startDate = this.sdate;
    let endDate = this.data.history[this.data.history.length - 1].waktu;

    // console.log(startDate);
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    this.data.history.unshift({
      num: 0,
      waktu: new Date(startDate.getTime() + 100),
    });
    this.data.history.unshift({ num: 0, waktu: startDate });

    let range = endDate - startDate;
    let tick = 10;
    let per = range / tick;
    let labels = [];
    for (let i = 0; i <= tick; i++) {
      labels.push(new Date(startDate.getTime() + per * i));
    }

    let ctx = this.$el.getContext("2d");

    let grid = {
      borderColor: "#c4c2c2",
      borderWidth: 2,
      color: "#383838",
    };

    let wChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: " Penonton",
            data: this.data.history,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 4,
            tension: 0.15,
            fill: true,
            pointHitRadius: 15,
          },
        ],
      },
      // plugins: [
      //   {
      //     beforeTooltipDraw: (chart) => {
      //       // console.log(chart);
      //       var ctx = chart.ctx;
      //       var xAxis = chart.scales["x"];
      //       var yAxis = chart.scales["y"];
      //       ctx.save();
      //       var lineAtIndex = chart.tooltip.caretX;
      //       console.log(chart);
      //       if (lineAtIndex) {
      //         var x = xAxis.getPixelForTick(lineAtIndex);
      //         ctx.save();
      //         ctx.strokeStyle = "#ffffff";
      //         ctx.globalAlpha = chart.tooltip.opacity;
      //         ctx.lineWidth = 4;
      //         ctx.beginPath();
      //         ctx.moveTo(lineAtIndex, yAxis.bottom);
      //         ctx.lineTo(lineAtIndex, yAxis.top);
      //         ctx.stroke();
      //         ctx.restore();
      //       }
      //     },
      //   },
      // ],

      options: {
        // plugins: {
        //   tooltip: {
        //     enabled: false,
        //     callbacks: {
        //       label: function(val, obj) {
        //         console.log(val);
        //       },
        //     },
        //   },
        // },
        elements: {
          point: {
            radius: 0,
          },
        },
        // aspectRatio: 3.5,
        parsing: {
          xAxisKey: "waktu",
          yAxisKey: "num",
        },
        scales: {
          x: {
            grid: grid,
            ticks: {
              font: {
                size: 9,
              },
              //   source: "labels",
              maxTicksLimit: 8,
              maxRotation: 0,
              color: "#c4c2c2",
            },
            type: "time",
            display: "auto",
            time: {
              unit: "minute",
              displayFormats: {
                minute: "HH:mm",
                hour: "HH:mm",
                min: "00:00",
                max: "23:59",
              },
            },
            title: {
              display: true,
              text: "Waktu",
              color: "#ffffff",
            },
          },
          y: {
            ticks: {
              color: "#c4c2c2",
              font: {
                size: 9,
              },
            },
            grid: grid,
            beginAtZero: true,
            // max: this.data.peak,
            title: {
              display: true,
              text: "Penonton",
              color: "#ffffff",
            },
          },
        },
      },
    });
  },
  //   data() {
  //     return {
  //       jpnRate: 135.79,
  //     };
  //   },
  //   computed: {
  //     user: function() {
  //       return this.$store.getters.getUser;
  //     },
  //   },
};
</script>
