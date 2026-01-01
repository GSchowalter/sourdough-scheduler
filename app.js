const sourdoughSchedule = [
  { name: "Cool", durationHours: 2 },
  { name: "Bake", durationHours: 1 },
  { name: "Shape and proof", durationHours: 1 },
  { name: "Mix", durationHours: 12 },
  { name: "Autolyse", durationHours: .5 },
  { name: "Quick starter maturation", durationHours: 12 },
  { name: "Optimal starter maturation", durationHours: 12 }
];

function calculateSchedule(targetDateTime) {
  let current = new Date(targetDateTime);
  // build entries with start and end times
  const entries = sourdoughSchedule.map(step => {
    const start = new Date(current.getTime() - step.durationHours * 60 * 60 * 1000);
    const end = new Date(current.getTime());
    current = start;
    return { ...step, start, end };
  }).reverse();

  return entries;
}

function formatDate(d) {
  return d.toLocaleString();
}

function humanDuration(hours) {
  if (hours % 1 === 0) return `${hours} h`;
  const mins = Math.round((hours % 1) * 60);
  if (hours >= 1) {
    const hrs = Math.floor(hours);
    return `${hrs} h ${mins} min`;
  }
  return `${mins} min`;
}

function formatTime(d) {
  // show shorter, more human-friendly time
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

function renderSchedule(entries) {
  const container = document.getElementById('schedule');
  if (!container) return;
  if (!entries || entries.length === 0) {
    container.textContent = 'No schedule available.';
    return;
  }

  // header
  const header = document.createElement('div');
  header.className = 'mb-3';
  header.textContent = 'Sourdough schedule (earliest → latest)';

  const list = document.createElement('ol');
  list.className = 'space-y-3';

  entries.forEach(e => {
    const li = document.createElement('li');
    li.className = 'p-3 bg-gray-50 rounded-lg border';

    const row = document.createElement('div');
    row.className = 'flex items-start justify-between gap-4';

    const left = document.createElement('div');
    left.className = 'flex-1';

    const title = document.createElement('div');
    title.className = 'text-lg font-medium';
    title.textContent = e.name;

    const times = document.createElement('div');
    times.className = 'text-sm text-gray-600';
    times.textContent = `${formatTime(e.start)} → ${formatTime(e.end)}`;

    left.appendChild(title);
    left.appendChild(times);

    const right = document.createElement('div');
    right.className = 'text-sm text-gray-700 whitespace-nowrap';
    right.textContent = humanDuration(e.durationHours);

    row.appendChild(left);
    row.appendChild(right);
    li.appendChild(row);
    list.appendChild(li);
  });

  container.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'space-y-2';
  card.appendChild(header);
  card.appendChild(list);
  container.appendChild(card);
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
