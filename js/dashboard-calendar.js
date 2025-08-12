// js/dashboard-calendar.js
// Requiere: FullCalendar v6 (core, dayGrid, timeGrid, interaction, multiMonth), locale es,
// Bootstrap (para toasts y modals si los usas), y timezone America/Santiago.
// No conecta aún a Firestore: usa datos de ejemplo. Listo para enchufar fuentes reales.

(function () {
  let currentMode = 'week'; // 'week' | 'month' | 'quarter'
  let anchorDate = new Date();
  const tz = 'America/Santiago';

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
    return d;
  }

  function mockEvents(rangeStart, rangeEnd) {
    const base = startOfMondayWeek(anchorDate);
    const events = [
      {
        id: 'reu_1',
        origen: 'reuniones',
        tipo: 'reunion',
        title: 'Reunión kickoff',
        start: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+1, 10, 0)),
        end: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+1, 11, 0)),
        backgroundColor: '#3a87ad',
        borderColor: '#3a87ad'
      },
      {
        id: 'chk_1',
        origen: 'checklist',
        tipo: 'tarea',
        title: 'Enviar presupuesto (Alta)',
        start: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+2, 0, 0)),
        allDay: true,
        backgroundColor: '#0d6efd',
        borderColor: '#0d6efd'
      },
      {
        id: 'hit_1',
        origen: 'proyectos',
        tipo: 'hito',
        title: 'Deadline proyecto A',
        start: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+4, 0, 0)),
        allDay: true,
        backgroundColor: '#ffc107',
        borderColor: '#ffc107'
      },
      {
        id: 'reu_2',
        origen: 'reuniones',
        tipo: 'reunion',
        title: 'Revisión semanal',
        start: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+5, 15, 30)),
        end: toLocalISO(new Date(base.getFullYear(), base.getMonth(), base.getDate()+5, 16, 30)),
        backgroundColor: '#3a87ad',
        borderColor: '#3a87ad'
      }
    ];
    const startTs = rangeStart.getTime();
    const endTs = rangeEnd.getTime();
    return events.filter(ev => {
      const s = new Date(ev.start).getTime();
      const e = new Date(ev.end || ev.start).getTime();
      return e >= startTs && s <= endTs;
    });
  }

  const el = document.getElementById('dashboardCalendar');
  if (!el) {
    console.warn('[dashboard-calendar] No existe #dashboardCalendar en el DOM.');
    return;
  }

  const calendar = new FullCalendar.Calendar(el, {
    timeZone: tz,
    locale: 'es',
    firstDay: 1,
    initialView: 'timeGridWeek',
    headerToolbar: false,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    nowIndicator: true,
    selectable: true,
    editable: true,
    dayMaxEvents: true,
    views: {
      dayGridMonth: { dayMaxEventRows: true },
      timeGridWeek: { dayHeaderFormat: { weekday: 'short', day: '2-digit', month: 'short' } },
      threeMonth: {
        type: 'multiMonthYear',
        duration: { months: 3 }
      }
    },
    eventClick(info) {
      console.log('[eventClick]', info.event.id, info.event.title);
    },
    eventDrop(info) {
      console.log('[eventDrop]', info.event.id, info.event.start, info.event.end);
    },
    eventResize(info) {
      console.log('[eventResize]', info.event.id, info.event.start, info.event.end);
    }
  });

  function reloadEvents() {
    calendar.removeAllEvents();
    const view = calendar.view;
    const rangeStart = view.activeStart;
    const rangeEnd = view.activeEnd;
    const events = mockEvents(rangeStart, rangeEnd);
    calendar.addEventSource(events);
  }

  function gotoWeekOf(date) {
    currentMode = 'week';
    anchorDate = new Date(date);
    const monday = startOfMondayWeek(anchorDate);
    calendar.changeView('timeGridWeek', monday);
    calendar.setOption('visibleRange', null);
    reloadEvents();
  }

  function gotoMonthOf(date) {
    currentMode = 'month';
    anchorDate = new Date(date);
    const first = startOfMonth(anchorDate);
    calendar.changeView('dayGridMonth', first);
    calendar.setOption('visibleRange', null);
    reloadEvents();
  }

  function gotoQuarterOf(date) {
    currentMode = 'quarter';
    anchorDate = new Date(date);
    const first = startOfMonth(anchorDate);
    const end = startOfMonth(addMonths(first, 3));
    calendar.setOption('visibleRange', { start: first, end: end });
    calendar.changeView('threeMonth', first);
    reloadEvents();
  }

  function goToday() {
    anchorDate = new Date();
    if (currentMode === 'week') gotoWeekOf(anchorDate);
    else if (currentMode === 'month') gotoMonthOf(anchorDate);
    else gotoQuarterOf(anchorDate);
  }

  function goPrev() {
    if (currentMode === 'week') {
      anchorDate.setDate(anchorDate.getDate() - 7);
      gotoWeekOf(anchorDate);
    } else if (currentMode === 'month') {
      anchorDate = addMonths(anchorDate, -1);
      gotoMonthOf(anchorDate);
    } else {
      anchorDate = addMonths(anchorDate, -3);
      gotoQuarterOf(anchorDate);
    }
  }

  function goNext() {
    if (currentMode === 'week') {
      anchorDate.setDate(anchorDate.getDate() + 7);
      gotoWeekOf(anchorDate);
    } else if (currentMode === 'month') {
      anchorDate = addMonths(anchorDate, 1);
      gotoMonthOf(anchorDate);
    } else {
      anchorDate = addMonths(anchorDate, 3);
      gotoQuarterOf(anchorDate);
    }
  }

  function wireControls() {
    const byId = (id) => document.getElementById(id);
    const m = {
      week: byId('btnCalWeek'),
      month: byId('btnCalMonth'),
      quarter: byId('btnCalQuarter'),
      today: byId('btnCalToday'),
      prev: byId('btnCalPrev'),
      next: byId('btnCalNext')
    };
    if (m.week) m.week.addEventListener('click', () => gotoWeekOf(anchorDate));
    if (m.month) m.month.addEventListener('click', () => gotoMonthOf(anchorDate));
    if (m.quarter) m.quarter.addEventListener('click', () => gotoQuarterOf(anchorDate));
    if (m.today) m.today.addEventListener('click', goToday);
    if (m.prev) m.prev.addEventListener('click', goPrev);
    if (m.next) m.next.addEventListener('click', goNext);
  }

  wireControls();
  calendar.render();
  gotoWeekOf(new Date());
})();

//v1