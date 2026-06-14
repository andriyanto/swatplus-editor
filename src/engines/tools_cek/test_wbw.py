# import whitebox_workflows
# import json
# import os

# # 1. Inisialisasi Environment
# wbe = whitebox_workflows.WbEnvironment()

# def my_progress_handler(json_event):
#     try:
#         data = json.loads(json_event)
#         print(f"Progres: {data.get('progress', 0)}% - {data.get('message', 'Memproses...')}")
#     except:
#         pass

# # Konfigurasi Path Berkas
# # Pastikan demutm_clean.tif (hasil ekspor TIFF polos Anda) sudah ada di folder tersebut
# input_tif = r"D:\test_dem\demutm\dem_utm.tif" 
# output_gpkg = r"D:\test_dem\output_test\dem_filled_from_wbw.gpkg"

# # Pastikan folder output tersedia
# os.makedirs(os.path.dirname(output_gpkg), exist_ok=True)

# # -------------------------------------------------------------------------
# # LANGKAH 1: PROSES & TULIS KE FORMAT .GPKG VIA WHITEBOX
# # -------------------------------------------------------------------------
# print("=== LANGKAH 1: Mengoperasikan Tool & Menulis ke format .gpkg ===")
# try:
#     wbe.hydrology.depressions_storage.fill_pits(
#         dem=input_tif,
#         output=output_gpkg,
#         callback=my_progress_handler
#     )
#     print(f"✔ Sukses membuat berkas GeoPackage: {output_gpkg}\n")
# except Exception as e:
#     print(f"❌ Gagal saat proses penulisan ke .gpkg: {e}\n")

# # -------------------------------------------------------------------------
# # LANGKAH 2: BACA KEMBALI BERKAS .GPKG BUATAN WHITEBOX
# # -------------------------------------------------------------------------
# print("=== LANGKAH 2: Membaca Kembali Berkas .gpkg Buatan Whitebox ===")
# try:
#     if os.path.exists(output_gpkg):
#         # Membaca berkas .gpkg yang baru saja dibuat oleh Whitebox sendiri
#         raster = wbe.read_raster(output_gpkg)
#         meta = raster.metadata()
        
#         print("\n" + "="*40)
#         print("HASIL METADATA DARI READ .GPKG:")
#         print(f"Dimensi     : {meta.rows} x {meta.columns}")
#         print(f"Nilai Min   : {meta.minimum}")
#         print(f"Nilai Max   : {meta.maximum}")
#         print(f"NoData Value: {meta.nodata}")
#         print("="*40)
#     else:
#         print("⚠ File .gpkg tidak ditemukan di disk!")
# except Exception as e:
#     print(f"❌ Gagal saat membaca kembali berkas .gpkg: {e}")



# import whitebox_workflows
# import json
# import os

# # 1. Inisialisasi Environment Whitebox
# wbe = whitebox_workflows.WbEnvironment()

# def my_progress_handler(json_event):
#     try:
#         data = json.loads(json_event)
#         print(f"Progres: {data.get('progress', 0)}% - {data.get('message', 'Memproses...')}")
#     except:
#         pass

# # Konfigurasi Path Berkas
# # Input menggunakan GPKG buatan Whitebox yang datanya utuh (1393 x 2176)
# input_gpkg = r"D:\test_dem\output_test\dem_filled_from_wbw.gpkg"
# # Output dipaksa menjadi .tif agar kompatibel dengan QGIS/SWAT+ Editor GUI
# output_tif = r"D:\test_dem\output_test\final_hydrology_filled.tif"

# # Pastikan folder output ada
# os.makedirs(os.path.dirname(output_tif), exist_ok=True)

# if os.path.exists(input_gpkg):
#     print("=== MEMULAI ANALISIS HIDROLOGI ===")
#     print(f"Input  (GPKG Internal) : {input_gpkg}")
#     print(f"Output (Standard TIFF) : {output_tif}\n")
    
