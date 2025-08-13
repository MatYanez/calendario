// js/dashboard-calendar.js
// FullCalendar v6.1.19 con @fullcalendar/core + daygrid + multimonth.
// Vistas: Semana (dayGridWeek), Mes (dayGridMonth), 3 Meses (multiMonthYear con visibleRange fijo).
// TZ America/Santiago. Mock de eventos. Handlers robustos con preventDefault y logs.

(function () {
  // ---------- Helpers ----------
  function toLocalISO(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }
  function startOfMondayWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
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

  // ---------- Estado ----------
  let currentMode = 'week';
  let anchorDate = new Date();
  let calendar = null;

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

  // ---------- Utilidades calendario ----------
  function reloadEvents() {
    if (!calendar) return;
    calendar.removeAllEvents();
    const view = calendar.view;
    calendar.addEventSource(mockEvents(view.activeStart, view.activeEnd));
  }
  function clearVisibleRange() {
    if (!calendar) return;
    calendar.setOption('visibleRange', null);
    // Algunas builds globales limpian recién con undefined:
    // @ts-ignore
    calendar.setOption('visibleRange', undefined);
  }

  // Modos de vista
  function gotoWeekOf(date) {
    if (!calendar) return;
    currentMode = 'week';
    anchorDate = new Date(date);
    const monday = startOfMondayWeek(anchorDate);
    clearVisibleRange();
    calendar.changeView('dayGridWeek', monday);
    console.log('[calendar] view => Semana (', monday.toDateString(), ')');
    reloadEvents();
  }
  function gotoMonthOf(date) {
    if (!calendar) return;
    currentMode = 'month';
    anchorDate = new Date(date);
    const first = startOfMonth(anchorDate);
    clearVisibleRange();
    calendar.changeView('dayGridMonth', first);
    console.log('[calendar] view => Mes (', first.toDateString(), ')');
    reloadEvents();
  }
  function gotoQuarterOf(date) {
    if (!calendar) return;
    currentMode = 'quarter';
    anchorDate = new Date(date);
    const first = startOfMonth(anchorDate);
    const end = startOfMonth(addMonths(first, 3));
    calendar.setOption('visibleRange', { start: first, end: end });
    calendar.changeView('threeMonth', first);
    console.log('[calendar] view => 3 Meses (', first.toDateString(), '→', end.toDateString(), ')');
    reloadEvents();
  }

  // Navegación
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

  // ---------- Inicialización ----------
  function init() {
    const el = document.getElementById('dashboardCalendar');
    if (!el) {
      console.warn('[dashboard-calendar] No existe #dashboardCalendar en el DOM.');
      return;
    }

    calendar = new FullCalendar.Calendar(el, {
      timeZone: 'America/Santiago',
      locale: 'es',
      firstDay: 1,
      initialView: 'dayGridWeek',
      headerToolbar: false,
      dayMaxEvents: true,
      views: {
        dayGridWeek:  { dayHeaderFormat: { weekday: 'short', day: '2-digit', month: 'short' } },
        dayGridMonth: { dayMaxEventRows: true },
        threeMonth:   { type: 'multiMonthYear', duration: { months: 3 } }
      },
      eventClick(info) {
        console.log('[eventClick]', info.event.id, info.event.title);
      }
    });

    calendar.render();

    //  Exponer la instancia globalmente
    window._dashboardCalendar = calendar;

    // Botones de navegación
    const on = (id, handler) => {
      const elBtn = document.getElementById(id);
      if (!elBtn) { console.warn(`[dashboard-calendar] ${id}: NO ENCONTRADO`); return; }
      const wrap = (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        console.log(`[ui] click ${id}`);
        handler();
      };
      elBtn.addEventListener('click', wrap, true);
      elBtn.addEventListener('pointerup', wrap, true);
    };

    on('btnCalWeek', () => gotoWeekOf(anchorDate));
    on('btnCalMonth', () => gotoMonthOf(anchorDate));
    on('btnCalQuarter', () => gotoQuarterOf(anchorDate));
    on('btnCalToday', () => goToday());
    on('btnCalPrev', () => goPrev());
    on('btnCalNext', () => goNext());

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (e.key.toLowerCase() === 'w') { console.log('[kb] W => Semana'); gotoWeekOf(anchorDate); }
      if (e.key.toLowerCase() === 'm') { console.log('[kb] M => Mes'); gotoMonthOf(anchorDate); }
      if (e.key === '3') { console.log('[kb] 3 => 3 Meses'); gotoQuarterOf(anchorDate); }
      if (e.key === 'ArrowLeft') { console.log('[kb] ← => Prev'); goPrev(); }
      if (e.key === 'ArrowRight') { console.log('[kb] → => Next'); goNext(); }
      if (e.key.toLowerCase() === 't') { console.log('[kb] T => Hoy'); goToday(); }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();


//v.2