import {
    TabulatorFull as Tabulator
  } from 'tabulator-tables';


export function setUpSearchInTable(registersTable: Tabulator, memoryTable: Tabulator) {
  setUpSearchInRegisterTable(registersTable);
  setUpSearchInMemoryTable(memoryTable);

}

function setUpSearchInRegisterTable(registersTable: Tabulator) {
  const searchRegisterInput = document.getElementById('searchRegisterInput') as HTMLInputElement | null;
  if (!searchRegisterInput) {
    console.error('Search input for registers not found');
    return;
  }

  searchRegisterInput.addEventListener('input', () => {
    const input = searchRegisterInput.value.trim();
    if (input === '') {
      registersTable.clearFilter(true);
      resetCellColors(registersTable);
      return;
    }
    filterTableData(registersTable, input);
  });

  searchRegisterInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      searchRegisterInput.value = '';
      registersTable.clearFilter(true);
      resetCellColors(registersTable);
    }
  });
}

function filterTableData(table: Tabulator, searchInput: string) {
  // Reiniciamos los colores en todas las celdas
  resetCellColors(table);

  // Caso hexadecimal: si el input inicia con "0x"
  if (searchInput.toLowerCase().startsWith("0x")) {
    const hexPart = searchInput.slice(2);
    const num = parseInt(hexPart, 16);
    const binaryHex = num.toString(2);

    table.setFilter((data: any) => {
      const valueStr = data.value?.toString().toLowerCase() || "";
      return valueStr.includes(binaryHex);
    });

    // Resaltamos únicamente las celdas de la columna "value" que contienen la cadena en binario
    table.getRows().forEach(row => {
      row.getCells().forEach(cell => {
        if (cell.getField() === "value") {
          const cellValue = cell.getValue()?.toString().toLowerCase() || "";
          if (cellValue.includes(binaryHex)) {
            cell.getElement().style.backgroundColor = "#D1E3E7";
          }
        }
      });
    });
  } else {
    // Caso no hexadecimal: se busca en ambas columnas "name" y "value"
    const lowerSearch = searchInput.toLowerCase();
    let isNumeric = false;
    let candidateFromDecimal = "";
    let candidateFromUnsigned = "";

    // Si el input contiene únicamente 0 y 1, lo tratamos como binario;
    // de lo contrario, si es numérico en base 10, lo convertimos.
    if (/^[01]+$/.test(searchInput)) {
      // Es formato binario.
      isNumeric = true;
      // Versión mínima: se quitan los ceros a la izquierda (si la cadena queda vacía se asume "0")
      candidateFromDecimal = searchInput.replace(/^0+/, '') || "0";
      // Versión de 32 bits (si ya tiene 32 caracteres se mantiene igual)
      candidateFromUnsigned = searchInput.padStart(32, '0');
    } else if (!isNaN(parseInt(searchInput, 10))) {
      // Es numérico en decimal
      isNumeric = true;
      const parsed = parseInt(searchInput, 10);
      if (parsed < 0) {
        const bits = 8;
        candidateFromDecimal = ((1 << bits) + parsed).toString(2).padStart(bits, '0');
      } else {
        candidateFromDecimal = parsed.toString(2);
      }
      candidateFromUnsigned = parsed.toString(2).padStart(32, '0');
    }

    table.setFilter((data: any) => {
      const nameStr = data.name?.toLowerCase() || "";
      const valueStr = data.value?.toString().toLowerCase() || "";
      if (isNumeric) {
        return (
          nameStr.includes(lowerSearch) ||
          nameStr.includes(candidateFromDecimal) ||
          nameStr.includes(candidateFromUnsigned) ||
          valueStr.includes(lowerSearch) ||
          valueStr.includes(candidateFromDecimal) ||
          valueStr.includes(candidateFromUnsigned)
        );
      } else {
        return nameStr.includes(lowerSearch) || valueStr.includes(lowerSearch);
      }
    });

    // Resaltamos las celdas en "name" y "value" que contengan alguna de las coincidencias
    table.getRows().forEach(row => {
      row.getCells().forEach(cell => {
        const field = cell.getField();
        const cellValue = cell.getValue()?.toString().toLowerCase() || "";
        if (isNumeric) {
          if (
            (field === "name" || field === "value") &&
            (cellValue.includes(lowerSearch) ||
             cellValue.includes(candidateFromDecimal) ||
             cellValue.includes(candidateFromUnsigned))
          ) {
            cell.getElement().style.backgroundColor = "#D1E3E7";
          }
        } else {
          if ((field === "name" || field === "value") && cellValue.includes(lowerSearch)) {
            cell.getElement().style.backgroundColor = "#D1E3E7";
          }
        }
      });
    });
  }
}

function resetCellColors(table: Tabulator) {
  table.getRows().forEach(row => {
    row.getCells().forEach(cell => {
      cell.getElement().style.backgroundColor = "";
    });
  });
}




  function setUpSearchInMemoryTable(memoryTable: Tabulator) {
    const searchMemoryInput = document.getElementById('searchMemoryInput') as HTMLInputElement | null;
    if (!searchMemoryInput) {
      console.error('Search input for memory not found');
      return;
    }
  
    searchMemoryInput.addEventListener('input', () => {
      let searchValue = searchMemoryInput.value.trim().toLowerCase();
      if (searchValue === '') {
        memoryTable.clearFilter(true);
        resetMemoryCellColors(memoryTable);
        return;
      }
      filterMemoryTableData(memoryTable, searchValue);
    });
  
    searchMemoryInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchMemoryInput.value = '';
        memoryTable.clearFilter(true);
        resetMemoryCellColors(memoryTable);
      }
    });
  }
  
  function filterMemoryTableData(table: Tabulator, searchValue: string) {
    resetMemoryCellColors(table);
  
    const searchTerms = searchValue.split(/\s+/);

    table.setFilter((data: any) => {
      const addr   = data.address?.toLowerCase() || '';
      const value3 = data.value3?.toLowerCase() || '';
      const value2 = data.value2?.toLowerCase() || '';
      const value1 = data.value1?.toLowerCase() || '';
      const value0 = data.value0?.toLowerCase() || '';
      const hex    = data.hex?.toLowerCase() || '';
  
      return searchTerms.every(term =>
        addr.includes(term) ||
        value3.includes(term) ||
        value2.includes(term) ||
        value1.includes(term) ||
        value0.includes(term) ||
        hex.includes(term)
      );
    });
  
    table.getRows().forEach(row => {
      row.getCells().forEach(cell => {
        const cellValue = cell.getValue()?.toString().toLowerCase() || '';
        if (searchTerms.some(term => cellValue.includes(term))) {
          cell.getElement().style.backgroundColor = '#D1E3E7';
        }
      });
    });
  }
  
  function resetMemoryCellColors(table: Tabulator) {
    table.getRows().forEach(row => {
      row.getCells().forEach(cell => {
        cell.getElement().style.backgroundColor = '';
      });
    });
  }
  