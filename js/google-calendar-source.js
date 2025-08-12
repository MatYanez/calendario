// js/google-calendar-source.js
// Lee eventos privados del calendario 'primary' del usuario con OAuth y los inyecta en FullCalendar.
// Requiere: <script async defer src="https://apis.google.com/js/api.js"></script>
// y que window._dashboardCalendar exista (lo expones en dashboard-calendar.js)

(function () {
  // ✅ TUS CREDENCIALES
  const CLIENT_ID = '866172124153-n0vg6red5pdadtm9ia61a9vksh79ip6j.apps.googleusercontent.com';
  const API_KEY   = 'AIzaSyAgIfQt1_SbtAlAhHQhvn_W2WN7fAtG478';

  const SCOPES    = 'https://www.googleapis.com/auth/calendar.readonly';
  const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SOURCE_ID = '__gcal_primary__'; // id interno para poder reemplazar la fuente

  // Obtiene rango visible del FullCalendar
  function getVisibleRange() {
    const cal = window._dashboardCalendar;
    if (!cal) return null;
    return {
      start: cal.view.activeStart.toISOString(),
      end: cal.view.activeEnd.toISOString()
    };
  }

  // Mapea eventos de Google Calendar a FullCalendar
  function mapGcalToFc(items) {
    return (items || []).map(ev => ({
      id: ev.id,
      title: ev.summary || '(sin título)',
      start: ev.start?.dateTime || ev.start?.date,   // date => allDay
      end:   ev.end?.dateTime   || ev.end?.date || null,
      allDay: !!ev.start?.date,
      backgroundColor: '#198754',
      borderColor: '#198754',
      extendedProps: {
        gcal: true,
        htmlLink: ev.htmlLink,
        organizer: ev.organizer?.email || null,
        hangoutLink: ev.hangoutLink || null
      }
    }));
  }

  // Inserta/reemplaza la fuente en FullCalendar
  function upsertSource(events) {
    const cal = window._dashboardCalendar;
    if (!cal) return;
    const prev = cal.getEventSourceById(SOURCE_ID);
    if (prev) prev.remove();
    cal.addEventSource({ id: SOURCE_ID, events });
  }

  async function listEvents() {
    const range = getVisibleRange();
    if (!range) return;
    const res = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: range.start,
      timeMax: range.end,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500
    });
    const items = res.result.items || [];
    upsertSource(mapGcalToFc(items));
    console.log(`[gcal] cargados ${items.length} eventos`);
  }

  // ---------- Auth ----------
  async function ensureSignedIn() {
    const auth = gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      await auth.signIn(); // popup
    }
  }

  async function initClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: [DISCOVERY],
      scope: SCOPES
    });

    await ensureSignedIn();
    await listEvents();

    // Recargar al cambiar de rango en FullCalendar
    const cal = window._dashboardCalendar;
    if (cal && !cal.__gcalHooked) {
      cal.__gcalHooked = true;
      cal.on('datesSet', () => { listEvents().catch(console.error); });
    }
  }

  function loadGapiAndInit() {
    gapi.load('client:auth2', () => {
      gapi.auth2.init({ client_id: CLIENT_ID })
        .then(initClient)
        .catch(console.error);
    });
  }

  // ---------- Botones conectar / desconectar ----------
  function wireButtons() {
    const byId = id => document.getElementById(id);

    const connect = byId('btnGcalConnect');
    if (connect) {
      const handler = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (window.gapi?.client) {
          ensureSignedIn().then(listEvents).catch(console.error);
        } else {
          waitFor(() => !!window.gapi, 50, 10000)
            .then(loadGapiAndInit)
            .catch(console.error);
        }
      };
      connect.addEventListener('click', handler, true);
      connect.addEventListener('pointerup', handler, true);
    }

    const disconnect = byId('btnGcalDisconnect');
    if (disconnect) {
      const handler = (e) => {
        e.preventDefault(); e.stopPropagation();
        try {
          const auth = gapi.auth2.getAuthInstance();
          auth.signOut().then(() => {
            const cal = window._dashboardCalendar;
            const src = cal?.getEventSourceById(SOURCE_ID);
            if (src) src.remove();
            console.log('[gcal] sesión cerrada y eventos removidos');
          });
        } catch (err) {
          console.error(err);
        }
      };
      disconnect.addEventListener('click', handler, true);
      disconnect.addEventListener('pointerup', handler, true);
    }
  }

  // Utilidad: esperar condición (p.ej., gapi cargó)
  function waitFor(cond, interval = 50, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const t = setInterval(() => {
        if (cond()) { clearInterval(t); resolve(true); }
        else if (Date.now() - start > timeout) { clearInterval(t); reject(new Error('timeout waitFor')); }
      }, interval);
    });
  }

  // Arranque
  document.addEventListener('DOMContentLoaded', () => {
    wireButtons();

    // Si calendario y gapi ya están, inicia; si no, espera
    const tryStart = () => {
      if (window._dashboardCalendar && window.gapi) { loadGapiAndInit(); return true; }
      return false;
    };

    if (!tryStart()) {
      waitFor(() => !!window._dashboardCalendar && !!window.gapi, 100, 10000)
        .then(loadGapiAndInit)
        .catch(() => console.warn('[gcal] esperando calendario o gapi...'));
    }
  });
})();
