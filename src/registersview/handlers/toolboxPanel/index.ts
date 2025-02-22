import { Tabulator } from 'tabulator-tables';

import { handleSetUps } from './setUps/handleSetUps';
import { setUpConvert } from './setUps/setUpConvert';
import { setUpHelp } from './setUps/setUpHelp';
import { setUpSearchInTable } from './setUps/SetUpSearchInTable';
import { setUpConfig } from './setUps/setUpConfig';

export function setupToolboxPanel(registersTable: Tabulator, memoryTable: Tabulator): void {
    handleSetUps();
    setUpConvert();
    setUpHelp();
    setUpSearchInTable(registersTable, memoryTable);
    setUpConfig(memoryTable, registersTable);
}




