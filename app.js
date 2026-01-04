const sourdoughSchedule = [
  { name: "Cool", durationHours: 2 },
  { name: "Bake", durationHours: 1 },
  { name: "Shape and proof", durationHours: 1 },
  { name: "Mix", durationHours: 12 },
  { name: "Autolyse", durationHours: .5 },
  { name: "Quick starter maturation", durationHours: 12 },
  { name: "Optimal starter maturation", durationHours: 12 }
];

function calculateSchedule(targetDateTime, mode = 'ready') {
  const target = new Date(targetDateTime);
  if (isNaN(target)) return [];

  if (mode === 'ready') {
    let current = new Date(target);
    // build entries with start and end times (working backwards from finished time)
    const entries = sourdoughSchedule.map(step => {
      const start = new Date(current.getTime() - step.durationHours * 60 * 60 * 1000);
      const end = new Date(current.getTime());
      current = start;
      return { ...step, start, end };
    }).reverse();
    return entries;
  }

  // If mode is 'mixStart', treat targetDateTime as the start time of the 'Mix' step
  if (mode === 'mixStart' || mode == 'starterStart') {
    const steps = [...sourdoughSchedule].reverse(); // earliest -> latest
    const idx =  mode === 'mixStart' ? steps.findIndex(s => s.name.toLowerCase() === 'mix') : 0;
    if (idx === -1) {
      // fallback to ready behavior
      return calculateSchedule(targetDateTime, 'ready');
    }

    // set mix start
    steps[idx].start = new Date(target);
    steps[idx].end = new Date(steps[idx].start.getTime() + steps[idx].durationHours * 60 * 60 * 1000);

    // compute forward for steps after idx
    for (let i = idx + 1; i < steps.length; i++) {
      const prev = steps[i - 1];
      steps[i].start = new Date(prev.end.getTime());
      steps[i].end = new Date(steps[i].start.getTime() + steps[i].durationHours * 60 * 60 * 1000);
    }

    // compute backward for steps before idx
    for (let i = idx - 1; i >= 0; i--) {
      const next = steps[i + 1];
      steps[i].end = new Date(next.start.getTime());
      steps[i].start = new Date(steps[i].end.getTime() - steps[i].durationHours * 60 * 60 * 1000);
    }

    return steps;
  }

  // default fallback
  return calculateSchedule(targetDateTime, 'ready');
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

function renderSchedule(entries, mode = 'ready') {
  const container = document.getElementById('schedule');
  if (!container) return;
  if (!entries || entries.length === 0) {
    container.textContent = 'No schedule available.';
    return;
  }

  // header
  const header = document.createElement('div');
  header.className = 'mb-3';
  header.textContent = `Sourdough schedule (earliest → latest) — ${mode === 'mixStart' ? 'anchored at mix start' : 'anchored at ready time'}`;

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

    // if this is the anchored step in mixStart mode, show a small badge
    if (mode === 'mixStart' && e.name.toLowerCase() === 'mix') {
      const anchorBadge = document.createElement('span');
      anchorBadge.className = 'ml-2 inline-block text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded';
      anchorBadge.textContent = 'Anchor';
      title.appendChild(anchorBadge);
    }

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
  const modeSelect = document.getElementById('timeMode');
  const container = document.getElementById('schedule');
  if (!input || !container) return;

  const value = input.value;
  const mode = modeSelect ? modeSelect.value : 'ready';
  if (!value) {
    container.textContent = 'Please choose a date and time.';
    return;
  }

  const schedule = calculateSchedule(value, mode);
  renderSchedule(schedule, mode);
}

// wire button after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('calculateBtn');
  if (btn) btn.addEventListener('click', showSchedule);
});

// export for manual use/testing in console
window.calculateSchedule = calculateSchedule;
window.showSchedule = showSchedule;
