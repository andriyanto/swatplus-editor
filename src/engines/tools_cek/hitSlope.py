import whitebox_workflows

wbe = whitebox_workflows.WbEnvironment()

# Path file DEMNAS Anda
input_dem = r"D:\test_dem\demutm\demnas_raw.tif"

# 1. Baca Raster
dem_obj = wbe.read_raster(input_dem)

dem_obj.update_min_max()
print(f"Elevasi Minimum dalam data: {dem_obj.metadata().minimum}")
print(f"Elevasi Maksimum dalam data: {dem_obj.metadata().maximum}")
# 2. Hitung Slope
# Kita gunakan callback agar tahu progresnya
print("Menghitung Slope (derajat)...")
slope_raster = wbe.slope(input=dem_obj, units='degrees')

# 3. Dapatkan Statistik Slope
# Whitebox memiliki fungsi built-in untuk mendapatkan min/max/mean
stats = slope_raster.calculate_mean_and_stdev() 

# Karena calculate_mean_and_stdev mungkin tidak mencakup min/max, 
# kita gunakan fungsi update_min_max dulu jika perlu, 
# atau baca dari metadata setelah di-update
slope_raster.update_min_max()
meta = slope_raster.metadata()

print(f"\n=== Analisis Statistik Slope ===")
print(f"Rata-rata Slope  : {stats[0]:.2f} derajat")
print(f"Standar Deviasi  : {stats[1]:.2f} derajat")
print(f"Slope Maksimum   : {meta.maximum:.2f} derajat")
print(f"Slope Minimum    : {meta.minimum:.2f} derajat")

# --- Logika Validasi untuk Perbukitan ---
# Jika rata-rata slope di bawah 10 derajat untuk area 80% perbukitan,
# ini adalah indikasi kuat bahwa DEM Anda sudah mengalami smoothing (resampling)
if stats[0] < 10.0:
    print("\n[PERINGATAN]: Nilai slope rata-rata sangat rendah.")
    print("Saran: Periksa apakah DEM ini hasil resampling. Area perbukitan seharusnya memiliki mean slope > 15°.")
else:
    print("\n[INFO]: Distribusi slope terlihat normal untuk area perbukitan.")