/**
 * AlignED Report 3 — Chart Rendering
 * Uses Chart.js to render all charts on the Results page.
 * Charts only render when data-page="results" is set on the body element.
 */
document.addEventListener('DOMContentLoaded', function() {
  /* Only render charts on the results page */
  if (document.body.dataset.page !== 'results') return;

  /* Colour palette for this report */
  const COLOURS = {
    education: '#3B6B9A',      /* primary blue */
    allTasks: '#B67D5C',       /* terracotta accent */
    claudeAi: '#3B6B9A',      /* primary blue */
    api: '#7096B8',            /* secondary blue */
    coursework: '#3B6B9A',
    work: '#B67D5C',
    personal: '#7096B8',
    /* Subsector colours */
    eduSupport: '#D97757',
    k12: '#3B6B9A',
    library: '#7096B8',
    otherTeachers: '#B67D5C',
    postsecondary: '#10A37F',
    /* Pattern colours for subsector chart */
    directive: '#3B6B9A',
    feedbackLoop: '#D97757',
    taskIteration: '#10A37F',
    validation: '#7096B8',
    learning: '#B67D5C'
  };

  /* Shared chart defaults */
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = '#6B7280';

  /**
   * Fetch all JSON data files in parallel.
   * Returns an object with data keyed by name.
   */
  function loadAllData() {
    return Promise.all([
      fetch('data/collaboration_patterns.json').then(r => r.json()),
      fetch('data/use_case_split.json').then(r => r.json()),
      fetch('data/subsector_patterns.json').then(r => r.json()),
      fetch('data/geographic.json').then(r => r.json()),
      fetch('data/success_rates.json').then(r => r.json()),
      fetch('data/consumer_vs_api.json').then(r => r.json()),
      fetch('data/key_metrics.json').then(r => r.json())
    ]).then(function(results) {
      return {
        collaboration: results[0],
        useCase: results[1],
        subsector: results[2],
        geographic: results[3],
        success: results[4],
        consumerApi: results[5],
        metrics: results[6]
      };
    });
  }

  /**
   * Chart 1: Use case split (grouped bar)
   * Shows coursework, work, personal for education vs all tasks.
   */
  function renderUseCaseChart(data) {
    var ctx = document.getElementById('chart-use-case');
    if (!ctx) return;

    var results = data.useCase.results;
    var labels = results.map(function(r) { return r.use_case; });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Education tasks',
            data: results.map(function(r) { return r.education; }),
            backgroundColor: COLOURS.education,
            borderRadius: 4
          },
          {
            label: 'All tasks',
            data: results.map(function(r) { return r.all_tasks; }),
            backgroundColor: COLOURS.allTasks,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 65,
            ticks: { callback: function(v) { return v + '%'; } },
            title: { display: true, text: 'Share of conversations' }
          }
        }
      }
    });
  }

  /**
   * Chart 2: Collaboration patterns comparison (grouped bar)
   * Education vs all tasks for each pattern.
   */
  function renderCollaborationChart(data) {
    var ctx = document.getElementById('chart-collaboration');
    if (!ctx) return;

    var results = data.collaboration.results;
    var labels = results.map(function(r) { return r.pattern; });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Education tasks',
            data: results.map(function(r) { return r.education; }),
            backgroundColor: COLOURS.education,
            borderRadius: 4
          },
          {
            label: 'All tasks',
            data: results.map(function(r) { return r.all_tasks; }),
            backgroundColor: COLOURS.allTasks,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 40,
            ticks: { callback: function(v) { return v + '%'; } },
            title: { display: true, text: 'Share of interactions (renormalised)' }
          }
        }
      }
    });
  }

  /**
   * Chart 3: Subsector collaboration patterns (grouped bar)
   * Five subsectors, five patterns.
   */
  function renderSubsectorChart(data) {
    var ctx = document.getElementById('chart-subsector');
    if (!ctx) return;

    var results = data.subsector.results;
    var labels = results.map(function(r) { return r.subsector; });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Directive',
            data: results.map(function(r) { return r.directive; }),
            backgroundColor: COLOURS.directive,
            borderRadius: 3
          },
          {
            label: 'Task Iteration',
            data: results.map(function(r) { return r.task_iteration; }),
            backgroundColor: COLOURS.taskIteration,
            borderRadius: 3
          },
          {
            label: 'Learning',
            data: results.map(function(r) { return r.learning; }),
            backgroundColor: COLOURS.learning,
            borderRadius: 3
          },
          {
            label: 'Validation',
            data: results.map(function(r) { return r.validation; }),
            backgroundColor: COLOURS.validation,
            borderRadius: 3
          },
          {
            label: 'Feedback Loop',
            data: results.map(function(r) { return r.feedback_loop; }),
            backgroundColor: COLOURS.feedbackLoop,
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 50,
            ticks: { callback: function(v) { return v + '%'; } },
            title: { display: true, text: 'Share of interactions (renormalised)' }
          }
        }
      }
    });
  }

  /**
   * Chart 4: Success rates by subsector (horizontal bar)
   */
  function renderSuccessChart(data) {
    var ctx = document.getElementById('chart-success');
    if (!ctx) return;

    var results = data.success.results;
    var labels = results.map(function(r) { return r.subsector; });
    var values = results.map(function(r) { return r.success_rate; });

    /* Map colours dynamically by subsector name */
    var colourMap = {
      'K-12 Teachers': COLOURS.k12,
      'Other Teachers': COLOURS.otherTeachers,
      'Postsecondary': COLOURS.postsecondary,
      'Edu Support': COLOURS.eduSupport,
      'Library': COLOURS.library
    };
    var barColours = labels.map(function(label) { return colourMap[label] || COLOURS.education; });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: barColours,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return 'Success rate: ' + ctx.parsed.x.toFixed(1) + '%';
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: function(v) { return v + '%'; } },
            title: { display: true, text: 'Task success rate' }
          }
        }
      }
    });
  }

  /**
   * Chart 5: Geographic distribution (horizontal bar, top 20)
   */
  function renderGeographicChart(data) {
    var ctx = document.getElementById('chart-geographic');
    if (!ctx) return;

    var results = data.geographic.results;
    var labels = results.map(function(r) { return r.country; });
    var values = results.map(function(r) { return r.edu_pct; });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: COLOURS.education,
          borderRadius: 3
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return 'Education share: ' + ctx.parsed.x.toFixed(1) + '%';
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 40,
            ticks: { callback: function(v) { return v + '%'; } },
            title: { display: true, text: 'Education as % of all AI tasks' }
          }
        }
      }
    });
  }

  /**
   * Chart 6: Consumer vs API patterns (grouped bar)
   */
  function renderConsumerApiChart(data) {
    var ctx = document.getElementById('chart-consumer-api');
    if (!ctx) return;

    var results = data.consumerApi.results;
    var labels = results.map(function(r) { return r.pattern; });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Claude.ai (consumer)',
            data: results.map(function(r) { return r.claude_ai; }),
            backgroundColor: COLOURS.claudeAi,
            borderRadius: 4
          },
          {
            label: 'API (developer)',
            data: results.map(function(r) { return r.api; }),
            backgroundColor: COLOURS.api,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 70,
            ticks: { callback: function(v) { return v + '%'; } },
            title: { display: true, text: 'Share of interactions (renormalised)' }
          }
        }
      }
    });
  }

  /* Load all data and render all charts */
  loadAllData()
    .then(function(data) {
      renderUseCaseChart(data);
      renderCollaborationChart(data);
      renderSubsectorChart(data);
      renderSuccessChart(data);
      renderGeographicChart(data);
      renderConsumerApiChart(data);
    })
    .catch(function(err) {
      console.error('Failed to load chart data:', err);
    });
});
