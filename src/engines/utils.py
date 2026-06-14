import os
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling

def ensure_utm_projection(input_raster, output_raster):
    """
    Memastikan raster dalam sistem koordinat proyeksi (UTM).
    Jika masih dalam sistem geografis (lat-long), lakukan reprojeksi otomatis.
    """
    # 1. Proteksi jika path input dan output sama
    if os.path.abspath(input_raster) == os.path.abspath(output_raster):
        # Jika sama, kita buat temporary file untuk proses reprojeksi
        temp_raster = output_raster + ".tmp.tif"
        ensure_utm_projection(input_raster, temp_raster)
        # Ganti nama temp menjadi output asli setelah selesai
        os.replace(temp_raster, output_raster)
        return output_raster

    with rasterio.open(input_raster) as src:
        # Jika sudah projected (is_projected=True), tidak perlu reprojeksi
        if src.crs and src.crs.is_projected:
            return input_raster
        
        # Hitung zona UTM
        bounds = src.bounds
        mid_x = (bounds.left + bounds.right) / 2
        utm_zone = int((mid_x + 180) / 6) + 1
        hemisphere = "north" if (bounds.bottom + bounds.top) / 2 > 0 else "south"
        
        dst_crs = f"+proj=utm +zone={utm_zone} +{hemisphere} +datum=WGS84"
        
        # Hitung transformasi
        transform, width, height = calculate_default_transform(
            src.crs, dst_crs, src.width, src.height, *src.bounds)
        
        kwargs = src.meta.copy()
        kwargs.update({
            'crs': dst_crs,
            'transform': transform,
            'width': width,
            'height': height
        })

        # Jalankan proses reprojeksi
        with rasterio.open(output_raster, 'w', **kwargs) as dst:
            for i in range(1, src.count + 1):
                reproject(
                    source=rasterio.band(src, i),
                    destination=rasterio.band(dst, i),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=dst_crs,
                    resampling=Resampling.bilinear)
                    
    print(f"Reprojeksi sukses: {output_raster}")
    return output_raster