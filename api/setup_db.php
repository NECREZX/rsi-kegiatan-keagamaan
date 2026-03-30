<?php
// api/setup_db.php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

$pdo = getDB();

// Create tables
$sql = "
CREATE TABLE IF NOT EXISTS pegawai (
    id SERIAL PRIMARY KEY,
    no INT,
    nama VARCHAR(255),
    nik VARCHAR(50),
    status_pegawai VARCHAR(100),
    tanggal_berhenti DATE NULL,
    jk VARCHAR(20),
    kelompok_nakes VARCHAR(100),
    nama_jabatan VARCHAR(255),
    struktur_lini VARCHAR(100),
    tempat_tugas VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS aktivitas (
    id SERIAL PRIMARY KEY,
    pegawai_id INT REFERENCES pegawai(id) ON DELETE CASCADE,
    tahun VARCHAR(4),
    bulan VARCHAR(2),
    mengaji INT DEFAULT 0,
    kajian_fiqih INT DEFAULT 0,
    phbi INT DEFAULT 0,
    UNIQUE(pegawai_id, tahun, bulan)
);
";

try {
    $pdo->exec($sql);
} catch (Exception $e) {
    die(json_encode(['success' => false, 'message' => 'Table creation failed: ' . $e->getMessage()]));
}

// Check if JSON exists
if (file_exists(JSON_DB)) {
    $json = file_get_contents(JSON_DB);
    $data = json_decode($json, true);
    
    if (isset($data['pegawai']) && count($data['pegawai']) > 0) {
        $pdo->beginTransaction();
        try {
            $pdo->exec("DELETE FROM pegawai");
            
            $pegawaiParams = [];
            $pegawaiPlaceholders = [];
            
            $aktivitasParams = [];
            $aktivitasPlaceholders = [];
            
            foreach ($data['pegawai'] as $p) {
                $tanggal_berhenti = !empty($p['tanggal_berhenti']) ? $p['tanggal_berhenti'] : null;
                
                $pegawaiPlaceholders[] = "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                array_push($pegawaiParams, 
                    $p['id'],
                    $p['no'] ?? $p['id'],
                    $p['nama'] ?? '',
                    $p['nik'] ?? '',
                    $p['status_pegawai'] ?? '',
                    $tanggal_berhenti,
                    $p['jk'] ?? '',
                    $p['kelompok_nakes'] ?? '',
                    $p['nama_jabatan'] ?? '',
                    $p['struktur_lini'] ?? '',
                    $p['tempat_tugas'] ?? ''
                );
                
                if (isset($p['data']) && is_array($p['data'])) {
                    foreach ($p['data'] as $tahun => $bulanData) {
                        if (is_array($bulanData)) {
                            foreach ($bulanData as $bulan => $act) {
                                $aktivitasPlaceholders[] = "(?, ?, ?, ?, ?, ?)";
                                array_push($aktivitasParams,
                                    $p['id'],
                                    $tahun,
                                    $bulan,
                                    intval($act['mengaji'] ?? 0),
                                    intval($act['kajian_fiqih'] ?? 0),
                                    intval($act['phbi'] ?? 0)
                                );
                            }
                        }
                    }
                }
            }
            
            // Chunked Bulk Insert Pegawai (100 at a time)
            $pChunks = array_chunk($pegawaiPlaceholders, 100);
            $pParamChunks = array_chunk($pegawaiParams, 1100); // 100 * 11 columns
            
            foreach ($pChunks as $i => $chunkPlaceholders) {
                $sql = "INSERT INTO pegawai (id, no, nama, nik, status_pegawai, tanggal_berhenti, jk, kelompok_nakes, nama_jabatan, struktur_lini, tempat_tugas) VALUES " . implode(", ", $chunkPlaceholders);
                $stmt = $pdo->prepare($sql);
                $stmt->execute($pParamChunks[$i]);
            }
            
            // Chunked Bulk Insert Aktivitas (300 at a time)
            if (count($aktivitasPlaceholders) > 0) {
                $aChunks = array_chunk($aktivitasPlaceholders, 300);
                $aParamChunks = array_chunk($aktivitasParams, 1800); // 300 * 6 columns
                
                foreach ($aChunks as $i => $chunkPlaceholders) {
                    $sql = "INSERT INTO aktivitas (pegawai_id, tahun, bulan, mengaji, kajian_fiqih, phbi) VALUES " . implode(", ", $chunkPlaceholders);
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($aParamChunks[$i]);
                }
            }
            
            $pdo->exec("SELECT setval(pg_get_serial_sequence('pegawai', 'id'), coalesce(max(id),0) + 1, false) FROM pegawai");

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Database configured and ' . count($data['pegawai']) . ' records migrated incredibly fast.']);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Migration failed: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => true, 'message' => 'Tables created, but no JSON data found to migrate.']);
    }
} else {
    echo json_encode(['success' => true, 'message' => 'Tables created, but database.json does not exist.']);
}
