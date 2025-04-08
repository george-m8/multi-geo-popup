document.addEventListener('DOMContentLoaded', function () {

    function dbgLog() {
        if (typeof mgpAjax !== 'undefined' && mgpAjax.debugMode) {
            console.log.apply(console, ['[MGP Debug]', ...arguments]);
        }
    }

    const toggleButtons = document.querySelectorAll('.mgp-current-country-toggle');
    const dropdowns = document.querySelectorAll('.mgp-country-dropdown');

    dbgLog('DOM fully loaded. Found toggles and dropdowns:', toggleButtons.length, dropdowns.length);

    toggleButtons.forEach((toggleButton, index) => {
        const dropdown = dropdowns[index]; // assumes matching order in DOM

        if (!dropdown) {
            dbgLog('No matching dropdown for toggle at index:', index);
            return;
        }

        toggleButton.addEventListener('click', function (e) {
            e.stopPropagation();
            const newDisplayState = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
            dbgLog(`Toggle #${index} clicked. Changing display to:`, newDisplayState);
            dropdown.style.display = newDisplayState;
        });

        // Add outside click handler *for this specific dropdown*
        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target) && !toggleButton.contains(e.target)) {
                dbgLog(`Outside click for toggle #${index}. Closing dropdown.`);
                dropdown.style.display = 'none';
            } else {
                dbgLog(`Click inside toggle #${index} or its dropdown. Not closing.`);
            }
        });
    });
});