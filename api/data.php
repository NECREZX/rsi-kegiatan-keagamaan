<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once __DIR__ . '/../config.php';
$pdo = getDB();

function loadAllData($pdo) {
    $stmt = $pdo->query("SELECT * FROM pegawai ORDER BY id ASC");
    $pegawais = $stmt->fetchAll();

    $stmtAct = $pdo->query("SELECT * FROM aktivitas");
    $aktivitas = $stmtAct->fetchAll();

    $actMap = [];
    foreach ($aktivitas as $act) {
        $pid = $act['pegawai_id'];
        $th = $act['tahun'];
        $bl = $act['bulan'];
        if (!isset($actMap[$pid])) $actMap[$pid] = [];
        if (!isset($actMap[$pid][$th])) $actMap[$pid][$th] = [];
        $actMap[$pid][$th][$bl] = [
            'mengaji' => (int)$act['mengaji'],
            'kajian_fiqih' => (int)$act['kajian_fiqih'],
            'phbi' => (int)$act['phbi']
        ];
    }

    foreach ($pegawais as &$p) {
        $p['id'] = (int)$p['id'];
        $p['no'] = (int)$p['no'];
        $p['data'] = isset($actMap[$p['id']]) ? $actMap[$p['id']] : [];
    }
    unset($p);

    return ['pegawai' => $pegawais];
}

$action = $_GET['action'] ?? 'get_all';

