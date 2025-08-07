document.addEventListener("DOMContentLoaded", function () {
  const tabla = $('#tabla-proyectos').DataTable({
    language: {
      url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
    },
    data: [],
    columns: [
      { data: 'tipo' },         
      { data: 'nombre' },        
      { data: 'p0' },
      { data: 'categoria' },
      { data: 'propietario' },
      { data: 'estado' },
      { data: 'limiteVRA' },
      { data: 'vra' },
      { data: 'limiteFirma' },
      { data: 'firmaSG' },
      { data: 'cierre' },
      { data: 'notas' },
      { data: 'distribuible' }
    ]
  });

  db.collection("proyectos").orderBy("id").get()
    .then(snapshot => {
      const proyectos = [];
      snapshot.forEach(doc => {
        proyectos.push(doc.data());
      });
      tabla.clear().rows.add(proyectos).draw();
    })
    .catch(error => {
      console.error("Error al cargar proyectos:", error);
      mostrarNotificacion("Error al cargar proyectos", "error");
    });
});
