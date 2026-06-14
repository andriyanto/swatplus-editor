import whitebox_workflows
import json
import os

# 1. Inisialisasi Environment
wbe = whitebox_workflows.WbEnvironment()

def my_progress_handler(json_event):
    try:
        data = json.loads(json_event)
        print(f"Progres: {data.get('progress', 0)}% - {data.get('message', 'Memproses...')}")
    except:
        pass

# Konfigurasi Path Berkas
# Pastikan demutm_clean.tif (hasil ekspor TIFF polos Anda) sudah ada di folder tersebut
input_tif = r"D:\test_dem\demutm\demnas_utm.tif" 
output_gpkg = r"D:\test_dem\output_test\demnas_utm_wbw.gpkg"

# Pastikan folder output tersedia
os.makedirs(os.path.dirname(output_gpkg), exist_ok=True)

# -------------------------------------------------------------------------
# LANGKAH 1: PROSES & TULIS KE FORMAT .GPKG VIA WHITEBOX
# -------------------------------------------------------------------------
print("=== LANGKAH 1: Mengoperasikan Tool & Menulis ke format .gpkg ===")
try:
    wbe.hydrology.depressions_storage.fill_pits(
        dem=input_tif,
        output=output_gpkg,
        callback=my_progress_handler
    )
    print(f"✔ Sukses membuat berkas GeoPackage: {output_gpkg}\n")
except Exception as e:
    print(f"❌ Gagal saat proses penulisan ke .gpkg: {e}\n")

# -------------------------------------------------------------------------
# LANGKAH 2: BACA KEMBALI BERKAS .GPKG BUATAN WHITEBOX
# -------------------------------------------------------------------------
print("=== LANGKAH 2: Membaca Kembali Berkas .gpkg Buatan Whitebox ===")
try:
    if os.path.exists(output_gpkg):
        # Membaca berkas .gpkg yang baru saja dibuat oleh Whitebox sendiri
        raster = wbe.read_raster(output_gpkg)
        meta = raster.metadata()
        
        print("\n" + "="*40)
        print("HASIL METADATA DARI READ .GPKG:")
        print(f"Dimensi     : {meta.rows} x {meta.columns}")
        print(f"Nilai Min   : {meta.minimum}")
        print(f"Nilai Max   : {meta.maximum}")
        print(f"NoData Value: {meta.nodata}")
        print("="*40)
    else:
        print("⚠ File .gpkg tidak ditemukan di disk!")
except Exception as e:
    print(f"❌ Gagal saat membaca kembali berkas .gpkg: {e}")
