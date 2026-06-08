import os
import time
import datetime
import pandas as pd
from helpers.executable_api import ExecutableApi
from database.project.data_cuaca import StationLocations, WeatherDailyData
from database.project.base import db
from database.project.setup import SetupProjectDatabase

class Swat2012WeatherImport(ExecutableApi):
    def __init__(self, project_db_file, delete_existing, create_stations, source_dir):
        super().__init__()
        self.project_db_file = project_db_file
        self.source_dir = source_dir
        self.delete_existing = delete_existing
        
        SetupProjectDatabase.init(project_db_file)
        db.create_tables([StationLocations, WeatherDailyData], safe=True)

    def import_data(self):
        """Fungsi utama untuk memproses semua stasiun dari file SWAT 2012"""
        try:
            # File index standar SWAT 2012 (Contoh: pcp.txt, tmp.txt, dll)
            # Kita fokus ke satu file index untuk mendapatkan daftar stasiun
            index_files = ['pcp.txt', 'tmp.txt', 'hmd.txt', 'slr.txt', 'wnd.txt']
            main_index = None
            for f in index_files:
                if os.path.exists(os.path.join(self.source_dir, f)):
                    main_index = os.path.join(self.source_dir, f)
                    break
            
            if not main_index:
                raise FileNotFoundError("File index stasiun (pcp.txt/tmp.txt) tidak ditemukan.")

            self.process_index_file(main_index)
            self.emit_progress(100, "Impor SWAT 2012 ke Database Selesai!")
        except Exception as e:
            self.emit_error(f"Gagal impor SWAT 2012: {str(e)}")

    def process_index_file(self, index_path):
        with open(index_path, "r") as f:
            lines = f.readlines()
            # Skip header "ID,NAME,LAT,LONG,ELEVATION"
            for i, line in enumerate(lines):
                if i == 0 or not line.strip(): 
                    continue
                
                # Parse info stasiun: ID, NAME, LAT, LONG, ELEV
                parts = [x.strip() for x in line.split(',')]
                if len(parts) < 5: 
                    continue
                
                station_name = parts[1]
                meta = {'lat': parts[2], 'long': parts[3], 'elev': parts[4]}
                
                self.import_station_data(station_name, meta)
                self.emit_progress(int(i/len(lines)*100), f"Memproses stasiun: {station_name}")

    def import_station_data(self, station_name, meta):
        # 1. Ambil/buat stasiun
        station, _ = StationLocations.get_or_create(
            station_name=station_name,
            defaults={'lat': float(meta['lat']), 'long': float(meta['long']), 'elev': float(meta['elev'])}
        )

        # 2. Hapus data lama agar sinkron (Sesuai kesepakatan)
        with db.atomic():
            WeatherDailyData.delete().where(WeatherDailyData.station == station).execute()

        # 3. Baca file data harian (NAMA_STASIUN.txt)
        data_file = os.path.join(self.source_dir, f"{station_name}.txt")
        if not os.path.exists(data_file): 
            return

        data_list = []
        with open(data_file, "r") as f:
            lines = f.readlines()
            # Baris pertama adalah tanggal: YYYYMMDD
            start_date_str = lines[0].strip()
            curr_date = datetime.datetime.strptime(start_date_str, "%Y%m%d")

            for line in lines[1:]:
                if not line.strip(): 
                    continue
                
                # Parsing data baris (gunakan split koma sesuai kode legacy)
                vals = [x.strip() for x in line.split(',')]
                
                # Logic sederhana (bisa disesuaikan dengan jenis file pcp/tmp/hmd)
                data_list.append({
                    'station': station,
                    'date': curr_date.strftime("%Y-%m-%d"),
                    'pcp': float(vals[0]) if len(vals) == 1 else 0, # Sesuaikan mapping
                    'tmp_max': float(vals[0]) if len(vals) > 1 else 0,
                    'tmp_min': float(vals[1]) if len(vals) > 1 else 0
                })
                curr_date += datetime.timedelta(days=1)

        # 4. Insert data
        with db.atomic():
            WeatherDailyData.insert_many(data_list).execute()