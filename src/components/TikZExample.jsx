import React, { useState, useEffect } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import FileDownload from 'react-file-download';

// Default templates
const defaultTemplates = {
  'Rectangle with Circle': `
    \\documentclass{standalone}
    \\usepackage{tikz}
    \\begin{document}
    \\begin{tikzpicture}
      \\draw[fill=blue!20] (0,0) rectangle (4,2);
      \\draw[fill=red] (2,1) circle (0.5cm);
      \\node at (2, 1) {Circle};
    \\end{tikzpicture}
    \\end{document}
  `,
  'Bar Graph': `
    \\documentclass{standalone}
    \\usepackage{tikz}
    \\begin{document}
    \\begin{tikzpicture}
      \\draw[->] (0,0) -- (6,0) node[right] {X};
      \\draw[->] (0,0) -- (0,4) node[above] {Y};
      \\foreach \\x/\\y in {1/2, 2/3, 3/1.5, 4/3.5}
        \\draw[fill=blue!50] (\\x-0.2,0) bar (\\x+0.2,\\y);
    \\end{tikzpicture}
    \\end{document}
  `,
  'Organizational Chart': `
    \\documentclass{standalone}
    \\usepackage{tikz}
    \\usetikzlibrary{mindmap,trees}
    \\begin{document}
    \\begin{tikzpicture}
      \\node[concept] {Company}
        child[concept] {node {HR}}
        child[concept] {node {Tech}}
        child[concept] {node {Marketing}};
    \\end{tikzpicture}
    \\end{document}
  `,
};

const TikZEditor = () => {
  const [tikzCode, setTikzCode] = useState('');
  const [templates, setTemplates] = useState({});
  const [renderedSVG, setRenderedSVG] = useState(null);
  const [error, setError] = useState(null);

  // Load templates from localStorage
  useEffect(() => {
    const storedTemplates = localStorage.getItem('tikzTemplates');
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      setTemplates(defaultTemplates); // Use default templates if none exist in localStorage
    }
  }, []);

  // Store templates in localStorage whenever templates change
  useEffect(() => {
    if (Object.keys(templates).length > 0) {
      localStorage.setItem('tikzTemplates', JSON.stringify(templates));
    }
  }, [templates]);

  // Syntax checker (basic)
  const validateTikZSyntax = (code) => {
    const errors = [];
    if (!code.includes('\\begin{tikzpicture}')) {
      errors.push('Missing \\begin{tikzpicture}');
    }
    if (!code.includes('\\end{tikzpicture}')) {
      errors.push('Missing \\end{tikzpicture}');
    }
    return errors;
  };

  const renderTikZ = () => {
    // Check syntax before rendering
    const errors = validateTikZSyntax(tikzCode);
    if (errors.length > 0) {
      setError(errors.join(', '));
      setRenderedSVG(null); // Don't render if there are errors
      return;
    }

    setError(null); // Reset errors

    // Simulate rendering TikZ as SVG
    if (tikzCode.includes('rectangle')) {
      setRenderedSVG(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
          <rect x="50" y="50" width="300" height="100" fill="lightblue" />
          <circle cx="200" cy="100" r="50" fill="red" />
          <text x="200" y="105" font-size="20" text-anchor="middle" fill="black">Circle</text>
        </svg>`);
    } else if (tikzCode.includes('bar')) {
      setRenderedSVG(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
          <line x1="50" y1="150" x2="350" y2="150" stroke="black" />
          <line x1="50" y1="150" x2="50" y2="50" stroke="black" />
          <rect x="70" y="100" width="30" height="50" fill="blue" />
          <rect x="120" y="80" width="30" height="70" fill="blue" />
          <rect x="170" y="110" width="30" height="40" fill="blue" />
          <text x="200" y="170" font-size="12" text-anchor="middle">Bar Graph</text>
        </svg>`);
    } else if (tikzCode.includes('mindmap')) {
      setRenderedSVG(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
          <circle cx="200" cy="100" r="30" fill="green" />
          <text x="200" y="105" font-size="12" text-anchor="middle" fill="white">Company</text>
          <line x1="200" y1="100" x2="150" y2="50" stroke="black" />
          <line x1="200" y1="100" x2="250" y2="50" stroke="black" />
          <line x1="200" y1="100" x2="200" y2="150" stroke="black" />
          <text x="150" y="45" font-size="10" text-anchor="middle">HR</text>
          <text x="250" y="45" font-size="10" text-anchor="middle">Tech</text>
          <text x="200" y="165" font-size="10" text-anchor="middle">Marketing</text>
        </svg>`);
    } else {
      setRenderedSVG(`<pre>${tikzCode}</pre>`);
    }
  };

  const downloadCode = () => {
    FileDownload(tikzCode, 'diagram.tex');
  };

  const handleTemplateChange = (event) => {
    const selectedTemplate = event.target.value;
    const code = templates[selectedTemplate] || '';
    setTikzCode(code);
  };

  const handleTemplateModification = (name, newCode) => {
    const updatedTemplates = { ...templates, [name]: newCode };
    setTemplates(updatedTemplates);
  };

  const handleCodeChange = (e) => {
    setTikzCode(e.target.value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>TikZ Editor with Templates</h1>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Select Template:</label>
        <select onChange={handleTemplateChange} style={{ marginRight: '10px' }}>
          {Object.keys(templates).map((templateName) => (
            <option key={templateName} value={templateName}>
              {templateName}
            </option>
          ))}
        </select>
        <button onClick={renderTikZ} style={{ marginRight: '10px' }}>
          Render TikZ
        </button>
        <button onClick={downloadCode}>Download TikZ Code</button>
      </div>

      <CodeEditor
        value={tikzCode}
        language="tex"
        placeholder="Write your TikZ code here..."
        onChange={(e) => handleCodeChange(e)}
        padding={15}
        style={{
          fontSize: 14,
          backgroundColor: '#f5f5f5',
          fontFamily: 'monospace',
          marginBottom: '20px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <h2>Rendered TikZ Output</h2>
      <div
        dangerouslySetInnerHTML={{ __html: renderedSVG }}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          marginTop: '10px',
          backgroundColor: '#fff',
        }}
      />
    </div>
  );
};

export default TikZEditor;
