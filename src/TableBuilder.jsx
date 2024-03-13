import React, { useState, useEffect } from 'react';
import './TableBuilder.css';


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
      {submitted && (
        <div>
          <h2>Generated Table</h2>
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3>{category.name}</h3>
              <table className="generated-table">
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
