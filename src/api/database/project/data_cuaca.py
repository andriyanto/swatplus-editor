from database.project.base import BaseModel
from peewee import CharField, FloatField, DateField, ForeignKeyField

class StationLocations(BaseModel):
    station_name = CharField(unique=True, index=True)
    lat = FloatField()
    long = FloatField()
    elev = FloatField()
    

class WeatherDailyData(BaseModel):
    station = ForeignKeyField(StationLocations, backref='daily_data', index=True)
    date = DateField(index=True)
    pcp = FloatField(null=True)
    tmp_max = FloatField(null=True)
    tmp_min = FloatField(null=True)
    slr = FloatField(null=True)
    wnd = FloatField(null=True)
    hmd = FloatField(null=True)
    pet = FloatField(null=True)
    
   

    class Meta:
        # Menjamin tidak ada duplikat data untuk stasiun dan tanggal yang sama
        indexes = (
            (('station', 'date'), True),
        )