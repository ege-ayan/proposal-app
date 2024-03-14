import React, { useState, useEffect } from 'react';
import './TableBuilder.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const TableBuilder = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('data.json');
        const data = await response.json();
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    fetchData();
  }, []);

  const saveData = async () => {
    try {
      const response = await fetch('data.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categories),
      });
      if (response.ok) {
        console.log('Data saved successfully.');
      } else {
        console.error('Failed to save data.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };




  const handleExportToPDF = async () => {
    const doc = new jsPDF();
  
    categories.forEach((category, categoryIndex) => {
      
      // Add category title
      doc.text(category.name, 10, 10);
      
      // Select the table element for the category
      const table = document.querySelector(`#category-table-${categoryIndex}`);
      
      // Generate PDF from the table using jspdf-autotable
      doc.autoTable({
        html: table,
        theme: 'grid', // Theme style
        styles: { // Global styles
          fontSize: 10,
        },
        headStyles: { // Styles for table header
          fillColor: [255, 0, 0], // Blue color fill
        },
        bodyStyles: { // Styles for table body
           
          fillColor: [255, 255, 255],// Red color text
          textColor: [0, 0, 0]
        },
        footStyles: { // Styles for table footer
          fontStyle: 'italic', // Italic font style
        },
        alternateRowStyles: { // Styles for alternate rows
          textColor: [0, 0, 0], // Yellow color fill
        },
        columnStyles: { // Styles for specific columns
          0: { fontStyle: 'bold' }, // Bold font style for column index 0
        },
      });
      // Add some vertical distance
      doc.text('', 10, 70); // You can adjust the Y-coordinate for the desired distance
    });
  
    const generatedPDFBytes = doc.output('arraybuffer');
    const existingPDFBytes = await fetch('infinia.pdf').then((res) => res.arrayBuffer());
  
    const generatedPDFDoc = await PDFDocument.load(generatedPDFBytes);
    const existingPDFDoc = await PDFDocument.load(existingPDFBytes);
  
    // Copy pages from generated PDF to existing PDF
    const copiedPages = await existingPDFDoc.copyPages(generatedPDFDoc, generatedPDFDoc.getPageIndices());
    copiedPages.forEach((page) => {
      existingPDFDoc.insertPage(6, page); // Insert at page 7 (zero-based index)
    });
  
    // Save the modified PDF with the new pages added
    const modifiedPDFBytes = await existingPDFDoc.save();
  
    // Create a Blob from modified PDF bytes
    const blob = new Blob([modifiedPDFBytes], { type: 'application/pdf' });
  
    // Create a temporary anchor element to download the modified PDF
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = 'modified_pdf_with_tables.pdf';
  
    // Simulate a click on the anchor element to trigger the download
    downloadLink.click();
  };

  

  const handleAddCategory = () => {
    if (newCategory.trim() !== '') {
      const newCategoryData = { name: newCategory, rows: [{ id: 1, name: '', values: {} }], columns: [{ name: "" }] };
      setCategories([...categories, newCategoryData]);
      setNewCategory('');
      saveData();
    }
  };

  const handleDeleteCategory = (index) => {
    const updatedCategories = [...categories];
    updatedCategories.splice(index, 1);
    setCategories(updatedCategories);
    saveData();
  };

  const handleAddRow = (index) => {
    const rowName = prompt('Enter the name of the new row:');
    if (rowName !== null && rowName.trim() !== '') {
      const updatedCategories = [...categories];
      const newRowId = updatedCategories[index].rows.length + 1;
      const newRowValues = {};
      updatedCategories[index].columns.forEach(column => {
        newRowValues[column.name] = '';
      });
      updatedCategories[index].rows.push({ id: newRowId, name: rowName, values: newRowValues });
      setCategories(updatedCategories);
      saveData();
    }
  };

  const handleAddColumn = (index) => {
    const columnName = prompt('Enter the name of the new column:');
    if (columnName !== null && columnName.trim() !== '') {
      const updatedCategories = [...categories];
      updatedCategories[index].columns.push({ name: columnName });
      updatedCategories[index].rows.forEach(row => {
        row.values[columnName] = '';
      });
      setCategories(updatedCategories);
      saveData();
    }
  };

  const handleCellValueChange = (categoryIndex, rowIndex, columnName, value) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].rows[rowIndex].values[columnName] = value;
    setCategories(updatedCategories);
    saveData();
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="container">
      <div className="input-container">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter category name"
        />
        <button className="add-button" onClick={handleAddCategory}>Add Category</button>
      </div>
      <div>
        {categories.map((category, index) => (
         <div key={index} className="category-container">
         <div className="category-header">
           <h3>{category.name}</h3>
           <div className="button-container">
           <button className="add-button" onClick={() => handleAddRow(index)}>Add Row</button>
           <button className="add-button" onClick={() => handleAddColumn(index)}>Add Column</button>
           <button className="delete-button" onClick={() => handleDeleteCategory(index)}>Delete</button>
         </div>
        
         
         <table className="category-table" key={index}>
           <thead>
             <tr>
               {category.columns.map((column, columnIndex) => (
                 <th key={columnIndex}>{column.name}</th>
               ))}
             </tr>
           </thead>
           <tbody>
             {category.rows.map((row, rowIndex) => (
               <tr key={row.id}>
                 {category.columns.map((column, colIndex) => (
                   <td key={colIndex}>
                     {colIndex === 0 ? (
                       <input
                         type="text"
                         value={row.name || ''}
                         onChange={(e) => {
                           const updatedCategories = [...categories];
                           updatedCategories[index].rows[rowIndex].name = e.target.value;
                           setCategories(updatedCategories);
                           saveData();
                         }}
                       />
                     ) : (
                       <input
                         type="text"
                         value={row.values[column.name] || ''}
                         onChange={(e) => handleCellValueChange(index, rowIndex, column.name, e.target.value)}
                       />
                     )}
                   </td>
                 ))}
               </tr>
             ))}
           </tbody>
         </table>
       </div>
       </div>
        
        ))}
      </div>
      <button className="submit-button" onClick={handleSubmit}>Submit</button>
      <button onClick={handleExportToPDF}>Download PDF</button>
      {submitted && (
        <div>
          <h2>Generated Table</h2>
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3>{category.name}</h3>
              <table id={`category-table-${categoryIndex}`} className="generated-table" key={categoryIndex}>
                <thead>
                  <tr>
                    {category.columns.map((column, columnIndex) => (
                      <th key={columnIndex}>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {category.rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      {category.columns.map((column, colIndex) => (
                        <td key={colIndex}>{colIndex === 0 ? row.name : row.values[column.name]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableBuilder;
