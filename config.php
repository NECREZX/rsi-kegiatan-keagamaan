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

// Database / Supabase config
// Environment variables are prioritized (useful for Vercel)
define('DB_HOST', getenv('DB_HOST') ?: 'aws-0-ap-southeast-1.pooler.supabase.com');
define('DB_PORT', getenv('DB_PORT') ?: '6543');
define('DB_NAME', getenv('DB_NAME') ?: 'postgres');
define('DB_USER', getenv('DB_USER') ?: 'postgres.xxx');
define('DB_PASS', getenv('DB_PASS') ?: 'your_password');

function getDB() {
    $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        return $pdo;
    } catch (PDOException $e) {
        die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]));
    }
}

// Fallback paths for initial migration
define('DATA_DIR', __DIR__ . '/data/');
define('JSON_DB', DATA_DIR . 'database.json');
define('XLSX_DB', DATA_DIR . 'database.xlsx');

// Session config
ini_set('session.gc_maxlifetime', 3600 * 8);
session_set_cookie_params(3600 * 8);
?>
