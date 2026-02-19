<?php
// System configuration
define('APP_NAME', 'Rekap Kegiatan Keagamaan');
define('APP_SUBTITLE', 'RSI Siti Khadijah Palembang');
define('APP_VERSION', '1.0.0');

// User credentials
define('USERS', [
    'kerohanian' => [
        'password' => 'kerohanianrsi',
        'role' => 'kerohanian',
        'name' => 'Divisi Kerohanian',
    ],
    'sdm' => [
        'password' => 'sdmrsi',
        'role' => 'sdm',
        'name' => 'Divisi SDM',
    ],
]);

// Data paths
define('DATA_DIR', __DIR__ . '/data/');
define('JSON_DB', DATA_DIR . 'database.json');
define('XLSX_DB', DATA_DIR . 'database.xlsx');

// Session config
ini_set('session.gc_maxlifetime', 3600 * 8);
session_set_cookie_params(3600 * 8);
?>
