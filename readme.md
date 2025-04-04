# Multi Geo Popup

A WordPress plugin that detects the user’s country (via Cloudflare or IP-based geolocation as fallback) and displays a custom popup if the domain doesn’t match the user’s location. Useful for redirect suggestions or location-based content.

---

## Description

Multi Geo Popup uses a config file (`domain-config.php`) to define which domain corresponds to which country, which popup to open, and potential alternative domains for users from other countries. When a user visits your site, the plugin checks Cloudflare headers for their country. If unavailable, it falls back to `ipapi.co` to retrieve geolocation data. It then compares the detected country with the “expected” country for that domain and optionally triggers a redirect popup.

### Key Features
- **Config-Driven:** Define your domains, expected country codes, alternative domains, and popup IDs in `domain-config.php`.
- **Popup Support:** Integrates with Popup Maker (PUM) to open a specific popup if the user’s domain/country mismatch.
- **Cloudflare / IPAPI:** Leverages Cloudflare’s `CF-IPCountry` for fast geolocation, falls back to IP API if not available.
- **Debug Logging:** Set `MGP_DEBUG_MODE` to `true` to see debug messages in the browser console or logs in the debug file.
- **Ajax-Based:** Minimizes caching issues by fetching user location dynamically.

---

## Installation

1. Upload the plugin to the `/wp-content/plugins/` directory, or install directly from the WordPress plugins screen (if applicable).
2. Activate the plugin through the “Plugins” menu in WordPress.
3. In `domain-config.php`, define your site domains, expected countries, alternate domains, and popup IDs.
4. If using Cloudflare, enable “IP Geolocation” in your Cloudflare Dashboard so the `CF-IPCountry` header is sent to your site.
5. Clear any caches (if you have a caching plugin) and test by visiting your site in an incognito browser.

---

## Usage

### 1. Configure Domains
- In `inc/domain-config.php`, create an entry for each domain you manage, specifying the `expected_country`, `popup_id`, and any relevant `alt_domains`.

### 2. Configure Countries
- In `inc/country-config`, create any entries for countries you would like to include. A small list is provided here already. Add any country codes needed, their country names and any images for country flags.

### 2. Add Popups
- Install and activate Popup Maker (optional) if you want to display popups based on location mismatches.
- Use the `popup_id` from your domain config in Popup Maker’s settings.

### 3. Check Debug Logs
- Set `define('MGP_DEBUG_MODE', true);` in `multi-geo-popup.php` to log debug messages in the browser console.
- For PHP-level logs (fallback usage, errors, etc.), enable `WP_DEBUG_LOG` in `wp-config.php`.

### 4. Shortcodes
- The plugin includes basic shortcodes for displaying user location or alternative links. For more advanced usage, you can create or extend shortcodes to dynamically populate popup content based on the user’s country.

---

## To-Do List

- **Test on Cloudflare and External IP:**  
  Verify that `CF-IPCountry` is set correctly on a staging/production environment and confirm the fallback to `ipapi` is working on real IPs.

- **Debugging:**  
  Currently enabled. Remember to set `MGP_DEBUG_MODE` to `false` for production once you’re confident everything works.

- **Cache Considerations:**  
  Ensure caching plugin (if any) won’t cause stale geolocation data. The plugin uses Ajax to reduce this risk, but double-check cache settings.

- **Build Out Shortcodes:**  
  Check Styling
  Add shortcode for country selector using config for current site and list of other sites.