switch ($action) {
    case 'get_all':
        $data = loadAllData($pdo);
        echo json_encode(['success' => true, 'data' => $data]);
        break;

    case 'get_filters':
        $stmt = $pdo->query("SELECT DISTINCT tempat_tugas FROM pegawai WHERE tempat_tugas IS NOT NULL AND tempat_tugas != '' ORDER BY tempat_tugas");
        $tempat_tugas = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmt = $pdo->query("SELECT DISTINCT struktur_lini FROM pegawai WHERE struktur_lini IS NOT NULL AND struktur_lini != '' ORDER BY struktur_lini");
        $struktur_lini = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmt = $pdo->query("SELECT DISTINCT kelompok_nakes FROM pegawai WHERE kelompok_nakes IS NOT NULL AND kelompok_nakes != '' ORDER BY kelompok_nakes");
        $kelompok_nakes = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmt = $pdo->query("SELECT DISTINCT status_pegawai FROM pegawai WHERE status_pegawai IS NOT NULL AND status_pegawai != '' AND status_pegawai NOT LIKE 'Berhenti - %' ORDER BY status_pegawai");
        $status_pegawai = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $filters = [
            'tempat_tugas' => $tempat_tugas,
            'struktur_lini' => $struktur_lini,
            'kelompok_nakes' => $kelompok_nakes,
            'status_pegawai' => $status_pegawai,
            'tahun' => ['2026', '2027', '2028'],
        ];
        echo json_encode(['success' => true, 'data' => $filters]);
        break;

    case 'get_pegawai':
        $id = $_GET['id'] ?? null;
        if (!$id) { echo json_encode(['success' => false, 'message' => 'ID tidak ditemukan']); break; }
        
        $stmt = $pdo->prepare("SELECT * FROM pegawai WHERE id = ?");
        $stmt->execute([$id]);
        $pegawai = $stmt->fetch();
        
        if ($pegawai) {
            $pegawai['id'] = (int)$pegawai['id'];
            $pegawai['no'] = (int)$pegawai['no'];
            
            $stmtAct = $pdo->prepare("SELECT * FROM aktivitas WHERE pegawai_id = ?");
            $stmtAct->execute([$id]);
            $aktivitas = $stmtAct->fetchAll();
            
            $data = [];
            foreach ($aktivitas as $act) {
                if (!isset($data[$act['tahun']])) $data[$act['tahun']] = [];
                $data[$act['tahun']][$act['bulan']] = [
                    'mengaji' => (int)$act['mengaji'],
                    'kajian_fiqih' => (int)$act['kajian_fiqih'],
                    'phbi' => (int)$act['phbi']
                ];
            }
            $pegawai['data'] = $data;
            echo json_encode(['success' => true, 'data' => $pegawai]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Pegawai tidak ditemukan']);
        }
        break;

    case 'save_aktivitas':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);

        $id = $input['id'] ?? null;
        $tahun = $input['tahun'] ?? null;
        $bulan = $input['bulan'] ?? null;
        $aktivitas = $input['aktivitas'] ?? [];

        if (!$id || !$tahun || !$bulan) {
            echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
            break;
        }

        $mengaji = intval($aktivitas['mengaji'] ?? 0);
        $kajian_fiqih = intval($aktivitas['kajian_fiqih'] ?? 0);
        $phbi = intval($aktivitas['phbi'] ?? 0);

        $stmt = $pdo->prepare("INSERT INTO aktivitas (pegawai_id, tahun, bulan, mengaji, kajian_fiqih, phbi) 
            VALUES (?, ?, ?, ?, ?, ?) 
            ON CONFLICT (pegawai_id, tahun, bulan) 
            DO UPDATE SET mengaji = EXCLUDED.mengaji, kajian_fiqih = EXCLUDED.kajian_fiqih, phbi = EXCLUDED.phbi");
        
        try {
            $stmt->execute([$id, $tahun, $bulan, $mengaji, $kajian_fiqih, $phbi]);
            echo json_encode(['success' => true, 'message' => 'Data berhasil disimpan']);
        } catch (Exception $e) {
             echo json_encode(['success' => false, 'message' => 'Gagal menyimpan: ' . $e->getMessage()]);
        }
        break;

    case 'add_pegawai':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmtMax = $pdo->query("SELECT MAX(no) as max_no FROM pegawai");
        $maxNoResult = $stmtMax->fetch();
        $newNo = intval($maxNoResult['max_no']) + 1;

        $stmt = $pdo->prepare("INSERT INTO pegawai (no, nama, nik, status_pegawai, tanggal_berhenti, jk, kelompok_nakes, nama_jabatan, struktur_lini, tempat_tugas) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id");
        
        $tanggal_berhenti = !empty($input['tanggal_berhenti']) ? $input['tanggal_berhenti'] : null;
        
        try {
            $stmt->execute([
                $newNo,
                $input['nama'] ?? '',
                $input['nik'] ?? '',
                $input['status_pegawai'] ?? '',
                $tanggal_berhenti,
                $input['jk'] ?? '',
                $input['kelompok_nakes'] ?? '',
                $input['nama_jabatan'] ?? '',
                $input['struktur_lini'] ?? '',
                $input['tempat_tugas'] ?? ''
            ]);
            
            $newId = $stmt->fetchColumn();
            
            $newPegawai = [
                'id' => (int)$newId,
                'no' => $newNo,
                'nama' => $input['nama'] ?? '',
                'nik' => $input['nik'] ?? '',
                'status_pegawai' => $input['status_pegawai'] ?? '',
                'tanggal_berhenti' => $tanggal_berhenti,
                'jk' => $input['jk'] ?? '',
                'kelompok_nakes' => $input['kelompok_nakes'] ?? '',
                'nama_jabatan' => $input['nama_jabatan'] ?? '',
                'struktur_lini' => $input['struktur_lini'] ?? '',
                'tempat_tugas' => $input['tempat_tugas'] ?? '',
                'data' => []
            ];

            echo json_encode(['success' => true, 'data' => $newPegawai, 'message' => 'Pegawai berhasil ditambahkan']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Gagal menambahkan: ' . $e->getMessage()]);
        }
        break;

    case 'edit_pegawai':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);
        
        $id = $input['id'] ?? null;
        if (!$id) { echo json_encode(['success' => false, 'message' => 'ID pegawai diperlukan']); break; }

        $updates = [];
        $params = [];
        
        $allowedFields = ['nama', 'nik', 'status_pegawai', 'tanggal_berhenti', 'jk', 'kelompok_nakes', 'nama_jabatan', 'struktur_lini', 'tempat_tugas'];
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $input)) {
                $updates[] = "$field = ?";
                $params[] = $input[$field] !== '' ? $input[$field] : null; 
            }
        }

        if (count($updates) === 0) {
            echo json_encode(['success' => true, 'message' => 'Tidak ada perubahan']);
            break;
        }

        $params[] = $id;

        $stmt = $pdo->prepare("UPDATE pegawai SET " . implode(", ", $updates) . " WHERE id = ?");
        try {
            $stmt->execute($params);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Data pegawai berhasil diperbarui']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Pegawai tidak ditemukan atau tidak ada yang diubah']);
            }
        } catch (Exception $e) {
             echo json_encode(['success' => false, 'message' => 'Gagal memperbarui: ' . $e->getMessage()]);
        }
        break;

    case 'delete_pegawai':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);

        $id = $input['id'] ?? null;
        if (!$id) { echo json_encode(['success' => false, 'message' => 'ID pegawai diperlukan']); break; }

        $stmt = $pdo->prepare("DELETE FROM pegawai WHERE id = ?");
        try {
            $stmt->execute([$id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Pegawai berhasil dihapus']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Pegawai tidak ditemukan']);
            }
        } catch (Exception $e) {
             echo json_encode(['success' => false, 'message' => 'Gagal menghapus: ' . $e->getMessage()]);
        }
        break;

    case 'delete_aktivitas':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success' => false, 'message' => 'Method not allowed']); break; }
        $input = json_decode(file_get_contents('php://input'), true);

        $id = $input['id'] ?? null;
        $tahun = $input['tahun'] ?? null;
        $bulan = $input['bulan'] ?? null;

        if (!$id || !$tahun || !$bulan) {
            echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
            break;
        }

        $stmt = $pdo->prepare("DELETE FROM aktivitas WHERE pegawai_id = ? AND tahun = ? AND bulan = ?");
        try {
            $stmt->execute([$id, $tahun, $bulan]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Data aktivitas berhasil dihapus']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Data tidak ditemukan']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus: ' . $e->getMessage()]);
        }
        break;

    case 'get_aktivitas_list':
        $tahun = $_GET['tahun'] ?? null;
        $bulan = $_GET['bulan'] ?? null;
        $search = $_GET['search'] ?? '';
        $tempat = $_GET['tempat_tugas'] ?? '';

        $query = "SELECT p.id, p.nama, p.nik, p.tempat_tugas, a.tahun, a.bulan, a.mengaji, a.kajian_fiqih, a.phbi 
                  FROM pegawai p JOIN aktivitas a ON p.id = a.pegawai_id 
                  WHERE p.status_pegawai NOT LIKE 'Berhenti - %'";

        $params = [];

        if ($tempat) {
            $query .= " AND p.tempat_tugas = ?";
            $params[] = $tempat;
        }

        if ($search) {
            $query .= " AND (p.nama ILIKE ? OR p.nik ILIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        if ($tahun) {
            $query .= " AND a.tahun = ?";
            $params[] = $tahun;
        }

        if ($bulan) {
            $query .= " AND a.bulan = ?";
            $params[] = $bulan;
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $result = [];
        foreach ($rows as $row) {
            $mengaji = (int)$row['mengaji'];
            $fiqih = (int)$row['kajian_fiqih'];
            $phbi = (int)$row['phbi'];
            if ($mengaji + $fiqih + $phbi > 0) {
                $result[] = [
                    'id' => $row['id'],
                    'nama' => $row['nama'],
                    'nik' => $row['nik'],
                    'tempat_tugas' => $row['tempat_tugas'],
                    'tahun' => $row['tahun'],
                    'bulan' => $row['bulan'],
                    'mengaji' => $mengaji,
                    'kajian_fiqih' => $fiqih,
                    'phbi' => $phbi,
                    'total' => $mengaji + $fiqih + $phbi,
                ];
            }
        }

        usort($result, function($a, $b) { return strcmp($a['nama'], $b['nama']); });
        echo json_encode(['success' => true, 'data' => $result, 'total' => count($result)]);
        break;

    case 'reload':
        echo json_encode(['success' => false, 'message' => 'Data kini disimpan di Database PostgreSQL, tidak perlu reload dari Excel.']);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Action tidak dikenal']);
}
?>
