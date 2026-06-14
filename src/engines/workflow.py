from .manager import EngineManager
from .wbw import WbwEngine
from .taudem import TaudemEngine

class HydroWorkflow:
    def __init__(self, engine_choice="wbw"):
        # 1. Inisiasi Manager dan set engine
        self.manager = EngineManager()
        self.manager.set_engine(engine_choice)
        
        # 2. Binding (Menautkan) ke worker yang tepat
        if engine_choice.lower() == "wbw":
            self.worker = WbwEngine(self.manager.get_engine())
        elif engine_choice.lower() == "taudem":
            self.worker = TaudemEngine(self.manager.get_engine())

    def run_preprocessing(self, dem_path):
        """UI SWAT-X cukup memanggil fungsi ini, tanpa peduli enginenya apa"""
        print(f"=== Memulai Preprocessing ({self.manager.engine_type.upper()}) ===")
        hasil_raster, statistik = self.worker.preprocess_dem(dem_path)
        return hasil_raster, statistik