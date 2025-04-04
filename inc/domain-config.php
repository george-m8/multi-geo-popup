<?php
return [
    // Each key is the domain or hostname. Use exactly what you'd get from window.location.host (or location.hostname).
    'mysurrogacyjourney.com' => [
        'expected_country' => 'GB',
        'popup_id'        => 1234, // e.g. PUM popup ID
        'alt_domains'     => [
            'MX' => 'https://www.mysurrogacyjourney.mx',
            'US' => 'https://us.mysurrogacyjourney.com',
        ],
    ],
    'us.mysurrogacyjourney.com' => [
        'expected_country' => 'US',
        'popup_id'        => 7890,
        'alt_domains'     => [
            'GB' => 'https://www.mysurrogacyjourney.com',
            'MX' => 'https://www.mysurrogacyjourney.mx',
        ],
    ],
    'mysite.com.mx' => [
        'expected_country' => 'MX',
        'popup_id'        => 4567,
        'alt_domains'     => [
            'GB' => 'https://www.mysurrogacyjourney.com',
            'US' => 'https://us.mysurrogacyjourney.com',
        ],
    ],
    'localhost:8888' => [
        'expected_country' => 'US',
        'popup_id'        => 8195,
        'alt_domains'     => [
            'GB' => 'https://www.mysurrogacyjourney.com',
            'MX' => 'https://www.mysurrogacyjourney.mx',
            'US' => 'https://us.mysurrogacyjourney.com',
            'XX' => 'https://testsite.com', // Fallback for local testing
        ],
    ],
];