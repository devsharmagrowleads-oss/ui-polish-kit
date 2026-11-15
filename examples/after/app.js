// Behaviour for the "after" example. Plain JavaScript so the page opens straight
// from the file system; in a React project these are the recipe components.

const $ = (selector, root = document) => root.querySelector(selector);
const money = (value, currency) => new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value);
const dateLabel = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });
const icon = (id, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#${id}"/></svg>`;

// ---------- theme ----------
$('#theme-toggle').addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* private mode: the choice lasts for this page only */ }
});

// ---------- small-screen navigation ----------
const menuButton = $('#menu-button');
const nav = $('#site-nav');
menuButton.addEventListener('click', () => {
  const open = nav.dataset.open !== 'true';
  nav.dataset.open = String(open);
  menuButton.setAttribute('aria-expanded', String(open));
  // The nav precedes the button in the DOM, so move focus into it when it opens.
  if (open) nav.querySelector('a').focus();
});
nav.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || nav.dataset.open !== 'true') return;
  nav.dataset.open = 'false';
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.focus();
});

// ---------- toast (replaces alert) ----------
function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = icon('i-check', 'icon-sm');
  el.append(message);
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 5000);
}

// ---------- date picker (replaces <input type="date">) ----------
function initDatePicker(root, { min, onChange }) {
  const trigger = $('.datepicker-trigger', root);
  const label = $('[data-datepicker-label]', root);
  const input = $('[data-datepicker-value]', root);
  const popover = $('.popover', root);
  const today = startOfDay(new Date());
  let selected = null;
  let view = new Date(today.getFullYear(), today.getMonth(), 1);

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function render(focusDay) {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // weeks start on Monday in en-GB
    const days = new Date(year, month + 1, 0).getDate();
    const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    let cells = weekdays.map((d) => `<span class="calendar-weekday" aria-hidden="true">${d}</span>`).join('');
    cells += '<span></span>'.repeat(offset);
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day);
      const attrs = [
        `data-day="${day}"`,
        `aria-label="${dateLabel.format(date)}"`,
        `aria-pressed="${selected && +date === +selected}"`,
        +date === +today ? 'data-today="true"' : '',
        min && date < min ? 'disabled' : '',
      ].join(' ');
      cells += `<button type="button" class="calendar-day" ${attrs}>${day}</button>`;
    }
    popover.innerHTML = `
      <div class="calendar-header">
        <button type="button" class="button button-ghost calendar-nav" data-step="-1" aria-label="Previous month">${icon('i-chevron-left', 'icon-sm')}</button>
        <span class="calendar-title" aria-live="polite">${monthLabel.format(view)}</span>
        <button type="button" class="button button-ghost calendar-nav" data-step="1" aria-label="Next month">${icon('i-chevron-right', 'icon-sm')}</button>
      </div>
      <div class="calendar-grid">${cells}</div>`;
    const target = $(`[data-day="${focusDay}"]:not(:disabled)`, popover) || $('.calendar-day:not(:disabled)', popover);
    if (target) target.focus();
  }

  function open() {
    if (selected) view = new Date(selected.getFullYear(), selected.getMonth(), 1);
    popover.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    render(selected && selected.getMonth() === view.getMonth() ? selected.getDate() : today.getDate());
  }
  function close(returnFocus = true) {
    popover.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }

  trigger.addEventListener('click', () => (popover.hidden ? open() : close()));
  popover.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]');
    const day = event.target.closest('[data-day]');
    if (step) {
      view = new Date(view.getFullYear(), view.getMonth() + Number(step.dataset.step), 1);
      render(1);
    } else if (day) {
      selected = new Date(view.getFullYear(), view.getMonth(), Number(day.dataset.day));
      input.value = iso(selected);
      label.textContent = dateLabel.format(selected);
      close();
      onChange(selected);
    }
  });
  popover.addEventListener('keydown', (event) => {
    const day = event.target.closest('[data-day]');
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (!day || !(event.key in moves)) return;
    event.preventDefault();
    const next = new Date(view.getFullYear(), view.getMonth(), Number(day.dataset.day) + moves[event.key]);
    if (min && next < min) return;
    if (next.getMonth() !== view.getMonth()) view = new Date(next.getFullYear(), next.getMonth(), 1);
    render(next.getDate());
  });
  document.addEventListener('pointerdown', (event) => {
    if (!popover.hidden && !root.contains(event.target)) close(false);
  });
}

