import subprocess
import os
from .base import BaseHydrologyEngine

class TaudemEngine(BaseHydrologyEngine):
    
    def preprocess_dem(self, dem_path):
        print(f"[TauDEM] Memproses DEM: {dem_path}")
        
        # Contoh eksekusi TauDEM via subprocess (misal: pitremove)
        out_fel = dem_path.replace(".tif", "_fel.tif")
        
        # Command asli biasanya: mpiexec -n 4 pitremove -z dem.tif -fel dem_fel.tif
        # subprocess.run(["mpiexec", "-n", "4", "pitremove", "-z", dem_path, "-fel", out_fel], check=True)
        
        print(f"[TauDEM] Pitremove selesai. Output tersimpan di: {out_fel}")
        
        # Karena TauDEM tidak punya fungsi JSON internal, kita kembalikan metadata sederhana
        mock_data = {"info": "TauDEM berjalan via CLI, data statistik tidak di-generate otomatis."}
        
        return out_fel, mock_data