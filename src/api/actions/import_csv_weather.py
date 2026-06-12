# Copy the imports from import_weather.py here
import sys
import os

  

import re
import pandas as pd
from datetime import datetime

from actions.import_weather import WeatherImport
from helpers.executable_api import ExecutableApi
from database.project.setup import SetupProjectDatabase
from database.project.config import Project_config
from database.project.data_cuaca import StationLocations, WeatherDailyData
from database.project.base import db




def format_swat_line(year, doy, value):
        return f"{str(int(year)).rjust(4)}{str(int(doy)).rjust(5)}{f'{value:.5f}'.rjust(11)}\n"
    
def format_swat_tem_line(year, doy, tmax, tmin):
        return f"{str(int(year)).rjust(4)}{str(int(doy)).rjust(5)}{f'{tmax:.5f}'.rjust(11)}{f'{tmin:.5f}'.rjust(12)}\n"
    
def write_swat_header(file_handle, filename, desc, nbyr, lat, lon, elev):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    file_handle.write(f"{filename}: {desc} data - file written by SWAT+ editor {now}\n")
    file_handle.write("nbyr".rjust(4) + "tstep".rjust(10) + "lat".rjust(10) + "lon".rjust(10) + "elev".rjust(10) + "\n")
    file_handle.write(f"{str(nbyr).rjust(4)}{'0'.rjust(10)}{f'{lat:.3f}'.rjust(10)}{f'{lon:.3f}'.rjust(10)}{f'{elev:.3f}'.rjust(10)}\n")

def create_weather_cli_index(output_dir, extension, file_type_name, output_filename):
    """
    Versi fleksibel untuk semua jenis file (.hmd, .pcp, .tmp, dsb)
    """
    index_path = os.path.join(output_dir, output_filename)
    files = [f for f in os.listdir(output_dir) if f.endswith(extension)]
    files.sort()
    with open(index_path, 'w') as f:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"{output_filename}: {file_type_name} file names - file written by SWAT+ editor {now}\n")
        f.write("filename\n")
        for filename in files:
            f.write(f"{filename}\n")
            
class Unbuffered(object):
    def __init__(self, stream):
        self.stream = stream
    def write(self, data):
        self.stream.write(data)
        self.stream.flush()
    def writelines(self, datas):
        self.stream.writelines(datas)
        self.stream.flush()
    def __getattr__(self, attr):
        return getattr(self.stream, attr)
    