// ---------- summary, slider and amount ----------
const form = $('#invoice-form');
const amountInput = $('#amount');
const feeInput = $('#late-fee');
const currencyInput = $('#currency');
const parseAmount = () => Number(amountInput.value.replace(/[^\d.]/g, ''));

function updateSummary() {
  const amount = parseAmount() || 0;
  const fee = Number(feeInput.value);
  const currency = currencyInput.value;
  $('#late-fee-output').textContent = `${fee}%`;
  $('#sum-amount').textContent = money(amount, currency);
  $('#sum-fee').textContent = money((amount * fee) / 100, currency);
  $('#sum-total').textContent = money(amount, currency);
  $('.adornment').textContent = money(0, currency).replace(/[\d.,\s]/g, '');
}
[amountInput, feeInput, currencyInput].forEach((el) => el.addEventListener('input', updateSummary));

initDatePicker($('[data-datepicker]'), {
  min: new Date(new Date().setHours(0, 0, 0, 0)),
  onChange(date) {
    const first = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 3);
    $('#sum-note').textContent = `Due ${dateLabel.format(date)}. The first reminder goes out on ${dateLabel.format(first)}.`;
  },
});

// ---------- validation: on blur first, then live once a field is in error ----------
const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  amount: () => parseAmount() > 0,
};
function validate(field) {
  const valid = validators[field.id](field.value);
  field.setAttribute('aria-invalid', String(!valid));
  $(`#${field.id}-error`).hidden = valid;
  return valid;
}
Object.keys(validators).forEach((id) => {
  const field = $(`#${id}`);
  field.addEventListener('blur', () => validate(field));
  field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(field); });
});

// ---------- file dropzone (replaces a bare <input type="file">) ----------
const fileInput = $('#attachment');
const dropzone = $('#dropzone');
function showFile(file) {
  const tooLarge = file.size > 5 * 1024 * 1024;
  $('#dropzone-title').textContent = tooLarge ? `${file.name} is larger than 5 MB` : file.name;
  $('#dropzone-hint').textContent = tooLarge ? 'Choose a smaller file.' : `${Math.max(1, Math.round(file.size / 1024))} KB. Choose another file to replace it.`;
}
fileInput.addEventListener('change', () => { if (fileInput.files[0]) showFile(fileInput.files[0]); });
['dragenter', 'dragover'].forEach((type) => dropzone.addEventListener(type, (event) => { event.preventDefault(); dropzone.dataset.dragging = 'true'; }));
['dragleave', 'drop'].forEach((type) => dropzone.addEventListener(type, (event) => { event.preventDefault(); dropzone.dataset.dragging = 'false'; }));
dropzone.addEventListener('drop', (event) => { if (event.dataTransfer.files[0]) showFile(event.dataTransfer.files[0]); });

// ---------- discard (replaces confirm) ----------
const discardDialog = $('#discard-dialog');
$('#discard').addEventListener('click', () => discardDialog.showModal());
discardDialog.addEventListener('close', () => {
  if (discardDialog.returnValue === 'confirm') toast('Draft INV-2042 discarded');
});

// ---------- save and send ----------
$('#save-draft').addEventListener('click', () => toast('Draft saved'));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = Object.keys(validators).map((id) => $(`#${id}`)).filter((field) => !validate(field));
  if (invalid.length) { invalid[0].focus(); return; }
  const button = $('#send');
  button.setAttribute('aria-busy', 'true');
  setTimeout(() => {
    button.removeAttribute('aria-busy');
    toast(`Invoice INV-2042 sent to ${$('#email').value}`);
  }, 900);
});

updateSummary();
