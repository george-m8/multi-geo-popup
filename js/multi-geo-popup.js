document.addEventListener('DOMContentLoaded', function () {

    // Debug function
    function dbgLog() {
        if (mgpAjax && mgpAjax.debugMode) {
            console.log.apply(console, ['[MGP Debug]', ...arguments]);
        }
    }

    // Check if user already chose to stay (cookie)
    function getCookie(name) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [key, value] = cookie.split('=');
            if (key === name) return value;
        }
        return null;
    }

    if (getCookie('mgp_ignore_redirect') === 'true') {
        dbgLog('User chose to stay previously, skipping geolocation check.');
        return;
    }

    if (getCookie('mgp_close_popup') === 'true') {
        dbgLog('User closed popup in last 30 minutes, skipping geolocation check.');
        return;
    }

    const currentHost  = window.location.host;
    const domainConfig = mgpAjax.domainConfig || {};
    let config = domainConfig[currentHost];
    if (!config) {
        dbgLog('No config found for domain:', currentHost);
        return;
    }

    const popupId  = config.popup_id;

    if (getCookie(`pum-${popupId}`) === 'true') {
        dbgLog('Popup will not open due to Popup Maker cookie, skipping geolocation check.');
        return;
    }

    // Ajax function to get location
    function fetchLocationAndDecide() {
        dbgLog('Fetching user location via mgp_user_location_lookup...');
        jQuery.ajax({
            url: mgpAjax.ajaxUrl,
            method: 'POST',
            dataType: 'json',
            data: {
                action: 'mgp_user_location_lookup'
            },
            success: function (response) {
                dbgLog('Ajax response:', response);
                if (response.success && response.data) {
                    const userCountry = response.data.country_code || 'XX';
                    const userIp      = response.data.ip || '0.0.0.0';
                    dbgLog('User country:', userCountry, 'User IP:', userIp);

                    handleLocation(userCountry);
                } else {
                    console.error('[MGP] GeoIP lookup error:', response);
                }
            },
            error: function (error) {
                console.error('[MGP] Ajax request failed:', error);
            }
        });
    }

// Our main logic to compare domain config & user country
function handleLocation(userCountry) {
    // Grab the matching config object or default to an empty object
    const configForUser = mgpAjax.countryConfig[userCountry] || {};

    // Derive the name & image (fallback to userCountry or generic_flag)
    const userCountryName = configForUser.country_name || userCountry;
    const userCountryImg  = configForUser.image || '/wp-content/plugins/multi-geo-popup/img/128px/generic_flag.png';
    

    const domainConfig = mgpAjax.domainConfig || {};
    const currentHost  = window.location.host; // includes domain + port if any

    dbgLog('Actual window.location.host:', currentHost);
    dbgLog('DomainConfig from PHP:', domainConfig);

    let config = domainConfig[currentHost];
    if (!config) {
        dbgLog('No config found for domain:', currentHost);
        return;
    }

    const expected = config.expected_country;
    const popupId  = config.popup_id;
    dbgLog('Expected country:', expected, 'Popup ID:', popupId);

    // If user’s country matches expected, do nothing
    if (userCountry === expected) {
        dbgLog('User is already in the correct country:', userCountry);
        return;
    }

    // If user’s country differs, see if there’s an alternate domain
    if (config.alt_domains && config.alt_domains[userCountry]) {
        const altDomain = config.alt_domains[userCountry];
        dbgLog(`User is from ${userCountryName} (${userCountry}), but domain is set for ${expected}. Suggesting alt domain: ${altDomain}`);

        // Show the popup with the link. 
        if (typeof PUM !== 'undefined') {
            dbgLog('Opening popup ID:', popupId);
            PUM.open(popupId);

            // Example: If you have an element in the popup, e.g. <a class="js-alt-link">, set its href:
            jQuery(document).ready(function() {
                jQuery(`#pum-${popupId} .mgp-go-button`).attr('href', altDomain);
                // Set further variables
                jQuery(`#pum-${popupId} .mgp-user-country`).text(userCountryName);
                jQuery(`#pum-${popupId} .mgp-user-country-img`).attr('src', userCountryImg);

                // When user clicks the "stay" button, set the cookie for 7 days
                jQuery(`#pum-${popupId} .mgp-stay-button`).on('click', function() {
                    var date = new Date();
                    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
                    var expires = "expires=" + date.toUTCString();
                    document.cookie = "mgp_ignore_redirect=true; path=/; " + expires;
                });

                // When user clicks the "close" button, set a cookie for 30 minutes
                jQuery(`#pum-${popupId} .pum-close`).on('click', function() {
                    var date = new Date();
                    date.setTime(date.getTime() + (30 * 60 * 1000)); // 30 minutes
                    var expires = "expires=" + date.toUTCString();
                    document.cookie = "mgp_close_popup=true; path=/; " + expires;
                });
            });

            

        } else {
            console.warn('[MGP] PUM is not defined. Are you sure Popup Maker is active?');
        }
    } else {
        dbgLog(`No alternate domain configured for user country: ${userCountryName} (${userCountry})`);
        // Possibly open a “generic mismatch” popup or do nothing
    }
}

    // Delay location check to avoid immediate flicker or to ensure other scripts load
    setTimeout(fetchLocationAndDecide, 3000);

});