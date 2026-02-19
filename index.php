<?php
session_start();

if (!isset($_SESSION['role'])) {
    $page = 'login';
} else {
    $page = $_GET['page'] ?? 'dashboard';
    $role = $_SESSION['role'];
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $users = [
        'kerohanian' => ['password' => 'kerohanianrsi', 'role' => 'kerohanian', 'name' => 'Divisi Kerohanian'],
        'sdm' => ['password' => 'sdmrsi', 'role' => 'sdm', 'name' => 'Divisi SDM'],
    ];
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    if (isset($users[$username]) && $users[$username]['password'] === $password) {
        $_SESSION['role'] = $users[$username]['role'];
        $_SESSION['name'] = $users[$username]['name'];
        $_SESSION['username'] = $username;
        header('Location: index.php?page=dashboard');
        exit;
    } else {
        $loginError = 'Username atau password salah';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<meta name="theme-color" content="#14532d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Sistem Rekap Kegiatan Keagamaan - RSI Siti Khadijah Palembang</title>
<meta name="description" content="Sistem rekapitulasi kegiatan keagamaan pegawai RSI Siti Khadijah Palembang">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  /* ============================================
     DARK GREEN THEME — RSI KEGIATAN KEAGAMAAN
     ============================================ */
  :root {
    --green-900: #14532d;
    --green-800: #166534;
    --green-700: #15803d;
    --green-600: #16a34a;
    --green-500: #22c55e;
    --green-400: #4ade80;
    --green-300: #86efac;
    --green-200: #bbf7d0;
    --green-100: #dcfce7;
    --green-50: #f0fdf4;

    --primary: #14532d;
    --primary2: #166534;
    --accent: #16a34a;
    --accent2: #15803d;
    --accent-light: rgba(22,163,74,0.12);

    --bg: #f0fdf4;
    --surface: #ffffff;
    --surface2: #f0fdf4;
    --surface3: #dcfce7;
    --text: #14532d;
    --text2: #4d7c5e;
    --text3: #86a893;
    --border: #bbf7d0;
    --border2: #86efac;

    --danger: #dc2626;
    --success: #059669;
    --warning: #d97706;
    --info: #0284c7;
  }

  *, *::before, *::after { box-sizing: border-box; }
  * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; margin: 0; }
  body { background: var(--bg); color: var(--text); overflow-x: hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  html { overflow-x: hidden; scroll-behavior: smooth; }
  .sf-text { font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif; letter-spacing: -0.02em; }

  /* === SCROLLBAR === */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--green-300); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--green-400); }

  /* === CARDS === */
  .card {
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(20,83,45,0.06), 0 6px 24px rgba(20,83,45,0.04);
    border: 1px solid var(--border);
  }
  .card-sm {
    background: var(--surface);
    border-radius: 14px;
    box-shadow: 0 1px 3px rgba(20,83,45,0.04);
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .card-sm:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(20,83,45,0.08);
  }

  /* Gradient stat cards */
  .grad-green { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: var(--green-200); }
  .grad-emerald { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-color: #a7f3d0; }
  .grad-teal { background: linear-gradient(135deg, #f0fdfa, #ccfbf1); border-color: #99f6e4; }
  .grad-lime { background: linear-gradient(135deg, #f7fee7, #ecfccb); border-color: #d9f99d; }

  /* === BUTTONS === */
  .btn-primary {
    background: var(--primary);
    color: white;
    border-radius: 10px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    -webkit-tap-highlight-color: transparent;
  }
  .btn-primary:hover { background: var(--primary2); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(20,83,45,0.25); }
  .btn-primary:active { transform: translateY(0); }

  .btn-accent {
    background: var(--accent);
    color: white;
    border-radius: 10px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    -webkit-tap-highlight-color: transparent;
  }
  .btn-accent:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,0.25); }

  .btn-ghost {
    background: transparent;
    color: var(--text2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 9px 18px;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .btn-ghost:hover { background: var(--surface2); color: var(--text); border-color: var(--border2); }

  .btn-danger { background: var(--danger); color: white; border-radius: 10px; padding: 8px 16px; font-weight: 600; font-size: 13px; transition: all 0.2s; cursor: pointer; border: none; }
  .btn-sm { padding: 7px 14px; font-size: 13px; border-radius: 8px; }

  /* === INPUT / SELECT === */
  .input {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    color: var(--text);
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    -webkit-appearance: none;
  }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }

  .select {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    color: var(--text);
    cursor: pointer;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234d7c5e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }

  /* === BADGE === */
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-gold { background: rgba(22,163,74,0.1); color: var(--accent2); }
  .badge-dark { background: rgba(20,83,45,0.08); color: var(--primary); }
  .badge-green { background: rgba(5,150,105,0.1); color: #059669; }
  .badge-red { background: rgba(220,38,38,0.08); color: #dc2626; }

  /* === STAT CARD === */
  .stat-card { padding: 20px; border-radius: 16px; position: relative; overflow: hidden; }

  /* === TABLE === */
  .tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
  .tbl thead th {
    background: var(--surface2);
    padding: 12px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: var(--text2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 2px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 1;
    white-space: nowrap;
  }
  .tbl tbody tr { transition: background 0.15s; }
  .tbl tbody tr:hover { background: rgba(22,163,74,0.04); }
  .tbl tbody td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid var(--border); }
  .tbl tbody tr:last-child td { border-bottom: none; }

  /* === SIDEBAR === */
  .sidebar {
    width: 260px;
    min-height: 100vh;
    height: 100vh;
    background: linear-gradient(180deg, var(--green-900) 0%, var(--green-800) 100%);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 200;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
  }
  .sidebar-logo { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
  .sidebar-nav { flex: 1; overflow-y: auto; padding-top: 8px; padding-bottom: 80px; }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 18px;
    color: rgba(255,255,255,0.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 10px;
    margin: 2px 12px;
    transition: all 0.2s;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }
  .nav-item:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
  .nav-item.active {
    background: rgba(74,222,128,0.15);
    color: var(--green-300);
  }
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    border-radius: 0 4px 4px 0;
    background: var(--green-400);
  }
  .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
  .nav-section { padding: 18px 20px 6px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.12em; }

  /* Sidebar user at bottom */
  .sidebar-user {
    padding: 14px;
    border-top: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    background: var(--green-900);
  }

  /* === MAIN CONTENT === */
  .main-content { margin-left: 260px; min-height: 100vh; }

  /* === TOPBAR === */
  .topbar {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  /* === TABS === */
  .tab-btn {
    padding: 7px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text3);
    background: transparent;
    border: none;
    -webkit-tap-highlight-color: transparent;
  }
  .tab-btn.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

  /* === PROGRESS === */
  .progress { height: 6px; background: var(--green-100); border-radius: 10px; overflow: hidden; }
  .progress-bar { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

  /* === CHART === */
  .chart-wrap { position: relative; height: 280px; }

  /* === ANIMATE === */
  .fade-in { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  /* === LOADER === */
  .spinner { width: 32px; height: 32px; border: 3px solid var(--green-200); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* === CHECKBOX === */
  .cb-custom { width: 18px; height: 18px; border-radius: 5px; border: 2px solid var(--border); cursor: pointer; accent-color: var(--accent); }

  .page-content { display: none; }
  .page-content.active { display: block; }
  .no-select { user-select: none; }

  /* === SIDEBAR OVERLAY === */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 190;
    display: none;
    -webkit-tap-highlight-color: transparent;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .sidebar-overlay.open {
    display: block;
    opacity: 1;
  }

  /* === RESPONSIVE UTILS === */
  .responsive-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .responsive-flex { display: flex; flex-wrap: wrap; gap: 12px; }

  /* === TABLE WRAPPER === */
  .tbl-wrap {
    overflow-x: auto;
    overflow-y: auto;
    max-height: 650px;
    border-radius: 12px;
    -webkit-overflow-scrolling: touch;
  }
  .tbl-wrap::-webkit-scrollbar { height: 6px; width: 6px; }
  .tbl-wrap::-webkit-scrollbar-track { background: transparent; }
  .tbl-wrap::-webkit-scrollbar-thumb { background: var(--green-200); border-radius: 10px; }

  /* === DRAWER === */
  .drawer {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    width: 600px;
    max-width: 100vw;
    background: var(--surface);
    box-shadow: -4px 0 30px rgba(0,0,0,0.12);
    z-index: 250;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .drawer.open { transform: translateX(0); }
  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 240;
    display: none;
    -webkit-tap-highlight-color: transparent;
  }
  .drawer-overlay.open { display: block; }

  /* ===========================
     MOBILE (max-width: 768px)
     =========================== */
  @media (max-width: 768px) {
    /* Sidebar hidden by default on mobile */
    .sidebar {
      transform: translateX(-100%);
      width: 280px;
      box-shadow: none;
    }
    .sidebar.open {
      transform: translateX(0);
      box-shadow: 4px 0 30px rgba(0,0,0,0.3);
    }

    /* Main content full width */
    .main-content { margin-left: 0; }

    /* Topbar adapts */
    .topbar { padding: 0 12px; height: 54px; }

    /* Cards shrink padding */
    .card { border-radius: 14px; }
    .card-sm { border-radius: 12px; }

    /* Tables shrink */
    .tbl thead th { font-size: 10px; padding: 10px 10px; }
    .tbl tbody td { font-size: 12px; padding: 10px 10px; }
    .tbl { min-width: 450px; }
    .tbl-wrap { max-height: 380px; }

    /* Stats / Charts shrink */
    .stat-card { padding: 14px; }
    .chart-wrap { height: 220px; }

    /* Hide less important columns */
    .hide-mobile { display: none !important; }

    /* Inputs smaller on mobile */
    .input, .select { padding: 9px 12px; font-size: 13px; }

    /* Buttons */
    .btn-primary, .btn-accent, .btn-ghost { padding: 9px 16px; font-size: 13px; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    /* Drawer full width on mobile */
    .drawer { width: 100vw; }
    body.drawer-open { overflow: hidden; position: fixed; width: 100%; }
    body.sidebar-open { overflow: hidden; }

    /* Fix grid for tiny screens */
    .responsive-grid { grid-template-columns: 1fr; gap: 10px; }

    /* Fix filter grids on mobile — force 2 columns max */
    .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }

    /* Ensure touch targets are big enough */
    .nav-item { padding: 14px 18px; font-size: 15px; min-height: 44px; }
  }

  /* Small phones */
  @media (max-width: 480px) {
    .topbar { padding: 0 8px; }
    .grid-cols-2 { gap: 6px !important; }
    .card { border-radius: 12px; }
    .tbl { min-width: 400px; }
    .chart-wrap { height: 200px; }
  }

  /* Tablet */
  @media (min-width: 769px) and (max-width: 1024px) {
    .sidebar { width: 240px; }
    .main-content { margin-left: 240px; }
    .nav-item { padding: 10px 16px; font-size: 13px; }
    .chart-wrap { height: 260px; }
  }

  /* Large screens — fill the space */
  @media (min-width: 1200px) {
    .main-content { margin-left: 260px; }
    .tbl-wrap { max-height: 700px; }
    .chart-wrap { height: 320px; }
  }

  /* Extra large screens */
  @media (min-width: 1600px) {
    .main-content { margin-left: 260px; }
    .tbl-wrap { max-height: 800px; }
    .chart-wrap { height: 360px; }
  }

  /* Pulse dot for online status */
  .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green-400); display: inline-block; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  /* === MODAL === */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 300;
    display: none;
    opacity: 0;
    transition: opacity 0.25s;
  }
  .modal-overlay.open { display: block; opacity: 1; }

  .modal-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.95);
    background: var(--surface);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    z-index: 310;
    width: 480px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    display: none;
    opacity: 0;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s;
  }
  .modal-card.open { display: block; opacity: 1; transform: translate(-50%, -50%) scale(1); }
  .modal-sm { width: 380px; }

  .modal-header {
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .modal-body { padding: 20px; }
  .modal-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  /* === FORM LABELS === */
  .form-label { display: block; font-size: 12px; font-weight: 600; color: var(--text2); margin-bottom: 6px; }
  .form-label-sm { display: block; font-size: 11px; font-weight: 600; color: var(--text3); margin-bottom: 4px; }

  /* === INPUT WITH ICON === */
  .input-icon-wrap { position: relative; }
  .input-icon {
    position: absolute;
    left: 1px;
    top: 1px;
    bottom: 1px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px 0 0 9px;
    pointer-events: none;
  }
  .input-icon-wrap .input.pl-12 { padding-left: 46px; }

  /* === SEARCHABLE DROPDOWN === */
  .custom-select-wrap { position: relative; }
  .custom-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-top: none;
    border-radius: 0 0 12px 12px;
    max-height: 240px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(20,83,45,0.1);
    display: none;
  }
  .custom-dropdown.open { display: block; }
  .dd-item {
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid var(--border);
  }
  .dd-item:last-child { border-bottom: none; }
  .dd-item:hover { background: var(--surface2); }
  .dd-empty { padding: 16px; text-align: center; color: var(--text3); font-size: 13px; }

  /* === ACTION BUTTONS === */
  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text3);
    -webkit-tap-highlight-color: transparent;
  }
  .action-edit:hover { background: rgba(22,163,74,0.08); border-color: var(--accent); color: var(--accent); }
  .action-delete:hover { background: rgba(220,38,38,0.06); border-color: var(--danger); color: var(--danger); }

  /* === BG HIGHLIGHT === */
  .bg-green-50 { background: rgba(22,163,74,0.04); }

  @media (max-width: 768px) {
    .modal-card { width: calc(100vw - 24px); border-radius: 16px; }
    .modal-header { padding: 14px 16px; }
    .modal-body { padding: 16px; }
    .modal-footer { padding: 12px 16px; }
    .action-btn { width: 30px; height: 30px; }
  }
</style>
</head>
<body>

<?php if (!isset($_SESSION['role'])): ?>
<!-- ============ LOGIN PAGE ============ -->
<div class="min-h-screen flex items-center justify-center p-4" style="background: linear-gradient(150deg, #14532d 0%, #166534 40%, #15803d 100%);">
  <div class="w-full max-w-sm fade-in">
    <div class="text-center mb-7">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style="background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.25);">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white sf-text">Rekap Kegiatan Keagamaan</h1>
      <p class="text-sm mt-1.5 font-medium" style="color: rgba(187,247,208,0.6);">RSI Siti Khadijah Palembang</p>
    </div>

    <div class="card p-7" style="border: 1px solid rgba(187,247,208,0.3);">
      <?php if (!empty($loginError)): ?>
      <div class="mb-4 p-3 rounded-xl text-sm font-medium" style="background: rgba(220,38,38,0.08); color: #dc2626; border: 1px solid rgba(220,38,38,0.12);">
        <?= htmlspecialchars($loginError) ?>
      </div>
      <?php endif; ?>

      <form method="POST">
        <div class="mb-4">
          <label class="block text-xs font-semibold mb-2" style="color: var(--text2);">Username</label>
          <input type="text" name="username" class="input" placeholder="Masukkan username" required autocomplete="off">
        </div>
        <div class="mb-6">
          <label class="block text-xs font-semibold mb-2" style="color: var(--text2);">Password</label>
          <input type="password" name="password" class="input" placeholder="Masukkan password" required>
        </div>
        <button type="submit" name="login" class="btn-accent w-full text-center" style="width:100%; display:block; padding: 12px; font-size: 15px;">
          Masuk
        </button>
      </form>

      
    </div>

    <p class="text-center mt-6 text-xs font-medium" style="color: rgba(187,247,208,0.5);">
      © 2026 RSI Siti Khadijah Palembang<br>
      <span style="opacity:0.7">Developed by Muhammad Rifqi Thoohaa Anas</span>
    </p>
  </div>
</div>

<?php else: ?>
<!-- ============ MAIN APP ============ -->
<?php include 'includes/app.php'; ?>
<?php endif; ?>

</body>
</html>
