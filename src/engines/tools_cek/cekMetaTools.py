import whitebox_workflows
# import json
# import re

# wbe = whitebox_workflows.WbEnvironment()
# input_raster = wbe.read_raster(r"D:\test_dem\demutm\demnas_raw.tif")

# # 1. Jalankan tool-nya
# hist_json_str = wbe.raster.raster_histogram(input=input_raster, bins=256)

# # # 2. Teknik "Intip" tanpa menebak
# # # Kita cetak tipe data dan isi mentahnya dulu
# # print(f"Tipe data: {type(hist_json_str)}")
# # print(f"Isi mentah: {hist_json_str}")

# # # 3. Baru setelah tahu isinya, kita load sebagai dictionary
# # try:
# #     if isinstance(hist_json_str, str):
# #         data = json.loads(hist_json_str)
# #         # Sekarang Anda bisa print keys() untuk tahu parameter meta apa saja yang ada
# #         print(f"Kunci parameter yang tersedia: {list(data.keys())}")
# #     else:
# #         print("Ternyata bukan string, mungkin objek! Cek dir(hist_json_str)")
# # except Exception as e:
# #     print(f"Gagal parse: {e}")

# raw_str = str(hist_json_str)

# # Kita gunakan Regular Expression untuk mengambil teks di antara tanda petik tunggal '...'
# match = re.search(r"'(.*)'", raw_str)

# if match:
#     json_text = match.group(1)
#     # Sekarang kita parse teks tersebut menjadi dictionary Python
#     data = json.loads(json_text)
    
#     print("\n=== DATA HISTOGRAM TEREXTRAKSI ===")
#     print(f"Jumlah Bins : {data['bins']}")
#     print(f"Lebar Bin   : {data['bin_width']:.2f}")
#     print(f"Data counts (5 pertama) : {data['counts'][:5]}")
# else:
#     print("Gagal mengekstrak JSON dari objek.")


import json
import re

def parse_wb_json(wb_output):
    # Ubah ke string
    raw_str = str(wb_output)
    
    # Cari posisi { pertama dan } terakhir
    start = raw_str.find('{')
    end = raw_str.rfind('}') + 1
    
    if start != -1 and end != -1:
        json_text = raw_str[start:end]
        # Bersihkan karakter newline atau tab jika ada
        json_text = json_text.replace('\n', '').replace('\r', '').replace('\\', '')
        return json.loads(json_text)
    else:
        print(f"DEBUG: Tidak ditemukan JSON dalam string: {raw_str}")
        return None


wbe = whitebox_workflows.WbEnvironment()
input_raster = wbe.read_raster(r"D:\test_dem\demutm\demnas_raw.tif")
# --- Cara Penggunaannya ---
# 1. Jalankan tool-nya
hasil_mentah = wbe.raster.raster_histogram(input=input_raster, bins=256)

# 2. Ekstraksi menjadi dictionary Python
data_histogram = parse_wb_json(hasil_mentah)

if data_histogram:
    print(f"Data Berhasil Di-load!")
    print(f"Jumlah Bins: {data_histogram['bins']}")
    print(f"Lebar per Bin: {data_histogram['bin_width']:.4f}")
    # Anda sekarang bisa mengakses 'counts' sebagai list biasa
    for i, jumlah_piksel in enumerate(data_histogram['counts']):
        print(f"Bin ke-{i+1}: {jumlah_piksel} piksel")