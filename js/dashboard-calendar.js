// js/dashboard-calendar.js
// FullCalendar v6.1.19 con @fullcalendar/core + daygrid + multimonth (sin timegrid/interaction).
// Vistas: Semana (dayGridWeek), Mes (dayGridMonth), 3 Meses (multiMonthYear con visibleRange fijo).
// TZ America/Santiago. Mock de eventos. Inicializa SOLO cuando el DOM está listo.

(function () {
  // ---------- Helpers ----------
  function toLocalISO(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }
  function startOfMondayWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 dom, 1 lun, ... 6 sáb
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
  let currentMode = 'week'; // 'week' | 'month' | 'quarter'
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
    calendar.removeAllEvents();
    const view = calendar.view;
    calendar.addEventSource(mockEvents(view.activeStart, view.activeEnd));
  }
  function clearVisibleRange() {
    calendar.setOption('visibleRange', null);
    // algunas builds requieren undefined para limpiar realmente
    // @ts-ignore
    calendar.setOption('visibleRange', undefined);
  }

  // Modos
  function gotoWeekOf(date) {
    currentMode = 'week';
    anchorDate = new Date(date);
    const monday = startOfMondayWeek(anchorDate);
    clearVisibleRange();
    calendar.changeView('dayGridWeek', monday);
    reloadEvents();
  }
  function gotoMonthOf(date) {
    currentMode = 'month';
    anchorDate = new Date(date);
    const first = startOfMonth(anchorDate);
    clearVisibleRange();
    calendar.changeView('dayGridMonth', first);
    reloadEvents();
  }
  function gotoQuarterOf(date) {
    currentMode = 'quarter';
    anchorDate = new Date(date);
    const first = startOfMonth(anchorDate);
    const end = startOfMonth(addMonths(first, 3)); // exclusivo
    calendar.setOption('visibleRange', { start: first, end: end });
    // vista multi-mes (requiere haber cargado @fullcalendar/multimonth)
    calendar.changeView('threeMonth', first);
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

  // ---------- Inicialización segura al estar el DOM listo ----------
  function init() {
    const el = document.getElementById('dashboardCalendar');
    if (!el) {
      console.warn('[dashboard-calendar] No existe #dashboardCalendar en el DOM.');
      return;
    }

    // Log para verificar botones
    const ids = ['btnCalWeek','btnCalMonth','btnCalQuarter','btnCalPrev','btnCalToday','btnCalNext'];
    ids.forEach(id => {
      const found = !!document.getElementById(id);
      console.log(`[dashboard-calendar] ${id}: ${found ? 'OK' : 'NO ENCONTRADO'}`);
    });

    calendar = new FullCalendar.Calendar(el, {
      timeZone: 'America/Santiago',
      locale: 'es',
      firstDay: 1,
      initialView: 'dayGridWeek',
      headerToolbar: false,
      dayMaxEvents: true,
      views: {
        dayGridWeek: { dayHeaderFormat: { weekday: 'short', day: '2-digit', month: 'short' } },
        dayGridMonth: { dayMaxEventRows: true },
        threeMonth: { type: 'multiMonthYear', duration: { months: 3 } } // requiere multimonth
      },
      eventClick(info) {
        console.log('[eventClick]', info.event.id, info.event.title);
      }
    });

    // Wire de botones (después de existir en el DOM)
    const $ = id => document.getElementById(id);
    $('#btnCalWeek')  && $('#btnCalWeek').addEventListener('click', () => gotoWeekOf(anchorDate));
    $('#btnCalMonth') && $('#btnCalMonth').addEventListener('click', () => gotoMonthOf(anchorDate));
    $('#btnCalQuarter') && $('#btnCalQuarter').addEventListener('click', () => gotoQuarterOf(anchorDate));
    $('#btnCalToday') && $('#btnCalToday').addEventListener('click', goToday);
    $('#btnCalPrev')  && $('#btnCalPrev').addEventListener('click', goPrev);
    $('#btnCalNext')  && $('#btnCalNext').addEventListener('click', goNext);

    calendar.render();
    gotoWeekOf(new Date()); // por defecto: semana lun–dom que contiene hoy
  }

  // Espera DOM listo
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // pequeño timeout para asegurar que la UI ya se pintó
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();

//v1.5