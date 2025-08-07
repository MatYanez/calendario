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


document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("contenedor-proyectos");

  db.collection("proyectos").orderBy("id").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();

        // Datos simulados (por ahora)
        const categoria = data.categoria || "Desarrollo";
        const nombre = data.nombre || "Proyecto sin nombre";
        const fondo = data.tipo || "Fondo desconocido";
        const avance = Math.floor(Math.random() * 100) + 1; // avance simulado

        const badgeClass = {
          "Prioritario": "bg-danger",
          "Asociados": "bg-warning text-dark",
          "Desarrollo": "bg-secondary"
        }[categoria] || "bg-secondary";

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4 mb-4";

        card.innerHTML = `
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span class="badge ${badgeClass}">${categoria}</span>
            </div>
            <img src="https://via.placeholder.com/600x300.png?text=Proyecto" class="card-img-top" alt="Imagen del proyecto">
            <div class="card-body">
              <h5 class="card-title">${nombre}</h5>
              <p class="card-text text-muted">${fondo}</p>
              <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${avance}%;" aria-valuenow="${avance}" aria-valuemin="0" aria-valuemax="100">${avance}%</div>
              </div>
            </div>
          </div>
        `;

        contenedor.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Error al cargar tarjetas:", error);
      mostrarNotificacion("Error al cargar proyectos", "error");
    });
});


//v1.1