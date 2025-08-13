// js/google-calendar-source.js
// Integra Google Calendar (privado) con OAuth y FullCalendar.
// Requiere: <script async defer src="https://apis.google.com/js/api.js"></script>
// y que window._dashboardCalendar exista (lo expones en dashboard-calendar.js)
// Usa gapi.client + gapi.auth2 (flujo popup). Carga e inicializa de forma robusta.

(function () {
  // ===== CREDENCIALES =====
  const CLIENT_ID = '866172124153-67a30203sq77e78vkhkl3fqmaduv3e8d.apps.googleusercontent.com';
  const API_KEY   = 'AIzaSyDH3fcelNs-FJDRKHD6nPylRUa7d5i7vyI';


  // ===== CONST =====
  const SCOPES    = 'https://www.googleapis.com/auth/calendar.readonly';
  const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SOURCE_ID = '__gcal_primary__';

  // ===== UTILS =====
  const waitFor = (cond, interval = 50, timeout = 10000) => new Promise((resolve, reject) => {
    const start = Date.now();
    const t = setInterval(() => {
      try {
        if (cond()) { clearInterval(t); resolve(true); }
        else if (Date.now() - start > timeout) { clearInterval(t); reject(new Error('waitFor timeout')); }
      } catch (e) { clearInterval(t); reject(e); }
    }, interval);
  });

  const log = (...args) => console.log('[gcal]', ...args);
  const warn = (...args) => console.warn('[gcal]', ...args);
  const error = (...args) => console.error('[gcal]', ...args);

  // ===== FC helpers =====
  function getVisibleRange() {
    const cal = window._dashboardCalendar;
    if (!cal) return null;
    return {
      start: cal.view.activeStart.toISOString(),
      end:   cal.view.activeEnd.toISOString()
    };
  }

  function mapGcalToFc(items) {
    return (items || []).map(ev => ({
      id: ev.id,
      title: ev.summary || '(sin título)',
      start: ev.start?.dateTime || ev.start?.date,
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

  function upsertSource(events) {
    const cal = window._dashboardCalendar;
    if (!cal) return;
    const prev = cal.getEventSourceById(SOURCE_ID);
    if (prev) prev.remove();
    cal.addEventSource({ id: SOURCE_ID, events });
  }

  async function listEvents() {
    const range = getVisibleRange();
    if (!range) { warn('No hay calendario visible aún.'); return; }
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
    log(`cargados ${items.length} eventos para ${new Date(range.start).toDateString()} → ${new Date(range.end).toDateString()}`);
  }

  // ===== GAPI AUTH FLOW (robusto) =====
  let _initing = false;

  async function ensureGapiLoaded() {
    if (window.gapi) return true;
    await waitFor(() => !!window.gapi, 50, 15000);
    return true;
  }

  async function ensureClientAndAuth2() {
    await ensureGapiLoaded();

    return new Promise((resolve, reject) => {
      try {
        gapi.load('client:auth2', async () => {
          try {
            // init client (API key + discovery)
            if (!gapi.client?.calendar) {
              await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY]
              });
              log('gapi.client inicializado');
            }

            // init auth2 (si no existe)
            if (!gapi.auth2 || !gapi.auth2.getAuthInstance?.()) {
              await gapi.auth2.init({ client_id: CLIENT_ID, scope: SCOPES });
              log('gapi.auth2 inicializado');
            }
            resolve(true);
          } catch (e) {
            error('Error en gapi.client.init / gapi.auth2.init', e);
            reject(e);
          }
        });
      } catch (e) {
        error('Error al cargar módulos client:auth2', e);
        reject(e);
      }
    });
  }

  async function ensureSignedIn() {
    const auth = gapi.auth2.getAuthInstance();
    if (!auth) throw new Error('auth2 no inicializado');
    if (!auth.isSignedIn.get()) {
      log('Solicitando login (popup)…');
      await auth.signIn();
      log('Login OK');
    } else {
      log('Ya estaba autenticado');
    }
  }

  async function startFlow() {
    try {
      if (_initing) { log('Inicio en curso…'); return; }
      _initing = true;

      await ensureClientAndAuth2();
      await ensureSignedIn();
      await listEvents();

      // Hook para recargar al cambiar fechas
      const cal = window._dashboardCalendar;
      if (cal && !cal.__gcalHooked) {
        cal.__gcalHooked = true;
        cal.on('datesSet', () => { listEvents().catch(error); });
      }
    } catch (e) {
      error('Fallo startFlow', e);
      alert('No se pudo conectar con Google Calendar. Revisa la consola.');
    } finally {
      _initing = false;
    }
  }

  // ===== Botones =====
  function wireButtons() {
    const byId = id => document.getElementById(id);
    const bind = (id, fn) => {
      const el = byId(id);
      if (!el) { warn(`Botón ${id} no encontrado (opcional).`); return; }
      const handler = (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
      el.addEventListener('click', handler, true);
      el.addEventListener('pointerup', handler, true);
    };

    bind('btnGcalConnect', () => {
      log('Conectar pulsado');
      startFlow(); // SIEMPRE corre el flujo robusto
    });

    bind('btnGcalDisconnect', async () => {
      try {
        const auth = gapi?.auth2?.getAuthInstance?.();
        if (auth) {
          await auth.signOut();
          const cal = window._dashboardCalendar;
          cal?.getEventSourceById(SOURCE_ID)?.remove();
          log('Sesión cerrada y eventos removidos');
        } else {
          warn('auth2 no estaba inicializado');
        }
      } catch (e) {
        error(e);
      }
    });
  }

  // ===== Arranque =====
  document.addEventListener('DOMContentLoaded', async () => {
    wireButtons();

    // Si gapi ya cargó y tu calendario existe, permite “auto-inicio” opcional:
    // (si quieres auto-conectar, descomenta la siguiente línea)
    // startFlow();

    // O espera a que exista el calendario antes de permitir flujo:
    if (!window._dashboardCalendar) {
      try {
        await waitFor(() => !!window._dashboardCalendar, 100, 10000);
        log('FullCalendar disponible.');
      } catch {
        warn('No apareció window._dashboardCalendar (¿se expuso en dashboard-calendar.js?)');
      }
    }
  });
})();


//v1.5
