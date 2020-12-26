import Chart from "chart.js"

const chart = new Chart(
    document.getElementById("energy-chart"),
    {
        type: "line",
        data: {
            datasets: [{
                label: "Total Kinetic Energy",
                data: [],
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                xAxes: [{ gridLines: { color: "transparent" } }],
                yAxes: [{ gridLines: { color: "transparent" } }]
            },
            animation: {
                duration: 0
            },
            elements: {
                line: {
                    tension: 0
                }
            }
        }
    }
)

export function updateChart({ x, y }) {
    const maxChartPoints = 250
    if (chart.data.labels.length >= maxChartPoints) {
        chart.data.labels.shift()
        chart.data.datasets[0].data.shift()
    }

    chart.data.labels.push("")
    chart.data.datasets[0].data.push({ x, y })
    chart.update()
}