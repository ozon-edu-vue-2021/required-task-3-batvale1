<template>
  <Doughnut ref="chart" />
</template>

<script>
import { Doughnut } from 'vue-chartjs';

export default {
  name: 'MyDoughnut',

  components: {
    Doughnut
  },

  props: {
    legend: {
      type: Array,
      default: () => ([])
    }
  },

  mounted() {
    this.renderChart();
  },

  methods: {
    renderChart() {
      const chartData = {
        labels: this.legend.map((item) => item.text),
        datasets: [
          {
            backgroundColor: this.legend.map((item) => item.color),
            data: this.legend.map((item) => item.counter)
          }
        ]
      };
      const options = {
        legend: {
          display: false
        }
      };

      this.$refs.chart.renderChart(chartData, options);
    }
  }
};
</script>

<style scoped></style>
