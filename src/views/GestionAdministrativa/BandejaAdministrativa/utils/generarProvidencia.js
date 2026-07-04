import { jsPDF } from 'jspdf';

export function generarProvidencia(tramite) {
  const doc = new jsPDF();

  const fecha = new Date().toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Encabezado
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100);
  doc.text('REPÚBLICA BOLIVARIANA DE VENEZUELA', 105, 15, { align: 'center' });
  doc.text('MINISTERIO DEL ECOSOCIALISMO', 105, 21, { align: 'center' });
  doc.text('DIRECCIÓN GENERAL DE GESTIÓN AMBIENTAL', 105, 27, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(0, 128, 0);
  doc.setLineWidth(1);
  doc.line(20, 32, 190, 32);

  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('PROVIDENCIA ADMINISTRATIVA', 105, 45, { align: 'center' });

  // Número de providencia
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const numProvidencia = `PROV-${tramite.tipo === 'PERMISO' ? 'PER' : 'LIC'}-${tramite.id}-${new Date().getFullYear()}`;
  doc.text(`N° ${numProvidencia}`, 20, 55);
  doc.text(`Fecha: ${fecha}`, 20, 62);

  // Datos del solicitante
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('I. DATOS DEL SOLICITANTE', 20, 75);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre / Razón Social: ${tramite.solicitante}`, 25, 83);
  doc.text(`Cédula / RIF: ${tramite.cedulaRif}`, 25, 90);
  doc.text(`Dirección: ${tramite.direccion || 'No especificada'}`, 25, 97);
  doc.text(`Municipio: ${tramite.municipio || 'N/A'}, Estado: ${tramite.estado_geografico || 'N/A'}`, 25, 104);
  if (tramite.telefono) doc.text(`Teléfono: ${tramite.telefono}`, 25, 111);
  if (tramite.email) doc.text(`Email: ${tramite.email}`, 25, 118);

  // Datos del trámite
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('II. DATOS DEL TRÁMITE', 20, 130);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Tipo: ${tramite.tipo === 'PERMISO' ? 'Permiso Ambiental' : 'Licencia Ambiental'}`, 25, 138);
  doc.text(`Subtipo: ${tramite.subtipo || 'N/A'}`, 25, 145);
  doc.text(`Descripción: ${tramite.descripcion || 'No especificada'}`, 25, 152);

  // Fundamento legal
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('III. FUNDAMENTO LEGAL', 20, 165);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const fundamentoLegal = [
    'De conformidad con lo establecido en la Constitución de la República Bolivariana de Venezuela,',
    'la Ley Orgánica del Ambiente, la Ley Penal del Ambiente y demás normativa aplicable, esta',
    'Dirección General de Gestión Ambiental procede a otorgar la presente autorización ambiental.',
  ];
  doc.text(fundamentoLegal, 25, 173);

  // Resolución
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. RESOLUCIÓN', 20, 195);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const resolucion = [
    `Se ${tramite.tipo === 'PERMISO' ? 'OTORGA el PERMISO' : 'OTORGA la LICENCIA'} ambiental`,
    `a ${tramite.solicitante}, registrado(a) con ${tramite.cedulaRif}, para la realización`,
    `de actividades correspondientes a: ${tramite.subtipo}.`,
  ];
  doc.text(resolucion, 25, 203);

  // Firmas
  doc.setFontSize(9);
  doc.setTextColor(128);
  doc.text('Documento generado automáticamente por el Sistema de Gestión de Trámites Ambientales', 105, 270, { align: 'center' });
  doc.text(`Generado el ${new Date().toLocaleString('es-VE')}`, 105, 275, { align: 'center' });
  doc.text('Este documento requiere firma manuscrita del Director General para su validez.', 105, 280, { align: 'center' });

  // Guardar
  const nombreArchivo = `providencia_${tramite.tipo.toLowerCase()}_${tramite.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);

  return { success: true, nombreArchivo, numProvidencia };
}
