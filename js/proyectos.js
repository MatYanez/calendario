// Mostrar inputs "otro" si se selecciona esa opción
document.getElementById("proyecto-tipo").addEventListener("change", function () {
  document.getElementById("proyecto-otro").classList.toggle("d-none", this.value !== "Otro");
});

document.getElementById("proyecto-p0").addEventListener("change", function () {
  document.getElementById("proyecto-p0-otro").classList.toggle("d-none", this.value !== "Otro");
});

// Guardar proyecto
document.getElementById("form-proyecto").addEventListener("submit", function (e) {
  e.preventDefault();

  const tipo = document.getElementById("proyecto-tipo").value === "Otro"
    ? document.getElementById("proyecto-otro").value
    : document.getElementById("proyecto-tipo").value;

  const nombre = document.getElementById("proyecto-nombre").value;

  if (!tipo || !nombre) {
    alert("Los campos Proyecto y Nombre de proyecto son obligatorios.");
    return;
  }

  const p0 = document.getElementById("proyecto-p0").value === "Otro"
    ? document.getElementById("proyecto-p0-otro").value
    : document.getElementById("proyecto-p0").value;

  const proyecto = {
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

  db.collection("proyectos").add(proyecto)
    .then(() => {
      alert("Proyecto registrado correctamente.");
      document.getElementById("form-proyecto").reset();
      document.getElementById("proyecto-otro").classList.add("d-none");
      document.getElementById("proyecto-p0-otro").classList.add("d-none");
      bootstrap.Modal.getInstance(document.getElementById("modalProyecto")).hide();
    })
    .catch(err => {
      console.error("Error al guardar:", err);
      alert("Error al guardar el proyecto.");
    });
});
