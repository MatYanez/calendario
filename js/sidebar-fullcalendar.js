// js/sidebar-fullcalendar.js
// Requiere: Bootstrap (bundle), FullCalendar global build:
// <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.19/index.global.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.19/locales/es.global.min.js"></script>

(function () {
  const PANEL_ID   = 'sidebarCalendarPanel';
  const CAL_ID     = 'sidebarCalendar';
  const BTN_ID     = 'btnToggleSidebarCalendar';
  const CHEVRON_ID = 'sidebarCalendarChevron';
  const OFFCANVAS_ID = 'sidebarMenu';    // cambia si tu offcanvas tiene otro id
  const LS_KEY     = 'sidebarCalendarOpen';

  let calendar = null;
  let bsCollapse = null;

  function el(id) { return document.getElementById(id); }
  function setChevron(open) {
    const chev = el(CHEVRON_ID);
    if (!chev) return;
    chev.classList.toggle('fa-chevron-down', !open);
    chev.classList.toggle('fa-chevron-up', open);
  }

  // Carga feriados de Chile por año (con cache simple en window)
  async function fetchFeriadosChile(year) {
    try {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/CL`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      console.error('Error al cargar feriados CL', e);
      return [];
    }
  }

  function ensureCalendar() {
    const calEl = el(CAL_ID);
    if (!calEl) return;
    if (!calendar) {
      const { Calendar } = window.FullCalendar;
      window.__feriadosCL = window.__feriadosCL || {}; // cache por año

      calendar = new Calendar(calEl, {
        locale: 'es',
        firstDay: 1,               // lunes
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
        height: 'auto',
        contentHeight: 'auto',
        dayMaxEventRows: 2,

        // FERIADOS CHILE (background events en rojo)
        events: async (info, success, failure) => {
          try {
            const yStart = info.start.getFullYear();
            const yEnd   = info.end.getFullYear();

            const toFetch = [];
            for (let y = yStart; y <= yEnd; y++) {
              if (!window.__feriadosCL[y]) toFetch.push(y);
            }

            if (toFetch.length) {
              const results = await Promise.all(toFetch.map(fetchFeriadosChile));
              results.forEach((arr, i) => {
                window.__feriadosCL[toFetch[i]] = Array.isArray(arr) ? arr : [];
              });
            }

            const feriados = [];
            for (let y = yStart; y <= yEnd; y++) {
              feriados.push(...(window.__feriadosCL[y] || []));
            }
const events = feriados.map(h => ({
  start: h.date,          // ← sin title
  allDay: true,
  display: 'background',
  color: 'rgba(220,53,69,0.18)' // rojo suave para el día feriado
}));
            success(events);
          } catch (err) {
            console.error(err);
            failure(err);
          }
        }
      });
    }
    calendar.render();
    calendar.updateSize();
  }

  function init() {
    const panel = el(PANEL_ID);
    const btn = el(BTN_ID);
    if (!panel || !btn) return;

    bsCollapse = new bootstrap.Collapse(panel, { toggle: false });

    const open = localStorage.getItem(LS_KEY) === '1';
    if (open) {
      bsCollapse.show();
      setChevron(true);
      panel.addEventListener('shown.bs.collapse', ensureCalendar, { once: true });
    } else {
      setChevron(false);
    }

    btn.addEventListener('click', () => {
      const isShown = panel.classList.contains('show');
      if (isShown) {
        bsCollapse.hide();
        localStorage.setItem(LS_KEY, '0');
        setChevron(false);
      } else {
        bsCollapse.show();
        localStorage.setItem(LS_KEY, '1');
        setChevron(true);
      }
    });

    panel.addEventListener('shown.bs.collapse', ensureCalendar);

    // En móviles: si usas offcanvas, recalcula tamaños al mostrarse
    const offcanvasEl = el(OFFCANVAS_ID);
    if (offcanvasEl) {
      offcanvasEl.addEventListener('shown.bs.offcanvas', () => {
        if (panel.classList.contains('show') && calendar) {
          calendar.updateSize();
        }
      });
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();


///v.1.2