import whitebox_workflows
import json

wbe = whitebox_workflows.WbEnvironment()

def progress_callback(data):
    if isinstance(data, str):
        try:
            d = json.loads(data)
            if 'percent' in d:
                print(f"Progress Engine: {d['percent']*100:.1f}%", end="\r")
        except:
            pass
    elif isinstance(data, (int, float)):
        print(f"Progress Engine: {data:.1f}%", end="\r")

# 1. Input Data
input_dem = r"D:\test_dem\demutm\demnas_raw.tif"

print("Membaca file DEMNAS...")
dem_obj = wbe.read_raster(input_dem)

dem_bersih = wbe.smooth_vegetation_residual(input=dem_obj, max_scale=30, dev_threshold=1.0, scale_threshold=5, output_path=r"D:\test_dem\output_test\dem_bare_earth.tif")

meta = dem_bersih.metadata()
luas_planimetrik_per_pixel = meta.resolution_x * meta.resolution_y

# 2. Proses Geomorphometry
print("Memulai perhitungan Surface Area Ratio...")
ratio_obj = wbe.surface_area_ratio(input=dem_bersih, callback=progress_callback) 

print("\nMenghitung Slope untuk masking...")
slope_obj = wbe.slope(input=dem_bersih, units='degrees')

# 3. Masking dengan Aljabar Raster 
print("Menerapkan filter area perbukitan (Aljabar Raster)...")

raster_batas_elevasi = (dem_bersih * 0.0) - 5.0
raster_batas_slope = (slope_obj * 0.0) + 10.0

mask_elev = wbe.raster.greater_than(input1=dem_bersih, input2=raster_batas_elevasi)
mask_slope = wbe.raster.greater_than(input1=slope_obj, input2=raster_batas_slope)
mask = wbe.raster.overlay_math.bool_and(input1=mask_elev, input2=mask_slope)

# 4. Hitung Luas (Menggunakan trik Mean)
print("Mengkalkulasi statistik luas 3D...")
ratio_masked = wbe.raster.overlay_math.multiply(input1=ratio_obj, input2=mask)

# Trik Matematika: Sum = Mean * Total Piksel
total_pixels = meta.rows * meta.columns

# Kita gunakan calculate_mean() yang tersedia
total_sum_ratio = ratio_masked.calculate_mean() * total_pixels
count_pixels = mask.calculate_mean() * total_pixels

# 5. Kalkulasi Akhir
total_luas_2d = count_pixels * luas_planimetrik_per_pixel
total_luas_3d = total_sum_ratio * luas_planimetrik_per_pixel

print(f"\n" + "="*45)
print(f"=== HASIL ANALISIS LUAS PERBUKITAN (CEPAT) ===")
print(f"="*45)
print(f"Total Luas 2D : {total_luas_2d / 10000:,.4f} Hektar")
print(f"Total Luas 3D : {total_luas_3d / 10000:,.4f} Hektar")

if total_luas_2d > 0:
    print(f"Persentase Kenaikan Luas: {((total_luas_3d / total_luas_2d) - 1) * 100:.2f}%")
else:
    print("Persentase Kenaikan: 0% (Area kosong)")
print(f"="*45)