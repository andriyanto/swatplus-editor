class EngineManager:
    _instance = None

    def __new__(cls):
        # Singleton pattern agar manager hanya dibuat satu kali
        if cls._instance is None:
            cls._instance = super(EngineManager, cls).__new__(cls)
            cls._instance.engine_type = None
            cls._instance.active_engine = None
        return cls._instance

    def set_engine(self, engine_type="wbw"):
        self.engine_type = engine_type.lower()
        
        if self.engine_type == "wbw":
            import whitebox_workflows
            self.active_engine = whitebox_workflows.WbEnvironment()
            print("[Manager] Whitebox_next_gen Workflows diaktifkan.")
            
        elif self.engine_type == "taudem":
            # TauDEM umumnya berbasis CLI, jadi kita cukup set string/path executablenya
            self.active_engine = "taudem_cli" 
            print("[Manager] TauDEM CLI diaktifkan.")
            
        else:
            raise ValueError(f"Engine '{engine_type}' tidak dikenali!")

    def get_engine(self):
        if self.active_engine is None:
            self.set_engine("wbw") # Default ke wbw jika belum diset
        return self.active_engine