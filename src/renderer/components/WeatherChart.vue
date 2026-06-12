<template>
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 170px;">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="d-flex flex-column justify-center align-center text-grey-darken-1" style="height: 170px; background-color: #f9f9f9; border-radius: 4px;">
        <v-icon size="large" class="mb-2">fas fa-folder-open</v-icon>
        <span class="text-body-2">Data tidak tersedia</span>
    </div>
    
    <div v-else-if="chartOptions" style="width: 100%; height: 170px;">
        <highcharts :options="chartOptions"></highcharts>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';

/**
 * Definisi Props dengan nilai default.
 * Komponen ini dirancang secara "Polymorphic" (bisa menangani single-series maupun multi-series).
 * Properti seperti field, label, dan color menggunakan union type (string | string[]) 
 * agar komponen parent bisa mengirim 1 string atau array of strings.
 */
const props = withDefaults(defineProps<{ 
    data: any[],    
    field: string | string[],  
    label: string | string[],
    color: string | string[],
    chartTitle: string,    
    unit: string,
    loading?: boolean      
}>(), {
    // Memberikan nilai default untuk mencegah error undefined jika parent tidak mengirimnya
    data: () => [],
    label: () => [],
    color: () => ['#2196F3'], // Default menggunakan warna biru standar Material
    loading: false
});

// Mengambil instance tema Vuetify untuk sinkronisasi warna grafik dengan Light/Dark mode
const theme = useTheme();

/**
 * chartOptions: Computed property yang bertugas merakit konfigurasi lengkap Highcharts.
 * Fungsi ini akan otomatis dijalankan ulang (re-computed) setiap kali props.data atau tema berubah.
 */
const chartOptions = computed(() => {
    // 1. Guard Clause: Jika data kosong, kembalikan null agar template beralih ke State 2
    if (!props.data || props.data.length === 0) return null;

    // 2. Normalisasi Props: Memastikan field, label, dan color selalu berbentuk Array.
    // Ini menyederhanakan proses mapping pembuatan objek "series" di tahap akhir.
    const fields = Array.isArray(props.field) ? props.field : [props.field];
    const labels = Array.isArray(props.label) ? props.label : [props.label];
    const colors = Array.isArray(props.color) ? props.color : [props.color];

    // 3. Adaptasi Tema: Mendefinisikan variabel warna yang responsif terhadap mode aplikasi
    const isDark = theme.global.current.value.dark;
    const textColor = isDark ? '#FFFFFF' : '#333333';
    const bgColor = isDark ? '#333333' : '#FFFFFF';
    const gridColor = isDark ? '#444444' : '#f0f0f0';

    // 4. Mengembalikan Objek Konfigurasi Highcharts
    return {
        // Pengaturan dasar bentuk dan interaksi grafik
        chart: { 
            type: 'spline', // Menggunakan kurva melengkung (lebih elegan dibanding garis kaku 'line')
            backgroundColor: 'transparent', 
            height: 170,
            zoomType: 'x', // Mengizinkan user memblok/zoom area pada sumbu X
            panning: {
                enabled: true,
                type: 'x'
            },
            panKey: 'shift', // User dapat menekan Shift + Drag untuk menggeser grafik (panning)
            animation: {
                duration: 1000,
                easing: 'easeOutQuad'
            },
            style: { fontFamily: 'Inter, Roboto, sans-serif' } // Mengikuti font standar modern
        },
        
        // Judul utama yang diletakkan di sudut kiri atas grafik
        title: { 
            text: props.chartTitle,
            align: 'left',
            style: { display: 'none' }
        },
        
        // Menyembunyikan watermark logo Highcharts untuk tampilan enterprise yang bersih
        credits: { enabled: false },
        
        // Konfigurasi sumbu X (waktu/tanggal)
        xAxis: { 
            type: 'datetime',
            labels: { style: { color: textColor } },
            crosshair: { width: 1, color: '#999', dashStyle: 'Dash' } // Garis vertikal pembantu saat cursor hover
        },
        
        // Konfigurasi sumbu Y (nilai pengukuran)
        yAxis: { 
            title: { text: props.unit, style: { color: textColor } },
            labels: { style: { color: textColor } },
            crosshair: { width: 1, color: '#999', dashStyle: 'Dash' }, // Garis horizontal pembantu saat cursor hover
            gridLineColor: gridColor // Warna panduan latar belakang
        },
        
        // Konfigurasi Legenda grafik
        legend: {
            // Smart Legend: Aktif otomatis HANYA JIKA memuat lebih dari 1 garis data
            enabled: fields.length > 1,
            itemStyle: { color: textColor }
        },
        
        // Konfigurasi Tooltip (Kotak informasi melayang)
        tooltip: { 
            xDateFormat: '%e %b %Y', // Format tanggal: 13 Jun 2026
            shared: true, // Menyatukan data dari beberapa garis (X yang sama) ke dalam satu kotak tooltip
            backgroundColor: bgColor, 
            borderColor: textColor, 
            style: { color: textColor } 
        },
        
        // Optimasi rendering untuk volume data besar (Performance tuning)
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: true,
                    groupPixelWidth: 50, // Otomatis mengelompokkan data rata-rata jika tampilan terlalu padat
                    units: [ ['day', [1]], ['week', [1]], ['month', [1]] ]
                }
            }
        },
        
        // Perakitan data aktual yang akan digambar oleh grafik
        series: fields.map((f, i) => ({
            name: labels[i] || f, // Fallback: gunakan nama field jika developer lupa mengirimkan label
            color: colors[i] || colors[0], // Fallback: gunakan warna pertama jika tidak cukup warna yang dikirim
            type: 'areaspline', 
            fillOpacity: 0.1, // Memberikan efek bayangan sangat tipis di bawah garis (0.1 = 10% opacity)
            connectNulls: true, // Menghubungkan titik secara paksa meskipun ada hari tanpa data (null) di tengahnya
            
            // Transformasi struktur data list/object Vue menjadi array 2D yang dibaca Highcharts: [timestamp, value]
            data: props.data
                .filter(d => d.date) // Safety filter: Buang row yang tidak memiliki atribut date
                .map(d => [new Date(d.date).getTime(), d[f] ?? 0]) // ?? 0 memastikan data null diconvert ke 0 agar grafik tidak putus
        }))
    };
});
</script>