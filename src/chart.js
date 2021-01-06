import Chart from 'chart.js'
import _ from 'lodash'

const chart = new Chart(
  document.getElementById('energy-chart'),
  {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Kinetic Energy',
          data: [],
          pointRadius: 0
        },
        {
          label: 'Total Energy',
          data: [],
          pointRadius: 0
        }
      ]
    },
    options: {
      scales: {
        xAxes: [{
          gridLines: { color: 'transparent' }
        }],
        yAxes: [{
          gridLines: { color: 'transparent' },
          ticks: { min: 0 }
        }]
      },
      animation: false,
      elements: { line: { tension: 0 } },
      events: []
    }
  }
)

const throttleWait = 100 // milliseconds
const asyncChartUpdate = () => _.delay(() => chart.update(), 0)
const updateChartThrottled = _.throttle(asyncChartUpdate, throttleWait)

export function updateChart ({ t, kineticEnergy, totalEnergy }) {
  const maxChartPoints = 250
  if (chart.data.labels.length >= maxChartPoints) {
    chart.data.labels.shift()
    chart.data.datasets.forEach(set => set.data.shift())
  }

  chart.data.labels.push('')
  chart.data.datasets[0].data.push({ x: t, y: kineticEnergy })
  chart.data.datasets[1].data.push({ x: t, y: totalEnergy })
  updateChartThrottled()
}
