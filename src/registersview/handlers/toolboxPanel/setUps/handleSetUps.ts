export function handleSetUps(): void {
    const sections: string[] = [
      'openSearch',
      'openSettings',
      'openConvert1',
      'openHelp'
    ];
    const buttons: string[] = [
      'openSearchButton',
      'openSettingsButton',
      'openConvertButton',
      'openHelpButton'
    ];
  
    function showOnly(targetId: string, buttonId: string): void {
      // Ocultar todas las secciones
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.className =
            id === targetId
              ? 'flex flex-1 flex-col max-h-dvh min-h-dvh overflow-y-scroll'
              : 'hidden';
        }
      });
  
      buttons.forEach((btnId) => {
        document.getElementById(btnId)?.classList.remove('bg-active');
      });
  
      document.getElementById(buttonId)?.classList.add('bg-active');
    }
  
    // Asignar eventos a los botones
    document
      .getElementById('openSearchButton')
      ?.addEventListener('click', () =>
        showOnly('openSearch', 'openSearchButton')
      );
    document
      .getElementById('openSettingsButton')
      ?.addEventListener('click', () =>
        showOnly('openSettings', 'openSettingsButton')
      );
    document
      .getElementById('openConvertButton')
      ?.addEventListener('click', () =>
        showOnly('openConvert1', 'openConvertButton')
      );
    document
      .getElementById('openHelpButton')
      ?.addEventListener('click', () => showOnly('openHelp', 'openHelpButton'));
  }



