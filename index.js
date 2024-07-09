let allData = [];

async function fetchData() {
  const response = await fetch('data.json');
  const data = await response.json();
  allData = data.filter(order => order.size === 'XL' || order.size === 'XXL'); // Filter data for XL and XXL sizes
  return allData;
}

function parseDate(dateString) {
  const [month, day, year] = dateString.split('/');
  return new Date(`${year}-${month}-${day}`);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function isValidNumber(value) {
  return !isNaN(value) && isFinite(value);
}

async function visualizeData(sizeFilter = "", dateFilter = "") {
  const jsonData = allData.filter(order => {
    const orderDate = parseDate(order.date);
    const matchesSize = sizeFilter ? order.size === sizeFilter : true;
    const matchesDate = dateFilter ? isValidDate(orderDate) && orderDate.toISOString().split('T')[0] === new Date(dateFilter).toISOString().split('T')[0] : true;
    return matchesSize && matchesDate;
  });

  console.log("Filtered Data:", jsonData);

  const sizes = {};
  let totalOrders = 0;
  let totalIncome = 0;
  let totalPizzas = 0;

  jsonData.forEach(order => {
    const quantity = parseInt(order.quantity, 10);
    const income = parseFloat(order.income);

    if (isValidNumber(quantity) && isValidNumber(income)) {
      totalOrders += quantity;
      totalIncome += income;
      totalPizzas += quantity;
    }
    
    if (sizes[order.size]) {
      sizes[order.size] += 1;
    } else {
      sizes[order.size] = 1;
    }
  });

  const avgPizzaPerOrder = totalOrders ? (totalPizzas / totalOrders).toFixed(2) : 0;
  const avgOrderValue = totalOrders ? (totalIncome / totalOrders).toFixed(2) : 0;

  document.getElementById('number-of-orders').innerText = isValidNumber(totalOrders) ? totalOrders : '0';
  document.getElementById('total-revenue').innerText = isValidNumber(totalIncome) ? `$${totalIncome.toFixed(2)}` : '$0.00';
  document.getElementById('avg-pizza-per-order').innerText = isValidNumber(avgPizzaPerOrder) ? avgPizzaPerOrder : '0';
  document.getElementById('avg-order-value').innerText = isValidNumber(avgOrderValue) ? avgOrderValue : '0';
  document.getElementById('count-of-pizza-sizes').innerText = Object.keys(sizes).length;

  const sizeLabels = Object.keys(sizes);
  const sizeData = Object.values(sizes);

  const ctx = document.getElementById("myChart")?.getContext("2d");
  const ctp = document.getElementById("pieChart")?.getContext("2d");
  const ctxBar = document.getElementById("barChart")?.getContext("2d");

  // Clear existing charts if any
  if (window.barChart && typeof window.barChart.destroy === 'function') window.barChart.destroy();
  if (window.pieChart && typeof window.pieChart.destroy === 'function') window.pieChart.destroy();
  if (window.barChart3 && typeof window.barChart3.destroy === 'function') window.barChart3.destroy();

  window.barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sizeLabels,
      datasets: [
        {
          label: "# of Orders",
          data: sizeData,
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          grid: {
            display: false
          }
        },
      },
    },
  });

  window.pieChart = new Chart(ctp, {
    type: "pie",
    data: {
      labels: sizeLabels,
      datasets: [
        {
          label: "# of Orders",
          data: sizeData,
          borderWidth: 1,
        },
      ],
    },
  });

  window.barChart3 = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: sizeLabels,
      datasets: [
        {
          label: "Quantity",
          data: sizeData,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            display: false
          }
        },
      },
    },
  });

  // Update barChart2 and lineChart
  createCharts(jsonData);
}

function processChartData(data) {
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  let quantityData = new Array(12).fill(0);
  let amountData = new Array(12).fill(0);

  data.forEach(order => {
    const date = parseDate(order.date);
    if (isValidDate(date)) {
      const month = date.getMonth();
      const quantity = parseInt(order.quantity, 10);
      const income = parseFloat(order.income);

      if (isValidNumber(quantity) && isValidNumber(income)) {
        quantityData[month] += quantity;
        amountData[month] += income;
      }
    }
  });
  return { months, quantityData, amountData };
}

function createCharts(data) {
  const { months, quantityData, amountData } = processChartData(data);

  const cty = document.getElementById("barChart2")?.getContext("2d");
  const ctz = document.getElementById("lineChart")?.getContext("2d");

  if (window.barChart2 && typeof window.barChart2.destroy === 'function') window.barChart2.destroy();
  if (window.lineChart && typeof window.lineChart.destroy === 'function') window.lineChart.destroy();

  window.barChart2 = new Chart(cty, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "quantity",
          data: quantityData,
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          grid: {
            display: false
          }
        },
      },
    },
  });

  window.lineChart = new Chart(ctz, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: "amount",
          data: amountData,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          stacked: true
        }
      }
    },
  });
}

fetchData().then(() => {
  visualizeData();
});

// Add event listener to the size filter
document.getElementById('size').addEventListener('change', (event) => {
  const selectedSize = event.target.value;
  const selectedDate = document.getElementById('date').value;
  console.log("Selected Size:", selectedSize);
  console.log("Selected Date:", selectedDate);
  visualizeData(selectedSize, selectedDate);
});

// Add event listener to the date filter
document.getElementById('date').addEventListener('change', (event) => {
  const selectedDate = event.target.value;
  const selectedSize = document.getElementById('size').value;
  console.log("Selected Date:", selectedDate);
  console.log("Selected Size:", selectedSize);
  visualizeData(selectedSize, selectedDate);
});
