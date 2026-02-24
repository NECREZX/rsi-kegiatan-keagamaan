<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$dataFile = __DIR__ . '/../data/database.json';
$xlsxFile = __DIR__ . '/../data/database.xlsx';

function convertXlsxToJson($xlsxFile, $jsonFile) {
    $pythonCmd = PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3';
    $cmd = $pythonCmd . " " . escapeshellarg(__DIR__ . '/../includes/convert.py') . " " . escapeshellarg($xlsxFile) . " " . escapeshellarg($jsonFile) . " 2>&1";
    $output = shell_exec($cmd);
    return file_exists($jsonFile);
}

function loadData($dataFile, $xlsxFile) {
    if (!file_exists($dataFile) || (file_exists($xlsxFile) && filemtime($xlsxFile) > filemtime($dataFile))) {
        convertXlsxToJson($xlsxFile, $dataFile);
    }
    if (file_exists($dataFile)) {
        return json_decode(file_get_contents($dataFile), true);
    }
    return ['pegawai' => []];
}

$action = $_GET['action'] ?? 'get_all';

switch ($action) {
    case 'get_all':
        $data = loadData($dataFile, $xlsxFile);
        echo json_encode(['success' => true, 'data' => $data]);
        break;

    case 'get_filters':
        $data = loadData($dataFile, $xlsxFile);
        $pegawai = $data['pegawai'] ?? [];
        $filters = [
            'tempat_tugas' => array_values(array_unique(array_filter(array_column($pegawai, 'tempat_tugas')))),
            'struktur_lini' => array_values(array_unique(array_filter(array_column($pegawai, 'struktur_lini')))),
            'kelompok_nakes' => array_values(array_unique(array_filter(array_column($pegawai, 'kelompok_nakes')))),
            'status_pegawai' => array_values(array_unique(array_filter(array_column($pegawai, 'status_pegawai'), function($s) {
                return $s && strpos($s, 'Berhenti - ') !== 0;
            }))),
            // Updated to be 2026-2028 range as requested
            'tahun' => ['2026', '2027', '2028'],
        ];
        sort($filters['tempat_tugas']);
        sort($filters['struktur_lini']);
        sort($filters['kelompok_nakes']);
        sort($filters['status_pegawai']);
        echo json_encode(['success' => true, 'data' => $filters]);
        break;

    case 'get_pegawai':
        $id = $_GET['id'] ?? null;
        if (!$id) { echo json_encode(['success' => false, 'message' => 'ID tidak ditemukan']); break; }
        $data = loadData($dataFile, $xlsxFile);
        $found = null;
        foreach ($data['pegawai'] as $p) {
            if ($p['id'] == $id) { $found = $p; break; }
        }
        if ($found) {
            echo json_encode(['success' => true, 'data' => $found]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Pegawai tidak ditemukan']);
        }
        break;

    case 'save_aktivitas':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);
        $data = loadData($dataFile, $xlsxFile);

        $id = $input['id'] ?? null;
        $tahun = $input['tahun'] ?? null;
        $bulan = $input['bulan'] ?? null;
        $aktivitas = $input['aktivitas'] ?? [];

        if (!$id || !$tahun || !$bulan) {
            echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
            break;
        }

        $updated = false;
        foreach ($data['pegawai'] as &$p) {
            if ($p['id'] == $id) {
                if (!isset($p['data'][$tahun])) $p['data'][$tahun] = [];
                if (!isset($p['data'][$tahun][$bulan])) $p['data'][$tahun][$bulan] = [];
                $p['data'][$tahun][$bulan]['mengaji'] = intval($aktivitas['mengaji'] ?? 0);
                $p['data'][$tahun][$bulan]['kajian_fiqih'] = intval($aktivitas['kajian_fiqih'] ?? 0);
                $p['data'][$tahun][$bulan]['phbi'] = intval($aktivitas['phbi'] ?? 0);
                $updated = true;
                break;
            }
        }

        if ($updated) {
            file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            // Execute background update instead of blocking
            $pythonCmd = PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3';
            $cmd = $pythonCmd . " " . escapeshellarg(__DIR__ . '/../includes/update_xlsx.py') . " " . escapeshellarg($xlsxFile) . " " . escapeshellarg($dataFile);
            if (PHP_OS_FAMILY === 'Windows') {
                pclose(popen("start /B " . $cmd, "r"));
            } else {
                exec($cmd . " > /dev/null 2>&1 &");
            }
            echo json_encode(['success' => true, 'message' => 'Data berhasil disimpan']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Pegawai tidak ditemukan']);
        }
        break;

    case 'add_pegawai':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);
        $data = loadData($dataFile, $xlsxFile);

        $newId = count($data['pegawai']) > 0 ? max(array_column($data['pegawai'], 'id')) + 1 : 1;
        $newPegawai = [
            'id' => $newId,
            'no' => $newId,
            'nama' => $input['nama'] ?? '',
            'nik' => $input['nik'] ?? '',
            'status_pegawai' => $input['status_pegawai'] ?? '',
            'tanggal_berhenti' => $input['tanggal_berhenti'] ?? null, // New field
            'jk' => $input['jk'] ?? '',
            'kelompok_nakes' => $input['kelompok_nakes'] ?? '',
            'nama_jabatan' => $input['nama_jabatan'] ?? '',
            'struktur_lini' => $input['struktur_lini'] ?? '',
            'tempat_tugas' => $input['tempat_tugas'] ?? '',
            'data' => [],
        ];

        $data['pegawai'][] = $newPegawai;
        file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        // Execute background update instead of blocking
        $pythonCmd = PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3';
        $cmd = $pythonCmd . " " . escapeshellarg(__DIR__ . '/../includes/update_xlsx.py') . " " . escapeshellarg($xlsxFile) . " " . escapeshellarg($dataFile);
        if (PHP_OS_FAMILY === 'Windows') {
            pclose(popen("start /B " . $cmd, "r"));
        } else {
            exec($cmd . " > /dev/null 2>&1 &");
        }

        echo json_encode(['success' => true, 'data' => $newPegawai, 'message' => 'Pegawai berhasil ditambahkan']);
        break;

    case 'edit_pegawai':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);
        $data = loadData($dataFile, $xlsxFile);

        $id = $input['id'] ?? null;
        if (!$id) { echo json_encode(['success' => false, 'message' => 'ID pegawai diperlukan']); break; }

        $found = false;
        foreach ($data['pegawai'] as &$p) {
            if ($p['id'] == $id) {
                $p['nama'] = $input['nama'] ?? $p['nama'];
                $p['nik'] = $input['nik'] ?? $p['nik'];
                $p['status_pegawai'] = $input['status_pegawai'] ?? $p['status_pegawai'];
                // Only update if provided, allow null to clear? Usually sent as string.
                if (array_key_exists('tanggal_berhenti', $input)) {
                    $p['tanggal_berhenti'] = $input['tanggal_berhenti'];
                }
                $p['jk'] = $input['jk'] ?? $p['jk'];
                $p['kelompok_nakes'] = $input['kelompok_nakes'] ?? $p['kelompok_nakes'];
                $p['nama_jabatan'] = $input['nama_jabatan'] ?? $p['nama_jabatan'];
                $p['struktur_lini'] = $input['struktur_lini'] ?? $p['struktur_lini'];
                $p['tempat_tugas'] = $input['tempat_tugas'] ?? $p['tempat_tugas'];
                $found = true;
                break;
            }
        }
        unset($p);

        if (!$found) { echo json_encode(['success' => false, 'message' => 'Pegawai tidak ditemukan']); break; }

        file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        // Execute background update instead of blocking
        $pythonCmd = PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3';
        $cmd = $pythonCmd . " " . escapeshellarg(__DIR__ . '/../includes/update_xlsx.py') . " " . escapeshellarg($xlsxFile) . " " . escapeshellarg($dataFile);
        if (PHP_OS_FAMILY === 'Windows') {
            pclose(popen("start /B " . $cmd, "r"));
        } else {
            exec($cmd . " > /dev/null 2>&1 &");
        }

        echo json_encode(['success' => true, 'message' => 'Data pegawai berhasil diperbarui']);
        break;

    case 'delete_pegawai':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);
        $data = loadData($dataFile, $xlsxFile);

        $id = $input['id'] ?? null;
        if (!$id) { echo json_encode(['success' => false, 'message' => 'ID pegawai diperlukan']); break; }

        $initialCount = count($data['pegawai']);
        $data['pegawai'] = array_values(array_filter($data['pegawai'], function($p) use ($id) {
            return $p['id'] != $id;
        }));

        if (count($data['pegawai']) === $initialCount) {
            echo json_encode(['success' => false, 'message' => 'Pegawai tidak ditemukan']);
            break;
        }

        file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        // Execute background update instead of blocking
        $pythonCmd = PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3';
        $cmd = $pythonCmd . " " . escapeshellarg(__DIR__ . '/../includes/update_xlsx.py') . " " . escapeshellarg($xlsxFile) . " " . escapeshellarg($dataFile);
        if (PHP_OS_FAMILY === 'Windows') {
            pclose(popen("start /B " . $cmd, "r"));
        } else {
            exec($cmd . " > /dev/null 2>&1 &");
        }

        echo json_encode(['success' => true, 'message' => 'Pegawai berhasil dihapus']);
        break;

    case 'delete_aktivitas':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);
        $data = loadData($dataFile, $xlsxFile);

        $id = $input['id'] ?? null;
        $tahun = $input['tahun'] ?? null;
        $bulan = $input['bulan'] ?? null;

        if (!$id || !$tahun || !$bulan) {
            echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
            break;
        }

        $deleted = false;
        foreach ($data['pegawai'] as &$p) {
            if ($p['id'] == $id) {
                if (isset($p['data'][$tahun][$bulan])) {
                    unset($p['data'][$tahun][$bulan]);
                    // Clean up empty year
                    if (empty($p['data'][$tahun])) {
                        unset($p['data'][$tahun]);
                    }
                    $deleted = true;
                }
                break;
            }
        }

        if ($deleted) {
            file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode(['success' => true, 'message' => 'Data aktivitas berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Data tidak ditemukan']);
        }
        break;

    case 'get_aktivitas_list':
        $data = loadData($dataFile, $xlsxFile);
        $tahun = $_GET['tahun'] ?? null;
        $bulan = $_GET['bulan'] ?? null;
        $search = $_GET['search'] ?? '';
        $tempat = $_GET['tempat_tugas'] ?? '';

        $result = [];
        foreach ($data['pegawai'] as $p) {
            // Filter by tempat tugas
            if ($tempat && $p['tempat_tugas'] !== $tempat) continue;
            // Exclude Resigned
            if (strpos($p['status_pegawai'] ?? '', 'Berhenti') === 0) continue;
            // Filter by search
            if ($search && stripos($p['nama'], $search) === false && stripos((string)$p['nik'], $search) === false) continue;

            if ($tahun && $bulan) {
                // Specific month
                $d = $p['data'][$tahun][$bulan] ?? null;
                if ($d) {
                    $mengaji = intval($d['mengaji'] ?? 0);
                    $fiqih = intval($d['kajian_fiqih'] ?? 0);
                    $phbi = intval($d['phbi'] ?? 0);
                    if ($mengaji + $fiqih + $phbi > 0) {
                        $result[] = [
                            'id' => $p['id'],
                            'nama' => $p['nama'],
                            'nik' => $p['nik'],
                            'tempat_tugas' => $p['tempat_tugas'],
                            'tahun' => $tahun,
                            'bulan' => $bulan,
                            'mengaji' => $mengaji,
                            'kajian_fiqih' => $fiqih,
                            'phbi' => $phbi,
                            'total' => $mengaji + $fiqih + $phbi,
                        ];
                    }
                }
            } else if ($tahun) {
                // All months in a year
                $yearData = $p['data'][$tahun] ?? [];
                foreach ($yearData as $bln => $d) {
                    $mengaji = intval($d['mengaji'] ?? 0);
                    $fiqih = intval($d['kajian_fiqih'] ?? 0);
                    $phbi = intval($d['phbi'] ?? 0);
                    if ($mengaji + $fiqih + $phbi > 0) {
                        $result[] = [
                            'id' => $p['id'],
                            'nama' => $p['nama'],
                            'nik' => $p['nik'],
                            'tempat_tugas' => $p['tempat_tugas'],
                            'tahun' => $tahun,
                            'bulan' => $bln,
                            'mengaji' => $mengaji,
                            'kajian_fiqih' => $fiqih,
                            'phbi' => $phbi,
                            'total' => $mengaji + $fiqih + $phbi,
                        ];
                    }
                }
            }
        }

        // Sort by nama
        usort($result, function($a, $b) { return strcmp($a['nama'], $b['nama']); });
        echo json_encode(['success' => true, 'data' => $result, 'total' => count($result)]);
        break;

    case 'reload':
        if (file_exists($dataFile)) unlink($dataFile);
        convertXlsxToJson($xlsxFile, $dataFile);
        echo json_encode(['success' => true, 'message' => 'Data berhasil di-reload dari Excel']);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Action tidak dikenal']);
}
?>
