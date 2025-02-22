
import { Tabulator } from "tabulator-tables";
import { registersNames } from "../../registersTable";

export function setUpConfig(memoryTable: Tabulator, registersTable: Tabulator): void {
    changeMemorySize(memoryTable);
    importRegisters(registersTable);
    importMemory(memoryTable);
}


function changeMemorySize(memoryTable: Tabulator): void {
    const memorySizeInput = document.getElementById("memorySizeInput") as HTMLInputElement | null;
    if (!memorySizeInput) {return;};
  
    const updateMemoryBaseRows = () => {
    
      let value = parseInt(memorySizeInput.value, 10);
      if (isNaN(value) || value < 12) {
        value = 12;
        memorySizeInput.value = "12";
      }
      const rounded = Math.round(value / 4) * 4;
      memorySizeInput.value = rounded.toString();
      
      const totalBaseRows = rounded / 4; 
  
      const allData = memoryTable.getData();
    
      let heapIndex = allData.findIndex(row => row.info && row.info.includes("Heap"));
  
      const instructionsRowsData = heapIndex !== -1 ? allData.slice(heapIndex + 1) : allData;
  
      const allRows = memoryTable.getRows();
      const instructionsBackground: string[] = [];
      if (heapIndex !== -1) {
    
        const instructionsRows = allRows.slice(heapIndex + 1);
        instructionsRows.forEach(row => {
          instructionsBackground.push(row.getElement().style.backgroundColor);
        });
      }
  
      const newBaseRowsData = [];
      const zeros8 = "00000000";
      for (let i = 0; i < totalBaseRows; i++) {
        newBaseRowsData.push({
          address: "", 
          value0: zeros8,
          value1: zeros8,
          value2: zeros8,
          value3: zeros8,
          info: "",
          hex: "00-00-00-00"
        });
      }
      if (newBaseRowsData.length > 0) {
        newBaseRowsData[0].info = `<span class="info-column-mem-table">SP</span>`;
        newBaseRowsData[newBaseRowsData.length - 1].info = `<span class="info-column-mem-table">Heap</span>`;
      }
  
     
      const newTableData = newBaseRowsData.concat(instructionsRowsData);
      memoryTable.setData(newTableData).then(() => {
        const updatedRows = memoryTable.getRows();
        const totalRows = updatedRows.length;
        for (let i = 0; i < totalRows; i++) {
          const newAddress = ((totalRows - 1 - i) * 4).toString(16);
          updatedRows[i].update({ address: newAddress });
        }
        
        for (let i = totalBaseRows; i < totalRows; i++) {
          const row = updatedRows[i];
   
          const bg = instructionsBackground[i - totalBaseRows] || "#FFF6E5";
          row.getElement().style.backgroundColor = bg;
        }
        
      });
    };
  
    memorySizeInput.addEventListener("blur", updateMemoryBaseRows);
    memorySizeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        updateMemoryBaseRows();
      }
    });
    memorySizeInput.addEventListener("change", updateMemoryBaseRows);
  }


function importRegisters(registersTable: Tabulator) {
    document
      .getElementById("importRegisterBtn")
      ?.addEventListener("click", () => {
        document.getElementById("fileInputImportRegister")?.click(); // Open file dialog
      });
  
    document
      .getElementById("fileInputImportRegister")
      ?.addEventListener("change", (event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
  
        if (!file) {
          return;
        }
  
        const reader = new FileReader();
  
        reader.onload = function (e) {
          if (!e.target?.result) {
            return;
          }
  
          const lines = (e.target.result as string)
            .split("\n")
            .map((line) => line.trim()) // delete leading and trailing spaces
            .filter((line) => line !== ""); // delete empty lines
  
          if (lines.length !== 32) {
            console.error("Invalid number of lines");
            return;
          }
  
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].length !== 32) {
              console.error(`Invalid length in line ${i}`);
              return;
            }
          }
          const newData = registersNames.map((reg, index) => ({
            name: reg,
            rawName: reg.split(" ")[0],
            value: index === 0 ? "00000000000000000000000000000000" : lines[index],
            viewType: 2,
            watched: false, // Todos los registros entran como "watched: true"
            modified: 0,
            id: index,
          }));
  
          registersTable.setData(newData);
        };
        reader.readAsText(file);
      });
  }

  
function importMemory(memoryTable: Tabulator) {
    document.getElementById('importMemoryBtn')?.addEventListener('click', () => {
      document.getElementById('fileInputImportMemory')?.click(); // Abrir el diálogo de archivo
    });
  
    document
      .getElementById('fileInputImportMemory')
      ?.addEventListener('change', (event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
  
        if (!file) {
          return;
        }
  
        const reader = new FileReader();
  
        reader.onload = function (e) {
          if (!e.target?.result) {
            return;
          }
  
          const lines = (e.target.result as string)
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '');
  
          const newData: any[] = [];
  
          for (const line of lines) {
            const parts = line.split(':');
            if (parts.length !== 2) {
              console.error(`Formato inválido en la línea: ${line}`);
              return;
            }
  
            const address = parseInt(parts[0].trim(), 16); // Ahora se convierte desde hexadecimal
            const binaryValue = parts[1].trim();
  
            if (binaryValue.length !== 32 || !/^[01]+$/.test(binaryValue)) {
              console.error(`Valor inválido en la línea: ${line}`);
              return;
            }
  
            const value0 = binaryValue.slice(24, 32);
            const value1 = binaryValue.slice(16, 24);
            const value2 = binaryValue.slice(8, 16);
            const value3 = binaryValue.slice(0, 8);
  
            const hex0 = parseInt(value0, 2).toString(16).padStart(2, '0');
            const hex1 = parseInt(value1, 2).toString(16).padStart(2, '0');
            const hex2 = parseInt(value2, 2).toString(16).padStart(2, '0');
            const hex3 = parseInt(value3, 2).toString(16).padStart(2, '0');
  
            newData.push({
              address: address.toString(16).toLowerCase(), // Mantiene la dirección en HEXA
              value0,
              value1,
              value2,
              value3,
              hex: `${hex3}-${hex2}-${hex1}-${hex0}`.toUpperCase() // Binario convertido a hex
            });
          }
  
          memoryTable.updateOrAddData(newData);
        };
        reader.readAsText(file);
      });
  }