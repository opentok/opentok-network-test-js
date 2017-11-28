import Highcharts from 'highcharts';

export default function createChart(mediaType) {
  var plotBands = {
    audio: [{
      'from': 30000,
      'to': 35000,
      'color': 'rgba(68, 170, 213, 0.1)',
      'label': {
        'text': 'Adequate',
        'style': {
          'color': '#606060',
          'fontSize': '8px'
        }
      }
    },
    {
      'from': 35000,
      'to': 40000,
      'color': 'rgba(0, 0, 0, 0)',
      'label': {
        'text': 'Excellent',
        'style': {
          'color': '#606060',
          'fontSize': '8px'
        }
      }
    }],
    video: [{
      'from': 200000,
      'to': 350000,
      'color': 'rgba(68, 170, 213, 0.1)',
      'label': {
        'text': 'Adequate',
        'style': {
          'color': '#606060',
          'fontSize': '8px'
        }
      }
    },
    {
      'from': 350000,
      'to': 600000,
      'color': 'rgba(0, 0, 0, 0)',
      'label': {
        'text': 'Good',
        'style': {
          'color': '#606060',
          'fontSize': '8px'
        }
      }
    },
    {
      'from': 600000,
      'to': 2000000,
      'color': 'rgba(68, 170, 213, 0.1)',
      'label': {
        'text': 'Excellent',
        'style': {
          'color': '#606060',
          'fontSize': '8px'
        }
      }
    }]
  };

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
        data: [0],
        animation: false
    }],
    legend: false
  });
}
