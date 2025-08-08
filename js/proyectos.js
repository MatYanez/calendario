// 🔁 Registro de proyecto
document.getElementById("form-proyecto").addEventListener("submit", function (e) {
  e.preventDefault();

  const tipo = document.getElementById("proyecto-tipo").value === "Otro"
    ? document.getElementById("proyecto-otro").value
    : document.getElementById("proyecto-tipo").value;

  const nombre = document.getElementById("proyecto-nombre").value;

  if (!tipo || !nombre) {
    mostrarNotificacion("Los campos Proyecto y Nombre de proyecto son obligatorios.", "error");
    return;
  }

  const p0 = document.getElementById("proyecto-p0").value === "Otro"
    ? document.getElementById("proyecto-p0-otro").value
    : document.getElementById("proyecto-p0").value;

  const proyectoData = {
    tipo,
    nombre,
    p0,
    categoria: document.getElementById("proyecto-categoria").value,
    propietario: document.getElementById("proyecto-propietario").value,
    estado: document.getElementById("proyecto-estado").value,
    limiteVRA: document.getElementById("proyecto-limite-vra").value,
    vra: document.getElementById("proyecto-vra").value,
    limiteFirma: document.getElementById("proyecto-limite-firma").value,
    firmaSG: document.getElementById("proyecto-firma-sg").value,
    cierre: document.getElementById("proyecto-cierre").value,
    notas: document.getElementById("proyecto-notas").value,
    distribuible: document.getElementById("proyecto-distribuible").value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  const contadorRef = db.collection("config").doc("contadorProyectos");

  db.runTransaction(async (transaction) => {
    const contadorDoc = await transaction.get(contadorRef);
    let nuevoID = 1;

    if (contadorDoc.exists) {
      nuevoID = contadorDoc.data().valor + 1;
    }

    transaction.set(contadorRef, { valor: nuevoID });
    const proyectoRef = db.collection("proyectos").doc(nuevoID.toString());
    transaction.set(proyectoRef, {
      id: nuevoID,
      ...proyectoData
    });

    return nuevoID;
  })
    .then((nuevoID) => {
      mostrarNotificacion(`Proyecto registrado con ID #${nuevoID}`, "exito");
      document.getElementById("form-proyecto").reset();
      document.getElementById("proyecto-otro").classList.add("d-none");
      document.getElementById("proyecto-p0-otro").classList.add("d-none");
      bootstrap.Modal.getInstance(document.getElementById("modalProyecto")).hide();
      document.activeElement.blur();
    })
    .catch((error) => {
      console.error("Error en la transacción:", error);
      mostrarNotificacion("Error al guardar el proyecto", "error");
    });
});

// 🔁 Render tarjetas de proyectos
document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("contenedor-proyectos");

  db.collection("proyectos").orderBy("id").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();

        const categoria = data.categoria || "Desarrollo";
        const nombre = data.nombre || "Proyecto sin nombre";
        const fondo = data.tipo || "Fondo desconocido";
        const avance = Math.floor(Math.random() * 100) + 1;

        const badgeClass = {
          "Prioritario": "bg-danger",
          "Asociados": "bg-warning text-dark",
          "Desarrollo": "bg-secondary"
        }[categoria] || "bg-secondary";

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4 mb-4";

        card.innerHTML = `
          <div class="card shadow-sm h-100" role="button">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span class="badge ${badgeClass}">${categoria}</span>
            </div>
            <div class="card-body">
              <h5 class="card-title">${nombre}</h5>
              <p class="card-text text-muted">${fondo}</p>
            </div>
          </div>
        `;

        card.querySelector('.card').addEventListener('click', () => {
          document.getElementById('contenedor-proyectos').classList.add('d-none');
          document.getElementById('detalle-proyecto').classList.remove('d-none');

          document.getElementById('detalle-nombre').textContent = nombre;
          document.getElementById('detalle-tipo').textContent = fondo;

          const badge = document.getElementById('detalle-categoria');
          badge.textContent = categoria;
          badge.className = `badge ${badgeClass}`;

          document.getElementById('detalle-proyecto').dataset.id = doc.id;
          document.getElementById('detalle-proyecto').dataset.info = JSON.stringify(data);
        });

        contenedor.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Error al cargar tarjetas:", error);
      mostrarNotificacion("Error al cargar proyectos", "error");
    });
});

// 🔁 Botón ATRÁS
document.getElementById('btn-volver').addEventListener('click', () => {
  document.getElementById('detalle-proyecto').classList.add('d-none');
  document.getElementById('contenedor-proyectos').classList.remove('d-none');
});

// ✏️ Botón EDITAR: abre modal con datos precargados
document.getElementById('btn-editar').addEventListener('click', () => {
  const id = document.getElementById('detalle-proyecto').dataset.id;
  const data = JSON.parse(document.getElementById('detalle-proyecto').dataset.info);

  // Prellenar campos del modal
  document.getElementById("proyecto-tipo").value = ["ANID", "FONDART"].includes(data.tipo) ? data.tipo : "Otro";
  document.getElementById("proyecto-otro").value = ["ANID", "FONDART"].includes(data.tipo) ? "" : data.tipo;
  document.getElementById("proyecto-otro").classList.toggle("d-none", data.tipo === "ANID" || data.tipo === "FONDART");

  document.getElementById("proyecto-nombre").value = data.nombre || "";
  document.getElementById("proyecto-p0").value = data.p0 === "P0" ? "P0" : "Otro";
  document.getElementById("proyecto-p0-otro").value = data.p0 === "P0" ? "" : data.p0 || "";
  document.getElementById("proyecto-p0-otro").classList.toggle("d-none", data.p0 === "P0");

  document.getElementById("proyecto-categoria").value = data.categoria || "";
  document.getElementById("proyecto-propietario").value = data.propietario || "";
  document.getElementById("proyecto-estado").value = data.estado || "";
  document.getElementById("proyecto-limite-vra").value = data.limiteVRA || "";
  document.getElementById("proyecto-vra").value = data.vra || "";
  document.getElementById("proyecto-limite-firma").value = data.limiteFirma || "";
  document.getElementById("proyecto-firma-sg").value = data.firmaSG || "";
  document.getElementById("proyecto-cierre").value = data.cierre || "";
  document.getElementById("proyecto-notas").value = data.notas || "";
  document.getElementById("proyecto-distribuible").value = data.distribuible || "";

  const modal = new bootstrap.Modal(document.getElementById('modalProyecto'));
  modal.show();

  mostrarNotificacion("Editando proyecto. No olvides guardar", "alerta");
});

//v1.5