// js/app.js

import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const tbody = document.querySelector('#projects-table tbody');

async function cargarProyectos() {
  tbody.innerHTML = ''; // limpia tabla
  const querySnapshot = await getDocs(collection(db, "proyectos"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${data.proyecto || ''}</td>
      <td>${data.prioridad || ''}</td>
      <td>${data.categorizacion || ''}</td>
      <td>${data.propietario || ''}</td>
      <td>${data.estado || ''}</td>
      <td>${data.limite_vracat || ''}</td>
      <td>${data.vracat ? '✅' : '❌'}</td>
      <td>${data.limite_firma || ''}</td>
      <td>${data.firma_sg || ''}</td>
      <td>${data.fecha_cierre || ''}</td>
      <td>${data.notas || ''}</td>
      <td>${data.distribuible || ''}</td>
    `;
    tbody.appendChild(row);
  });
}

cargarProyectos();