class CsvWeatherImport(ExecutableApi):
    def __init__(self, project_db_file, delete_existing, csv_dir, output_dir):
        SetupProjectDatabase.init(project_db_file)
        db.create_tables([StationLocations, WeatherDailyData], safe=True)
        self.project_db_file = project_db_file
        self.csv_dir = csv_dir
        self.weather_output_dir = output_dir
        self.delete_existing_data = delete_existing
        if not output_dir or output_dir == 'null':
            self.weather_output_dir = os.path.dirname(csv_dir)
        else:
            self.weather_output_dir = output_dir
        self.delete_existing_data = delete_existing
   
    def update_db_config(self):
        try:
            config = Project_config.get()
            print(f"DEBUG: Konfigurasi saat ini (sebelum): {getattr(config, 'weather_data_dir', 'None')}")
            print(f"DEBUG: Path output baru yang akan diset: {self.weather_output_dir}")
            if not os.path.exists(self.weather_output_dir):
                print(f"WARNING: Folder output tidak ditemukan di: {self.weather_output_dir}")
            config.weather_data_dir = self.weather_output_dir
            config.save()
            
            new_config = Project_config.get()
            print(f"DEBUG: Konfigurasi berhasil diperbarui menjadi: {new_config.weather_data_dir}")
            self.emit_progress(75, "Konfigurasi database berhasil diperbarui.")
        except Exception as e:
            self.emit_error(f"Gagal memperbarui database config: {str(e)}")
            print(f"DEBUG ERROR: {e}")          
     
      
    def process_file_csv(self):
        all_files = [f for f in os.listdir(self.csv_dir) if f.endswith(".csv")]
        if not all_files:
            self.emit_error("Tidak ada file CSV ditemukan di folder input data")
            return
        self.emit_progress(50, "Mencoba koneksi ke CsvWeatherImport... Berhasil!")
        
        fisrt_file_path = os.path.join(self.csv_dir, all_files[0])
        standard_meta = self.parse_header_info(fisrt_file_path)
        
        self.emit_progress(5, f"Validasi KOnsisten berdasarkan file: {standard_meta['file_name']} dengan tanggal {standard_meta['start_date']} - {standard_meta['end_date']} dan lokasi latitude {standard_meta['latitude']} longitude {standard_meta['longitude']}")
        for i, filename in enumerate(all_files):
            file_path = os.path.join(self.csv_dir, filename)
            current_meta = self.parse_header_info(file_path)
            if (current_meta['start_year'] != standard_meta['start_year'] or 
                current_meta['end_year'] != standard_meta['end_year']):
                self.emit_error(f"Data tidak konsisten File {filename} tidak memiliki periode " f"({current_meta['start_year']}-{current_meta['end_year']}) "f"yang berbeda dengan stasiun utama ({standard_meta['start_year']}-{standard_meta['end_year']}).")
 
                return
            
            self.create_hmd_data(file_path, current_meta)
            self.create_pcp_data(file_path, current_meta)
            self.create_slr_data(file_path, current_meta)
            self.create_wnd_data(file_path, current_meta)
            self.create_tem_data(file_path, current_meta)
            
            self.import_to_db(file_path, current_meta)
                        
            percent = int(((i+1) / len(all_files)) * 100)
            self.emit_progress(percent, f"Validasi & DB Sync file {filename}... Berhasil!")    

    def parse_header_info(self, file_path):
        # Contoh fungsi untuk membaca header CSV dan mengekstrak informasi stasiun
        with open(file_path, 'r') as f:
            head = [f.readline() for _ in range (15)]  # Baca 10 baris pertama untuk header
            
        info = {
            'file_name': os.path.basename(file_path), 
            'start_year': None, 
            'end_year' : None, 
            'latitude': None, 
            'longitude': None,
            'elevation': None
            }
  
        for line in head:
            
            date_match = re.search(r'(\d{2}/\d{2}/\d{4}).*?(\d{2}/\d{2}/\d{4})', line)
            if date_match:
                info['start_date'] = date_match.group(1)
                info['end_date'] = date_match.group(2)
                info['start_year'] = date_match.group(1).split('/')[-1]
                info['end_year'] = date_match.group(2).split('/')[-1]
            
            loc_match = re.search(r'latitude\s+([-0-9.]+)\s+longitude\s+([-0-9.]+)', line, re.IGNORECASE)
            if loc_match:
                info['latitude'] = loc_match.group(1)
                info['longitude'] = loc_match.group(2)
                            
            clean_line = line.replace('\xa0', ' ') # Membersihkan karakter spasi aneh
            if 'elevation' in clean_line.lower():
                elev_match = re.search(r'([-0-9.]+)\s+meters', clean_line, re.IGNORECASE)
                if elev_match:
                    try:
                        info['elevation'] = float(elev_match.group(1))
                        break
                    except ValueError:
                        print(f"DEBUG: Gagal mengonversi angka: {elev_match.group(1)}")
                    
        # print(f"DEBUG info: {info}")
        if not info['start_year'] or not info['end_year'] or not info['latitude'] or not info['longitude']:
            self.emit_error(f"Format header tidak valid di file {os.path.basename(file_path)}. Pastikan header memiliki informasi tanggal dan lokasi yang benar.")
            raise ValueError("Invalid header format")
        
        return info
    
    def create_hmd_data(self, file_path, meta):
        # with open(file_path, 'r') as f:
        #     lines = f.readlines()
        #     print(f"Baris ke-15 adalah: {lines[14]}")  # Debug: Tampilkan baris ke-15 untuk memastikan formatnya benar
            
        df = pd.read_csv(file_path, skiprows=14, sep=r',')
        
        base_name = os.path.basename(file_path).replace('.csv', '')
        output_filename = f"{base_name}.hmd"
        output_path = os.path.join(self.weather_output_dir, output_filename)
        
        lat = float(meta['latitude'])
        lon = float(meta['longitude'])
        elev = float(meta['elevation']) if meta['elevation'] is not None else 0.0
        num_years = len(df['YEAR'].unique())
        
        with open(output_path, 'w') as f:
            write_swat_header(f, output_filename, "Relative humidity", num_years, lat, lon, elev)

            for _, row in df.iterrows():
                f.write(format_swat_line(row['YEAR'], row['DOY'], row['RH2M']/100.0))

    def create_pcp_data(self, file_path, meta):
           
        df = pd.read_csv(file_path, skiprows=14, sep=r',')
        
        base_name = os.path.basename(file_path).replace('.csv', '')
        output_filename = f"{base_name}.pcp"
        output_path = os.path.join(self.weather_output_dir, output_filename)
        
        lat = float(meta['latitude'])
        lon = float(meta['longitude'])
        elev = float(meta['elevation']) if meta['elevation'] is not None else 0.0
        num_years = len(df['YEAR'].unique())
        
        with open(output_path, 'w') as f:
            write_swat_header(f, output_filename, "Precipitation", num_years, lat, lon, elev)

            for _, row in df.iterrows():
                f.write(format_swat_line(row['YEAR'], row['DOY'], row['PRECTOTCORR']))
                
    def create_slr_data(self, file_path, meta):
            
        df = pd.read_csv(file_path, skiprows=14, sep=r',')
        
        base_name = os.path.basename(file_path).replace('.csv', '')
        output_filename = f"{base_name}.slr"
        output_path = os.path.join(self.weather_output_dir, output_filename)
        
        lat = float(meta['latitude'])
        lon = float(meta['longitude'])
        elev = float(meta['elevation']) if meta['elevation'] is not None else 0.0
        num_years = len(df['YEAR'].unique())
        
        with open(output_path, 'w') as f:
            write_swat_header(f, output_filename, "Solar radiation", num_years, lat, lon, elev)

            for _, row in df.iterrows():
                f.write(format_swat_line(row['YEAR'], row['DOY'], row['TOA_SW_DWN']))
                
    def create_wnd_data(self, file_path, meta):
            
        df = pd.read_csv(file_path, skiprows=14, sep=r',')
        
        base_name = os.path.basename(file_path).replace('.csv', '')
        output_filename = f"{base_name}.wnd"
        output_path = os.path.join(self.weather_output_dir, output_filename)
        
        lat = float(meta['latitude'])
        lon = float(meta['longitude'])
        elev = float(meta['elevation']) if meta['elevation'] is not None else 0.0
        num_years = len(df['YEAR'].unique())
        
        with open(output_path, 'w') as f:
            write_swat_header(f, output_filename, "Wind speed", num_years, lat, lon, elev)

            for _, row in df.iterrows():
                f.write(format_swat_line(row['YEAR'], row['DOY'], row['WS2M']))
                
    def create_tem_data(self, file_path, meta):
            
        df = pd.read_csv(file_path, skiprows=14, sep=r',')
        
        base_name = os.path.basename(file_path).replace('.csv', '')
        output_filename = f"{base_name}.tem"
        output_path = os.path.join(self.weather_output_dir, output_filename)
        
        lat = float(meta['latitude'])
        lon = float(meta['longitude'])
        elev = float(meta['elevation']) if meta['elevation'] is not None else 0.0
        num_years = len(df['YEAR'].unique())
        
        with open(output_path, 'w') as f:
            write_swat_header(f, output_filename, "Temperature", num_years, lat, lon, elev)

            for _, row in df.iterrows():
                f.write(format_swat_tem_line(row['YEAR'], row['DOY'], row['T2M_MAX'], row['T2M_MIN']))

    def import_to_db(self, file_path, meta):
        # 2. Ambil/buat stasiun
        station_name = os.path.basename(file_path).replace('.csv', '')
        station, _ = StationLocations.get_or_create(
            station_name=station_name,
            defaults={
                'lat': float(meta['latitude']),
                'long': float(meta['longitude']),
                'elev': float(meta['elevation']) if meta['elevation'] else 0.0
            }
        )
        
        # 3. Hapus data lama untuk stasiun ini (Refresh Data)
        with db.atomic():
            WeatherDailyData.delete().where(WeatherDailyData.station == station).execute()
        
        # 4. Baca CSV dan siapkan list data
        df = pd.read_csv(file_path, skiprows=14)
        data_list = []
        for _, row in df.iterrows():
            try:
                # Membuat objek datetime dari year dan doy
                date_obj = pd.to_datetime(f"{int(row['YEAR'])}-01-01") + pd.to_timedelta(int(row['DOY']) - 1, unit='D')
                formatted_date = date_obj.strftime('%Y-%m-%d')
            except Exception as e:
                print(f"DEBUG: Gagal konversi tanggal: {e}")
                formatted_date = None # atau gunakan fallback
                
            data_list.append({
                'station': station,
                'date': formatted_date,
                'pcp': row.get('PRECTOTCORR', 0),
                'tmp_max': row.get('T2M_MAX', 0),
                'tmp_min': row.get('T2M_MIN', 0),
                'slr': row.get('TOA_SW_DWN', 0),
                'wnd': row.get('WS2M', 0),
                'hmd': row.get('RH2M', 0) / 100.0 if 'RH2M' in row else 0.0
            })
        
        # 5. Insert data baru
        if data_list:
            with db.atomic():
                WeatherDailyData.insert_many(data_list).execute()
                print(f"DEBUG: Insert {len(data_list)} data ke DB untuk {station_name}")
                          
    def run_import(self):
        sys.stdout = Unbuffered(sys.stdout)
        self.process_file_csv()
        
        create_weather_cli_index(self.weather_output_dir, '.hmd', 'Relative humidity', 'hmd.cli')
        create_weather_cli_index(self.weather_output_dir, '.pcp', 'Precipitation', 'pcp.cli')
        create_weather_cli_index(self.weather_output_dir, '.slr', 'Solar radiation', 'slr.cli')
        create_weather_cli_index(self.weather_output_dir, '.wnd', 'Wind speed', 'wnd.cli')
        create_weather_cli_index(self.weather_output_dir, '.tem', 'Temperature', 'tmp.cli')
        self.emit_progress(80, "Memulai integrasi ke database SWAT+...")
        
        self.update_db_config()
        try:
            wi = WeatherImport(
                project_db_file=self.project_db_file, 
                delete_existing=self.delete_existing_data, 
                create_stations=True
            )
            wi.import_data()
            self.emit_progress(100, "Proses Impor dan Database Sync Selesai")
        except Exception as e:
            self.emit_error(f"Terjadi kegagalan saat sinkronisasi database SWAT+: {str(e)}")
        finally:
            try:
                if not db.is_closed():
                    db.close()
                    print("DEBUG: Koneksi database berhasil ditutup.")
            except Exception:
                pass