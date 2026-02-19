import sys
import json
import pandas as pd
import numpy as np
import re

def clean_val(v):
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return 0
    if isinstance(v, (np.integer, np.int64)):
        return int(v)
    if isinstance(v, (np.floating, np.float64)):
        if np.isnan(v):
            return 0
        return int(v) if v == int(v) else float(v)
    return v

MONTHS_MAP = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'Mei': '05', 'Jun': '06', 'Jul': '07', 'Agust': '08',
    'Sep': '09', 'Okt': '10', 'Nop': '11', 'Des': '12'
}

def parse_month_col(col_name):
    """Parse column like 'Mengaji Jan-23' -> ('mengaji', '2023', '01')"""
    patterns = [
        (r'Mengaji\s+(\w+)-(\d+)', 'mengaji'),
        (r'Kajian Fiqih\s+(\w+)-(\d+)', 'kajian_fiqih'),
        (r'PHBI\s+(\w+)-(\d+)', 'phbi'),
    ]
    for pattern, activity in patterns:
        m = re.match(pattern, str(col_name), re.IGNORECASE)
        if m:
            mon_str = m.group(1)
            yr_str = m.group(2)
            month_num = MONTHS_MAP.get(mon_str, None)
            if month_num:
                year = '20' + yr_str if len(yr_str) == 2 else yr_str
                return (activity, year, month_num)
    return None

def main(xlsx_file, json_file):
    df = pd.read_excel(xlsx_file, header=4, sheet_name='REKAP KEGIATAN KEAGAMAAN')
    
    # Rename columns
    col_map = {
        'N A M A': 'nama',
        'N I K ': 'nik',
        'STATUS PEGAWAI': 'status_pegawai',
        'JK': 'jk',
        'KELOMPOK NAKES': 'kelompok_nakes',
        'NAMA JABATAN': 'nama_jabatan',
        'STRUKTUR LINI': 'struktur_lini',
        'TEMPAT TUGAS': 'tempat_tugas',
        'NO': 'no',
    }
    df = df.rename(columns=col_map)
    
    # Drop rows without NO or NAMA
    df = df[df['no'].notna() & df['nama'].notna()]
    df = df[df['no'].apply(lambda x: str(x).strip().isdigit() if pd.notna(x) else False)]
    
    pegawai_list = []
    all_years = set()
    
    # Get all monthly columns
    monthly_cols = {}
    for col in df.columns:
        parsed = parse_month_col(col)
        if parsed:
            activity, year, month = parsed
            all_years.add(year)
            monthly_cols[col] = (activity, year, month)
    
    for idx, row in df.iterrows():
        try:
            no = int(clean_val(row.get('no', idx+1)))
        except:
            continue
        
        p = {
            'id': no,
            'no': no,
            'nama': str(row.get('nama', '')).strip(),
            'nik': str(row.get('nik', '')).strip(),
            'status_pegawai': str(row.get('status_pegawai', '')).strip(),
            'jk': str(row.get('jk', '')).strip(),
            'kelompok_nakes': str(row.get('kelompok_nakes', '')).strip(),
            'nama_jabatan': str(row.get('nama_jabatan', '')).strip(),
            'struktur_lini': str(row.get('struktur_lini', '')).strip(),
            'tempat_tugas': str(row.get('tempat_tugas', '')).strip(),
            'data': {}
        }
        
        for col, (activity, year, month) in monthly_cols.items():
            if year not in p['data']:
                p['data'][year] = {}
            if month not in p['data'][year]:
                p['data'][year][month] = {'mengaji': 0, 'kajian_fiqih': 0, 'phbi': 0}
            
            val = clean_val(row.get(col, 0))
            if not isinstance(val, (int, float)):
                val = 0
            p['data'][year][month][activity] = int(val)
        
        pegawai_list.append(p)
    
    result = {
        'pegawai': pegawai_list,
        'tahun': sorted(list(all_years)),
        'total': len(pegawai_list)
    }
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"Converted {len(pegawai_list)} pegawai to {json_file}")

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