#     try:
#         # Jalankan tool hidrologi (contoh: fill_pits)
#         wbe.hydrology.depressions_storage.fill_pits(
#             dem=input_gpkg,
#             output=output_tif,
#             callback=my_progress_handler
#         )
#         print(f"\n✔ Analisis Sukses! File TIFF berhasil dibuat.")
#         print("Silakan muat file 'final_hydrology_filled.tif' ke QGIS Anda sekarang.")
        
#     except Exception as e:
#         print(f"❌ Gagal mengeksekusi tool hidrologi: {e}")
# else:
#     print(f"⚠ Berkas input GPKG tidak ditemukan: {input_gpkg}")


# import whitebox_workflows
# wbe = whitebox_workflows.WbEnvironment()

# # Ambil semua tool tanpa memfilter
# all_tools = wbe.list_tools_detailed(include_locked=True)

# # Tampilkan 10 tool pertama untuk melihat format datanya
# print(f"Total tool ditemukan: {len(all_tools)}")
# for tool in all_tools[:10]:
#     print(f"ID: {tool['id']} | PRO: {tool['is_pro']}")

import whitebox_workflows

wbe = whitebox_workflows.WbEnvironment()

input_dem = r"D:\test_dem\output_test\dem_filled_from_wbw.gpkg"
output_ratio = r"D:\test_dem\output_test\surface_area_ratio.tif"

# 1. Baca Raster
dem_obj = wbe.read_raster(input_dem)

# 2. Jalankan tool (Menggunakan objek Raster langsung)
wbe.surface_area_ratio(input=dem_obj, output_path=output_ratio)

# 3. AMBIL METADATA DENGAN ATRIBUT YANG TEPAT
meta = dem_obj.metadata()
x_res = meta.resolution_x  # <--- Ini nama atribut yang benar di versi Anda
y_res = meta.resolution_y  # <--- Ini nama atribut yang benar di versi Anda
rows = meta.rows
cols = meta.columns

# Luas satu piksel (Planimetrik) dalam m^2
luas_planimetrik_per_pixel = x_res * y_res

# 4. Hitung Total Luas
ratio_obj = wbe.read_raster(output_ratio)

total_luas_planimetrik = 0
total_luas_nyata = 0

for r in range(rows):
    for c in range(cols):
        ratio_val = ratio_obj.get_value(r, c)
        if ratio_val > 0: # Pastikan bukan NoData
            total_luas_planimetrik += luas_planimetrik_per_pixel
            total_luas_nyata += (luas_planimetrik_per_pixel * ratio_val)

print(f"=== Analisis Luas Lahan (Hasil Whitebox) ===")
print(f"Resolusi Piksel : {x_res}m x {y_res}m")
print(f"Total Luas Planimetrik (2D) : {total_luas_planimetrik / 10000:.4f} Hektar")
print(f"Total Luas Nyata (3D)       : {total_luas_nyata / 10000:.4f} Hektar")
print(f"Selisih Luas (Tambahan)     : {(total_luas_nyata - total_luas_planimetrik) / 10000:.4f} Hektar")

# import whitebox_workflows
# wbe = whitebox_workflows.WbEnvironment()

# # Ini akan menampilkan semua fungsi yang tersedia di wbe Anda
# print([func for func in dir(wbe) if 'surface' in func.lower()])

# import whitebox_workflows

# wbe = whitebox_workflows.WbEnvironment()
# input_dem = r"D:\test_dem\output_test\dem_filled_from_wbw.gpkg"

# # Baca raster
# dem_obj = wbe.read_raster(input_dem)

# print("--- DEBUG: Atribut dem_obj ---")
# print(dir(dem_obj))

# print("\n--- DEBUG: Atribut dem_obj.metadata() ---")
# # Beberapa versi menggunakan .metadata(), beberapa menggunakan .configs
# try:
#     meta = dem_obj.metadata()
#     print(dir(meta))
#     print("\nNilai cell_size_x:", meta.cell_size_x)
# except Exception as e:
#     print("Metadata tidak ditemukan dengan .metadata():", e)

# try:
#     print("\nNilai dari configs:", dem_obj.configs)
# except Exception as e:
    # print("\n'configs' tidak ditemukan:", e)
    
    
    