const sourdoughSchedule = [
  { name: "Bake", durationHours: 1 },
  { name: "Final Proof", durationHours: 12 },
  { name: "Bulk Fermentation", durationHours: 4 },
  { name: "Autolyse & Mix", durationHours: 1 }
];

function calculateSchedule(targetDateTime) {
  let current = new Date(targetDateTime);

  return sourdoughSchedule.map(step => {
    const start = new Date(current.getTime() - step.durationHours * 60 * 60 * 1000);
    current = start;
    return { ...step, start };
  }).reverse();
}

function formatDate(d) {
  return d.toLocaleString();
}

function renderSchedule(entries) {
  const container = document.getElementById('schedule');
  if (!container) return;
  if (!entries || entries.length === 0) {
    container.textContent = 'No schedule available.';
    return;
  }

  // build simple list
  const ul = document.createElement('ul');
  entries.forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.name}: starts at ${formatDate(e.start)} (duration ${e.durationHours}h)`;
    ul.appendChild(li);
  });

  // replace content
  container.innerHTML = '';
  container.appendChild(ul);
}

function showSchedule() {
  const input = document.getElementById('bakeTime');
  const container = document.getElementById('schedule');
  if (!input || !container) return;

  const value = input.value;
  if (!value) {
    container.textContent = 'Please choose a bake date and time.';
    return;
  }

  const schedule = calculateSchedule(value);
  renderSchedule(schedule);
}

// wire button after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('calculateBtn');
  if (btn) btn.addEventListener('click', showSchedule);
});

// export for manual use/testing in console
window.calculateSchedule = calculateSchedule;
window.showSchedule = showSchedule;
