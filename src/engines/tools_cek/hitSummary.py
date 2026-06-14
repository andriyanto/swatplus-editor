# import whitebox_workflows

# wbe = whitebox_workflows.WbEnvironment()

# input_dem = r"D:\test_dem\demutm\demnas_raw.tif"
# dem_obj = wbe.read_raster(input_dem)

# print("=== DAFTAR ATRIBUT & METODE OBJEK RASTER ===")
# # dir() akan mencetak semua daftar properti dan fungsi yang ada di dalam objek Raster
# daftar_atribut = dir(dem_obj)

# # Kita saring hanya fungsi/properti publik (tidak diawali dengan '__')
# atribut_publik = [attr for attr in daftar_atribut if not attr.startswith('__')]

# for attr in atribut_publik:
#     print(attr)
# print("============================================")


import whitebox_workflows

wbe = whitebox_workflows.WbEnvironment()

input_dem = r"D:\test_dem\demutm\demnas_raw.tif"
dem_obj = wbe.read_raster(input_dem)

# Gunakan metode yang sudah terbukti ada di daftar dir() Anda
# 1. Update metadata agar min/max terbaru terbaca
dem_obj.update_min_max()
meta = dem_obj.metadata()

# 2. Hitung statistik mean dan stdev secara bersamaan
mean_val, std_dev = dem_obj.calculate_mean_and_stdev()

print("\n=== LAPORAN STATISTIK RASTER (TERVERIFIKASI) ===")
print(f"Minimum         : {meta.minimum:.4f}")
print(f"Maximum         : {meta.maximum:.4f}")
print(f"Mean            : {mean_val:.4f}")
print(f"Std. Deviation  : {std_dev:.4f}")
print(f"Jumlah Piksel   : {dem_obj.num_cells()}")
print("================================================")