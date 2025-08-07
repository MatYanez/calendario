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

//v1