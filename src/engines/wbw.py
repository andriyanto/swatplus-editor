import json
from .base import BaseHydrologyEngine

class WbwEngine(BaseHydrologyEngine):
    
    def _extract_wb_json(self, wb_output):
        """Utility khusus Whitebox untuk membersihkan output JSON"""
        raw_str = str(wb_output)
        start = raw_str.find('{')
        end = raw_str.rfind('}') + 1
        if start != -1 and end != -1:
            json_text = raw_str[start:end].replace('\n', '').replace('\r', '').replace('\\', '')
            return json.loads(json_text)
        return None

    def preprocess_dem(self, dem_path):
        print(f"[WbW] Membaca DEM: {dem_path}")
        dem = self.engine.read_raster(dem_path)
        
        # Contoh eksekusi spesifik WbW
        print("[WbW] Menjalankan breach_depressions_least_cost...")
        breached = self.engine.hydrology.depressions_storage.breach_depressions_least_cost(dem=dem)
        
        # Ekstrak histogram
        hist_raw = self.engine.raster.raster_histogram(input=breached, bins=256)
        hist_data = self._extract_wb_json(hist_raw)
        
        return breached, hist_data