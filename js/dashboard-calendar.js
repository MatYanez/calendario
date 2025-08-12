// js/dashboard-calendar.js
// FullCalendar v6.1.19 con @fullcalendar/core + daygrid + multimonth (sin timegrid/interaction).
// Vistas: Semana (dayGridWeek), Mes (dayGridMonth) y 3 Meses (multiMonthYear con rango fijo).
// TZ America/Santiago. Aún con mock de eventos. No usa 'plugins: []'.

(function () {
  let currentMode = 'week'; // 'week' | 'month' | 'quarter'
  let anchorDate = new Date();
  const tz = 'America/Santiago';

  // ---------- Helpers ----------
  function toLocalISO(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }
  function startOfMondayWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=dom,1=lun,...6=sáb
    const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  }
  function startOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0,0,0,0);
    return d;
  }
  function addMonths(date, n) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + n);
    d.setHours(0,0,0,0);
    return d;
  }

  // ---------- Mock de eventos ----------
  function mockEvents(rangeStart, rangeEnd) {
    const base = startOfMondayWeek(anchorDate);
    const events = [
      { id:'reu_1', title:'Reunión kickoff', start: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+1, 10)), end: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+1, 11)), backgroundColor:'#3a87ad', borderColor:'#3a87ad' },
      { id:'chk_1', title:'Enviar presupuesto (Alta)', start: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+2, 0)), allDay:true, backgroundColor:'#0d6efd', borderColor:'#0d6efd' },
      { id:'hit_1', title:'Deadline proyecto A', start: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+4, 0)), allDay:true, backgroundColor:'#ffc107', borderColor:'#ffc107' },
      { id:'reu_2', title:'Revisión semanal', start: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+5, 15, 30)), end: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+5, 16, 30)), backgroundColor:'#3a87ad', borderColor:'#3a87ad' }
    ];
    const sTs = rangeStart.getTime();
    const eTs = rangeEnd.getTime();
    return events.filter(ev => {
      const s = new Date(ev.start).getTime();
      const e = new Date(ev.end || ev.start).getTime();
      return e >= sTs && s <= eTs;
    });
  }

  // ---------- Montaje ----------
  const el = document.getElementById('dashboardCalendar');
  if (!el) { console.warn('[dashboard-calendar] Falta #dashboardCalendar'); return; }

  const calendar = new FullCalendar.Calendar(el, {
    timeZone: tz,
    locale: 'es',
    firstDay: 1,
    initialView: 'dayGridWeek', // Semana (lun–dom) sin horas
    headerToolbar: false,
    dayMaxEvents: true,

    views: {
      dayGridWeek: { dayHeaderFormat: { weekday: 'short', day: '2-digit', month: 'short' } },
      dayGridMonth: { dayMaxEventRows: true },
      threeMonth: { type: 'multiMonthYear', duration: { months: 3 } } // requiere multimonth script cargado
    },

    eventClick(info) {
      console.log('[eventClick]', info.event.id, info.event.title);
    }
  });

  // ---------- Carga por rango ----------
  function reloadEvents() {
    calendar.removeAllEvents();
    const view = calendar.view;
    calendar.addEventSource(mockEvents(view.activeStart, view.activeEnd));
  }

  // ---------- Modos ----------
  function gotoWeekOf(date) {
    currentMode = 'week';
    anchorDate = new Date(date);
    const monday = startOfMondayWeek(anchorDate);
    calendar.setOption('visibleRange', null);
    calendar.changeView('dayGridWeek', monday);
    reloadEvents();
  }
  function gotoMonthOf(date) {
    currentMode = 'month';
    anchorDate = new Date(date);
    const first = startOfMonth(anchorDate);
    calendar.setOption('visibleRange', null);
    calendar.changeView('dayGridMonth', first);
    reloadEvents();
  }
  function gotoQuarterOf(date) {
    currentMode = 'quarter';
    anchorDate = new Date(date);
    const first = startOfMonth(anchorDate);
    const end = startOfMonth(addMonths(first, 3)); // exclusivo
    calendar.setOption('visibleRange', { start: first, end: end });
    calendar.changeView('threeMonth', first);
    reloadEvents();
  }

  // ---------- Navegación ----------
  function goToday() {
    anchorDate = new Date();
    if (currentMode === 'week') gotoWeekOf(anchorDate);
    else if (currentMode === 'month') gotoMonthOf(anchorDate);
    else gotoQuarterOf(anchorDate);
  }
  function goPrev() {
    if (currentMode === 'week') { anchorDate.setDate(anchorDate.getDate() - 7); gotoWeekOf(anchorDate); }
    else if (currentMode === 'month') { anchorDate = addMonths(anchorDate, -1); gotoMonthOf(anchorDate); }
    else { anchorDate = addMonths(anchorDate, -3); gotoQuarterOf(anchorDate); }
  }
  function goNext() {
    if (currentMode === 'week') { anchorDate.setDate(anchorDate.getDate() + 7); gotoWeekOf(anchorDate); }
    else if (currentMode === 'month') { anchorDate = addMonths(anchorDate, 1); gotoMonthOf(anchorDate); }
    else { anchorDate = addMonths(anchorDate, 3); gotoQuarterOf(anchorDate); }
  }

  // ---------- Botones ----------
  function wireControls() {
    const $ = (id) => document.getElementById(id);
    $('#btnCalWeek')?.addEventListener('click', () => gotoWeekOf(anchorDate));
    $('#btnCalMonth')?.addEventListener('click', () => gotoMonthOf(anchorDate));
    $('#btnCalQuarter')?.addEventListener('click', () => gotoQuarterOf(anchorDate));
    $('#btnCalToday')?.addEventListener('click', goToday);
    $('#btnCalPrev')?.addEventListener('click', goPrev);
    $('#btnCalNext')?.addEventListener('click', goNext);
  }

  wireControls();
  calendar.render();
  gotoWeekOf(new Date()); // por defecto: semana lun–dom que contiene hoy
})();

//v1.2