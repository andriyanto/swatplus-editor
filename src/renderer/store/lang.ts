import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { messages } from '@/locales'; 

export const useLangStore = defineStore('lang', () => {
    const savedLang = localStorage.getItem('user-lang');
    const lang = ref(savedLang || 'en');

    const t = computed(() => messages[lang.value as keyof typeof messages]);

    function setLanguage(newLang: string) {
        lang.value = newLang;
        localStorage.setItem('user-lang', newLang);
    }

    return { lang, t, setLanguage };
});