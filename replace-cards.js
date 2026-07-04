const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/views/RRHH/Empleados/listEmpleados.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<CCard className="eco-card/g, '<div className="premium-panel');
content = content.replace(/<CCardBody/g, '<div');
content = content.replace(/<\/CCardBody>/g, '</div>');
content = content.replace(/<\/CCard>/g, '</div>');
content = content.replace(/<CCardHeader/g, '<div className="d-flex justify-content-between align-items-center mb-4"');
content = content.replace(/<\/CCardHeader>/g, '</div>');
content = content.replace(/<CCardFooter/g, '<div className="mt-4 pt-4 border-top"');
content = content.replace(/<\/CCardFooter>/g, '</div>');

// Remove border-0 and eco-card classes from the divs
content = content.replace(/className="premium-panel[^"]*"/g, 'className="premium-panel mb-4"');

fs.writeFileSync(file, content, 'utf8');
console.log('Cards replaced in listEmpleados.js');
