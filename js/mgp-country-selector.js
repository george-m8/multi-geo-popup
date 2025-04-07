document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.mgp-current-country-toggle');
    const dropdown = document.querySelector('.mgp-country-dropdown');

    if (toggleButton && dropdown) {
        toggleButton.addEventListener('click', function () {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        // Optional: close dropdown on outside click
        /*document.addEventListener('click', function (e) {
            if (!toggleButton.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });*/
    }
});