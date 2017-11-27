import Highcharts from 'highcharts';

export default function createChart(mediaType) {
  var plotBands = {
    audio: [{
      from: 25000,
      to: 38000,
      color: '#ecf6fb',
      label: {
        text: 'Adequate',
        style: {
          color: '#000',
          fontSize: '8px'
        }
      }
    }, {
      from: 38000,
      to: 60000,
      color: '#fff',
      label: {
        text: 'Excellent',
        style: {
          color: '#000',
          fontSize: '8px'
        }
      }
    }],
    video: [{
      from: 340000,
      to: 600000,
      color: '#ecf6fb',
      label: {
        text: 'Adequate',
        style: {
          color: '#000',
          fontSize: '8px'
        }
      }
    }, {
      from: 600000,
      to: 760000,
      color: '#fff',
      label: {
        text: 'Excellent',
        style: {
          color: '#000',
          fontSize: '8px'
        }
      }
    }]
  }
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
      plotBands: plotBands[mediaType],
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
        data: [0]
    }],
    legend: false
  });
}
