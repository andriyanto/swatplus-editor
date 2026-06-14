from abc import ABC, abstractmethod

class BaseHydrologyEngine(ABC):
    def __init__(self, engine_instance):
        self.engine = engine_instance

    @abstractmethod
    def preprocess_dem(self, dem_path):
        """Wajib diimplementasikan oleh wbw.py dan taudem.py"""
        pass