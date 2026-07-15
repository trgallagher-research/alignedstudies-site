/**
 * AlignED Report 2 — Charts
 *
 * Renders Chart.js visualisations on the Results page.
 * Only runs when document.body.dataset.page === "results".
 *
 * Charts:
 * 1. ETS scoring comparison (grouped bar)
 * 2. PERSUADE scoring comparison (grouped bar)
 * 3. Contamination gap (grouped bar: score recall rates)
 */
document.addEventListener('DOMContentLoaded', function () {
  /* Only render charts on the results page */
  if (document.body.dataset.page !== 'results') return;

  /* Shared colour palette */
  var COLORS = {
    human: '#9CA3AF',     /* Grey for human/ETS baseline */
    pro: '#4285F4',       /* Google blue for Gemini 3.1 Pro */
    flash: '#7BAAF7'      /* Lighter blue for Gemini 3 Flash */
  };

  /* Shared font settings to match the site design */
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = '#6B7280';

  /* Load data files and render charts */
  Promise.all([
    fetch('data/ets_scoring.json').then(function (r) { return r.json(); }),
    fetch('data/persuade_scoring.json').then(function (r) { return r.json(); }),
    fetch('data/contamination.json').then(function (r) { return r.json(); })
  ]).then(function (data) {
    var etsData = data[0];
    var persuadeData = data[1];
    var contaminationData = data[2];

    renderScoringChart('ets-scoring-chart', etsData.essays, 'ets_score');
    renderScoringChart('persuade-scoring-chart', persuadeData.essays, 'human_score');
    renderContaminationChart('contamination-chart', contaminationData);
  });


  /**
   * Render a grouped bar chart comparing human/ETS scores with model scores.
   *
   * @param {string} canvasId - The id of the canvas element.
   * @param {Array} essays - Array of essay objects with score fields.
   * @param {string} humanField - Key for the human/ETS score ('ets_score' or 'human_score').
   */
  function renderScoringChart(canvasId, essays, humanField) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    /* Build labels from essay IDs, cleaned up for display */
    var labels = essays.map(function (e) {
      return e.id
        .replace('arg_score', 'ETS ')
        .replace('persuade_score', 'P')
        .replace('_a', 'a')
        .replace('_b', 'b');
    });

    var humanScores = essays.map(function (e) { return e[humanField]; });
    var proScores = essays.map(function (e) { return e.pro_score; });
    var flashScores = essays.map(function (e) { return e.flash_score; });

    var humanLabel = humanField === 'ets_score' ? 'ETS Score' : 'Human Score';

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: humanLabel,
            data: humanScores,
            backgroundColor: COLORS.human,
            borderRadius: 3
          },
          {
            label: 'Gemini 3.1 Pro',
            data: proScores,
            backgroundColor: COLORS.pro,
            borderRadius: 3
          },
          {
            label: 'Gemini 3 Flash',
            data: flashScores,
            backgroundColor: COLORS.flash,
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'rectRounded',
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              /* Show the essay ID and score in tooltip */
              title: function (items) {
                return items[0].label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 6,
            ticks: {
              stepSize: 1
            },
            title: {
              display: true,
              text: 'Score (1-6)'
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }


  /**
   * Render the contamination gap chart.
   * Shows score recall rates (exact match and within-one) across
   * ETS and PERSUADE corpora for both models.
   *
   * @param {string} canvasId - The id of the canvas element.
   * @param {Object} data - The contamination.json data object.
   */
  function renderContaminationChart(canvasId, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var scoreRecall = data.score_recall;

    /* Labels: 4 groups (Pro/ETS, Pro/PERSUADE, Flash/ETS, Flash/PERSUADE) */
    var labels = [
      'Pro / ETS',
      'Pro / PERSUADE',
      'Flash / ETS',
      'Flash / PERSUADE'
    ];

    /* Exact match rates as percentages */
    var exactRates = [
      Math.round(scoreRecall.ets.pro.exact_rate * 100),
      Math.round(scoreRecall.persuade.pro.exact_rate * 100),
      Math.round(scoreRecall.ets.flash.exact_rate * 100),
      Math.round(scoreRecall.persuade.flash.exact_rate * 100)
    ];

    /* Within-one rates as percentages */
    var withinOneRates = [
      Math.round(scoreRecall.ets.pro.within_one_rate * 100),
      Math.round(scoreRecall.persuade.pro.within_one_rate * 100),
      Math.round(scoreRecall.ets.flash.within_one_rate * 100),
      Math.round(scoreRecall.persuade.flash.within_one_rate * 100)
    ];

    /* Colour the bars by model and corpus */
    var barColors = [
      COLORS.pro,    /* Pro / ETS */
      '#A3C4F7',     /* Pro / PERSUADE (faded) */
      COLORS.flash,  /* Flash / ETS */
      '#C5DAF9'      /* Flash / PERSUADE (faded) */
    ];

    var withinOneColors = [
      'rgba(66, 133, 244, 0.3)',   /* Pro / ETS */
      'rgba(163, 196, 247, 0.3)',  /* Pro / PERSUADE */
      'rgba(123, 170, 247, 0.3)',  /* Flash / ETS */
      'rgba(197, 218, 249, 0.3)'   /* Flash / PERSUADE */
    ];

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Exact match (%)',
            data: exactRates,
            backgroundColor: barColors,
            borderRadius: 3
          },
          {
            label: 'Within-one (%)',
            data: withinOneRates,
            backgroundColor: withinOneColors,
            borderColor: barColors,
            borderWidth: 1,
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'rectRounded',
              padding: 20,
              generateLabels: function (chart) {
                /* Custom legend: just show Exact match and Within-one */
                return [
                  {
                    text: 'Exact match',
                    fillStyle: COLORS.pro,
                    strokeStyle: COLORS.pro,
                    pointStyle: 'rectRounded',
                    hidden: false,
                    datasetIndex: 0
                  },
                  {
                    text: 'Within-one',
                    fillStyle: 'rgba(66, 133, 244, 0.3)',
                    strokeStyle: COLORS.pro,
                    pointStyle: 'rectRounded',
                    hidden: false,
                    datasetIndex: 1
                  }
                ];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + context.parsed.y + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: function (value) {
                return value + '%';
              }
            },
            title: {
              display: true,
              text: 'Score recall rate'
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
});
