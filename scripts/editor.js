function loadFile() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
    fileInput.addEventListener('change', function() {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function(event) {
        const xmlString = event.target.result;
        displayXML(xmlString);
        document.getElementById('saveBtn').style.display = 'block';
      };
      reader.readAsText(file);
    });
  }
  
  function displayXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const table = document.getElementById('xmlTable');
    table.innerHTML = ''; // Clear previous content
    
    const rootNode = xmlDoc.documentElement;
    const rows = ['<tr><th>Node</th><th>Value</th></tr>'];
    parseNode(rootNode, rows);
    table.innerHTML = rows.join('');
  }
  
  function parseNode(node, rows, indent = 0) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const nodeName = node.nodeName;
      const nodeValue = getNodeValue(node);
      rows.push(`<tr><td style="padding-left: ${indent * 20}px">${nodeName}</td><td contenteditable="true">${nodeValue}</td></tr>`);
      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        parseNode(children[i], rows, indent + 1);
      }
    }
  }
  
  function getNodeValue(node) {
    if (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) {
      return node.firstChild.nodeValue.trim();
    }
    return '';
  }
  
  function saveFile() {
    const table = document.getElementById('xmlTable');
    const rows = table.querySelectorAll('tr');
    let xmlString = '';
    xmlString += '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlString += '<root>\n';
    rows.forEach(row => {
      const nodeName = row.cells[0].textContent.trim();
      const nodeValue = row.cells[1].textContent.trim();
      if (nodeName !== '') {
        xmlString += `\t<${nodeName}>${nodeValue}</${nodeName}>\n`;
      }
    });
    xmlString += '</root>';
  
    const fileName = document.getElementById('fileInput').files[0].name;
    const blob = new Blob([xmlString], {type: 'text/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }