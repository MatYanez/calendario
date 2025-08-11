// js/sidebar-fullcalendar.js
(function () {
  const PANEL_ID = 'sidebarCalendarPanel';
  const CAL_ID = 'sidebarCalendar';
  const BTN_ID = 'btnToggleSidebarCalendar';
  const CHEVRON_ID = 'sidebarCalendarChevron';
  const OFFCANVAS_ID = 'sidebarMenu'; // si tu sidebar tiene otro id, cámbialo aquí
  const LS_KEY = 'sidebarCalendarOpen';

  let calendar = null;
  let bsCollapse = null;

  function el(id) { return document.getElementById(id); }

  function setChevron(open) {
    const chev = el(CHEVRON_ID);
    if (!chev) return;
    chev.classList.toggle('fa-chevron-down', !open);
    chev.classList.toggle('fa-chevron-up', open);
  }

  function ensureCalendar() {
    const calEl = el(CAL_ID);
    if (!calEl) return;
    if (!calendar) {
      // FullCalendar global build
      const { Calendar } = window.FullCalendar;
      calendar = new Calendar(calEl, {
        locale: 'es',
          firstDay: 1,
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: ''
        },
        height: 'auto',
        contentHeight: 'auto',
        dayMaxEventRows: 2,
        // Si más adelante quieres inyectar eventos desde Firestore:
        // events: async (info, success, failure) => { ... }
      });
    }
    // Render en cada apertura para asegurar tamaños correctos
    calendar.render();
    calendar.updateSize();
  }

  function init() {
    const panel = el(PANEL_ID);
    const btn = el(BTN_ID);
    if (!panel || !btn) return;

    // Collapse manual (sin auto toggle on load)
    bsCollapse = new bootstrap.Collapse(panel, { toggle: false });

    // Restaurar estado
    const open = localStorage.getItem(LS_KEY) === '1';
    if (open) {
      bsCollapse.show();
      setChevron(true);
      // Espera al fin de la animación para render seguro
      panel.addEventListener('shown.bs.collapse', ensureCalendar, { once: true });
    } else {
      setChevron(false);
    }

    // Toggle
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

    // Render al terminar de abrir
    panel.addEventListener('shown.bs.collapse', ensureCalendar);

    // En móviles: cuando abras el offcanvas, recalcula tamaños
    const offcanvasEl = document.getElementById(OFFCANVAS_ID);
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
