<?php
/**
 * Plugin Name: Multi Geo Popup
 * Description: Shows location-based popups/links depending on user’s IP or Cloudflare header, with fallback to IPAPI.
 * Version: 1.0
 * Author: George Mullis
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// DEFINE DEBUG MODE (Set this to true or false as needed)
define('MGP_DEBUG_MODE', true);

add_filter( 'kses_allowed_protocols', 'my_allowed_protocols' );
/**
 *  Description
 *
 *  @since 1.0.0
 *
 *  @param $protocols
 *
 *  @return array
 */
function my_allowed_protocols ( $protocols ) {
	$protocols[] = "javascript";
	return $protocols;
}

// REQUIRE CONFIG
$mgp_domain_config = require_once plugin_dir_path(__FILE__) . 'inc/domain-config.php';
$mgp_country_config = require_once plugin_dir_path(__FILE__) . 'inc/country-config.php';

// ENQUEUE SCRIPTS & LOCALIZE DATA
add_action('wp_enqueue_scripts', 'mgp_enqueue_scripts');
function mgp_enqueue_scripts() {
    global $mgp_domain_config, $mgp_country_config;

    // Build full plugin base URL (e.g. /wp-content/plugins/multi-geo-popup/)
    $pluginUrl = plugin_dir_url(__FILE__);

    // Loop over $mgp_country_config so you can prepend the absolute plugin URL
    foreach ($mgp_country_config as $code => $info) {
        if (!empty($info['image'])) {
            // remove leading slash & prepend plugin URL
            $relativePath = ltrim($info['image'], '/');
            $mgp_country_config[$code]['image'] = $pluginUrl . $relativePath;
        }
    }

    wp_enqueue_style(
        'multi-geo-popup-styles',
        plugin_dir_url(__FILE__) . 'css/styles.css',
        [],
        '1.0'
    );

    // Enqueue JS
    wp_enqueue_script(
        'multi-geo-popup',
        plugin_dir_url(__FILE__) . 'js/multi-geo-popup.js',
        array('jquery'),
        '1.0',
        false
    );

    // Localize data for JS
    wp_localize_script('multi-geo-popup', 'mgpAjax', [
        'ajaxUrl'       => admin_url('admin-ajax.php'),
        'domainConfig'  => $mgp_domain_config,
        'countryConfig' => $mgp_country_config,
        'debugMode'     => MGP_DEBUG_MODE,
    ]);
}

// REGISTER AJAX HANDLERS
// (nopriv_ for non-logged-in users, normal for logged-in)
add_action('wp_ajax_nopriv_mgp_user_location_lookup', 'mgp_user_location_lookup');
add_action('wp_ajax_mgp_user_location_lookup', 'mgp_user_location_lookup');
function mgp_user_location_lookup() {
    // Get Cloudflare country & IP
    $country_code = mgp_get_cf_country(); // returns 'XX' if empty
    $ip           = mgp_get_user_ip();

    // If Cloudflare header is 'XX', use ipapi
    if ($country_code === 'XX') {
        // Log that we're falling back
        error_log('[MGP Debug] Falling back to ipapi for IP: ' . $ip);

        $api_url  = "https://ipapi.co/{$ip}/json/";
        $response = wp_remote_get($api_url);

        if (is_wp_error($response)) {
            // Log the error
            error_log('[MGP Debug] ipapi request failed: ' . $response->get_error_message());
        } else {
            $geo_data = json_decode(wp_remote_retrieve_body($response), true);

            // Log the raw geo_data for debugging
            error_log('[MGP Debug] ipapi response: ' . print_r($geo_data, true));

            // Set the final country code (still 'XX' if not found)
            $country_code = $geo_data['country'] ?? 'XX';
        }
    }

    // Respond with final country_code and IP
    $location_info = [
        'country_code' => $country_code,
        'ip'           => $ip,
    ];

    wp_send_json_success($location_info);
}

// HELPER FUNCTIONS
/**
 * Get user IP from Cloudflare or fallback to REMOTE_ADDR
 */
function mgp_get_user_ip() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return sanitize_text_field($_SERVER['HTTP_CF_CONNECTING_IP']);
    }
    return isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field($_SERVER['REMOTE_ADDR']) : '127.0.0.1';
}

/**
 * Get Cloudflare country header if available
 */
function mgp_get_cf_country() {
    if (!empty($_SERVER['HTTP_CF_IPCOUNTRY'])) {
        return sanitize_text_field($_SERVER['HTTP_CF_IPCOUNTRY']);
    }
    return 'XX';
}

// SHORTCODES
add_shortcode('mgp_popup_content', function($atts) {
    ob_start();
    ?>
    <div class="mgp-popup-wrapper">
        <div class="mgp-popup-content">
            <p>It looks like you're in <span class="mgp-user-country">LOADING COUNTRY</span>.</p>
            <p>Would you like to go to our <span class="mgp-user-country">LOADING COUNTRY</span> site instead?</p>
            <div class="mgp-buttons">
                <a class="mgp-button mgp-stay-button popmake-close pum-close" href="#">Stay Here</a>
                <a class="mgp-button mgp-go-button" href="#"><img src="/img/128px/generic_flag.png" class="mgp-user-country-img">Go to <span class="mgp-user-country"> local site</span></a>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
});