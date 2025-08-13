// js/google-calendar-source.js
// Integra Google Calendar (privado) con OAuth y FullCalendar.
// Requiere: <script async defer src="https://apis.google.com/js/api.js"></script>
// y que window._dashboardCalendar exista (lo expones en dashboard-calendar.js)
// Usar Google Identity Services para login (no gapi.auth2)

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

  // ===== GAPI CLIENT LOADER =====
  let _initing = false;

  async function ensureGapiLoaded() {
    if (window.gapi) return true;
    await waitFor(() => !!window.gapi, 50, 15000);
    return true;
  }

  async function ensureClient() {
    await ensureGapiLoaded();

    return new Promise((resolve, reject) => {
      try {
        gapi.load('client', async () => {
          try {
            if (!gapi.client?.calendar) {
              await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY]
              });
              log('gapi.client inicializado');
            }
            resolve(true);
          } catch (e) {
            error('Error en gapi.client.init', e);
            reject(e);
          }
        });
      } catch (e) {
        error('Error al cargar módulo client', e);
        reject(e);
      }
    });
  }

  // ===== START FLOW (sin auth2, sólo gapi client) =====
async function startFlow() {
  try {
    if (_initing) { log('Inicio en curso…'); return; }
    _initing = true;

    await ensureClient(); // Inicializa gapi.client con apiKey y discoveryDocs

    await listEvents(); // Esta función ahora usará el token seteado en gapi.client

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
    if (!tokenClient) {
      initGSI();
    }
    requestAccessToken();
  });

  bind('btnGcalDisconnect', async () => {
    try {
      log('Desconectar pulsado');

      // Revocar token para cerrar sesión GSI
      if (gapi.client.getToken()) {
        const accessToken = gapi.client.getToken().access_token;
        if (accessToken) {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-type': 'application/x-www-form-urlencoded' },
          });
          log('Token revocado');
        }
      }

      // Limpiar token en gapi.client
      gapi.client.setToken(null);

      // Quitar eventos del calendario
      const cal = window._dashboardCalendar;
      cal?.getEventSourceById(SOURCE_ID)?.remove();

      alert('Sesión cerrada correctamente');
    } catch (e) {
      error(e);
    }
  });
}


  // ===== Arranque =====
  document.addEventListener('DOMContentLoaded', async () => {
    wireButtons();

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



// Google Identity Services: flujo manual para obtener access token
const CLIENT_ID = '866172124153-67a30203sq77e78vkhkl3fqmaduv3e8d.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;

function initGSI() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error('Error token:', tokenResponse);
        alert('No se pudo obtener el token');
        return;
      }
      console.log('Token recibido:', tokenResponse.access_token);

      // Guardar token para usarlo con gapi.client
      gapi.client.setToken({ access_token: tokenResponse.access_token });

      // Ahora ya puedes llamar la API de Calendar
      listEvents();
    }
  });
}

function requestAccessToken() {
  if (!tokenClient) {
    console.error('tokenClient no inicializado');
    return;
  }
  tokenClient.requestAccessToken();
}




//v1.8