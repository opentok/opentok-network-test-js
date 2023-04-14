import Highcharts from 'highcharts';

export function createChart(mediaType) {
  return new Highcharts.Chart({
    chart: {
      type: 'spline',
      renderTo: mediaType + 'Graph',
    },
    title: {
      text: mediaType + ' bitrate stability',
      style: {
        fontSize: '14px'
      }
    },
    subtitle: {
      text: '',
      style: {
        fontSize: '12px'
      }
    },
    xAxis: {
      title: {
        text: 'Time elapsed (sec)',
        style: {
          fontSize: '8px'
        }
      },
      labels: {
         style: {
          fontSize: '8px'
        }
      }
    },
    yAxis: {
      title: {
        text: 'Bitrate (KBps)',
        style: {
          fontSize: '8px'
        }
      },
      min: 0,
      minorGridLineWidth: 0,
      gridLineWidth: 0,
      alternateGridColor: null,
      plotBands: null,
      labels: {
        style: {
          fontSize: '8px'
        }
      }
    },
    tooltip: {
      headerFormat: '<b>{series.name}</b><br>',
      pointFormat: '{point.y:.2f} kBps'
    },
    plotOptions: {
      spline: {
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 3
          }
        },
        marker: {
          enabled: false
        },
        pointInterval: 1, // one hour
        color: '#0099CC'
      }
    },
    series: [{
        name: 'bitrate',
        data: [0],
        animation: false
    }],
    legend: false
  });
}

export const createRtcStatsChart = (mediaType, id, titleText, yAxisText) => {
  const graphsContainer = document.getElementById(`publisher-${mediaType}-graphs-container`);
  // Create a new div to hold the graph for the current videoStats
  const graphDiv = document.createElement("div");
  graphDiv.id = id;
  graphDiv.classList.add("graph");
  graphsContainer.appendChild(graphDiv);
  
  // Code to display the graph using videoStats and videoGraphDiv
  // Replace any existing reference to the videoGraph element with videoGraphDiv
  
  return new Highcharts.Chart({
    chart: {
      type: 'spline',
      renderTo: id,
    },
    title: {
      text: titleText,
      style: {
        fontSize: '14px'
      }
    },
    subtitle: {
      text: '',
      style: {
        fontSize: '12px'
      }
    },
    xAxis: {
      title: {
        text: 'Time elapsed (sec)',
        style: {
          fontSize: '8px'
        }
      },
      labels: {
        style: {
          fontSize: '8px'
        }
      }
    },
    yAxis: {
      title: {
        text: yAxisText,
        style: {
          fontSize: '8px'
        }
      },
      min: 0,
      minorGridLineWidth: 0,
      gridLineWidth: 0,
      alternateGridColor: null,
      plotBands: null,
      labels: {
        style: {
          fontSize: '8px'
        }
      }
    },
    tooltip: {
      headerFormat: '<b>{series.name}</b><br>',
      pointFormat: '{point.y:.2f}'
    },
    plotOptions: {
      spline: {
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 3
          }
        },
        marker: {
          enabled: false
        },
        pointInterval: 1,
        color: '#0099CC'
      }
    },
    series: [{
      name: '',
      data: [0],
      animation: false
    }],
    legend: false
  });
};
