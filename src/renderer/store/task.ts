
import { defineStore } from 'pinia';
import { reactive } from 'vue';
export interface TaskOptions {
  proc_name: string;      
  script_name: string;    
  project?: any; 
  isGridTask?: boolean;  
  routePath?: string;       
  type?: string | null;     
}
export const useTaskStore = defineStore('task', () => {
  const task = reactive({
    progress: {
      percent: 0,
      message: null as string | null
    },
    process: null,
    error: null as string | null,
    running: false,
    currentProject: null as any,
    isGridTask: false,
    routePath: '',
    modelYear: -1 as number,
    currentPids: [] as number[],
    killMode: true as boolean,
    modelMessages: [] as string[],
    hasCorrectOutput: false as boolean,
    type: null 
  });

  let unsubscribeStdout: (() => void) | undefined;
  let unsubscribeClose: (() => void) | undefined;
  let unsubscribeStderr: (() => void) | undefined;

  // 1. RUN TASK (Untuk Python Script / SWAT+ API)
  function runTask(args: string[], options: TaskOptions, onComplete?: () => void) {
    task.error = null;
    task.running = true;
    task.progress = { percent: 0, message: 'Memulai proses...' };
    task.currentProject = options.project || null;
    task.routePath = options.routePath || '';
    task.isGridTask = options.isGridTask || false; 

    const api = (window as any).electronApi; 

    cleanupListenersOnly();

    const pid = api.spawnProcess(options.proc_name, options.script_name, args);

    if (!pid) {
        task.error = "Gagal menjalankan proses: Script tidak ditemukan.";
        task.running = false;
        return; 
    }

    task.currentPids.push(pid);

    unsubscribeStdout = api.processStdout(options.proc_name, (data: any) => {
      const rawData = typeof data === 'string' ? data : JSON.stringify(data);
      const lines = rawData.split('\n');

      lines.forEach((line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              try {
                  const parsed = JSON.parse(trimmed);
                  
                  const match = parsed.message.match(/\((\d+)\/(\d+)\)/);
                  if (match) {
                      const current = parseInt(match[1]);
                      const total = parseInt(match[2]);
                      parsed.percent = Math.round((current / total) * 100);
                  }

                  task.progress.percent = parsed.percent;
                  task.progress.message = parsed.message;
              } catch (e) {
                  console.error("Gagal parsing JSON stdout:", trimmed);
              }
          } else {
              task.progress.message = trimmed;
          }
      });
    });

    unsubscribeStderr = api.processStderr(options.proc_name, (data: any) => {
      task.error = data;
      task.running = false;
      task.currentPids = task.currentPids.filter(p => p !== pid);
      cleanupListeners(); 
    });

    unsubscribeClose = api.processClose(options.proc_name, () => {
        task.currentPids = task.currentPids.filter(p => p !== pid);
        task.type = null; 

        cleanupListenersOnly();

        if (onComplete) {
            onComplete();
        } else {
            task.running = false;
        }
    });
  }

function runSwatTask(inputDir: string, exeFile: string, options: any, onComplete?: () => void) {
    task.error = null;
    task.running = true;
    task.progress = { percent: 5, message: 'Menyiapkan simulasi SWAT+...' };
    task.routePath = options.routePath || '';
    task.currentProject = options.project || null;
    task.modelMessages = [];
    task.modelYear = -1;
    task.hasCorrectOutput = false;

    const api = (window as any).electronApi;

    cleanupListenersOnly();

    const pid = api.runSwat(inputDir, exeFile);
    
    if (pid) {
        task.currentPids.push(pid);
        
        unsubscribeStdout = api.processStdout('run-swat', (stdData: any) => {
            let str = stdData.toString().trim();
            let arr = str.split(' ').filter((el: any) => el !== '');
            let yrIdx = arr.indexOf('Yr');

            if (yrIdx > -1) {
                task.hasCorrectOutput = true;
                let thisYr = parseInt(arr[yrIdx + 1]);
                
                if (thisYr !== task.modelYear && !isNaN(thisYr)) {
                    let modelStr = '';
                    try {
                        // Pencegahan jitu agar batas loop tidak bernilai minus
                        let limit = Math.max(0, yrIdx - 3);
                        for (let i = 0; i < limit; i++) { 
                            if(arr[i]) modelStr += arr[i] + ' '; 
                        }
                    } catch (e) { modelStr = 'model'; }

                    const timeState = options.project?.time || { yrc_end: 1985, yrc_start: 1980 };
                    let totalYears = (options.timeEnd || timeState.yrc_end) - (options.timeStart || timeState.yrc_start) + 1;
                    if (totalYears <= 0) totalYears = 1;

                    let yrProg = (options.timeStart || timeState.yrc_start) + thisYr - 1;
                    task.modelYear = thisYr;
                    
                    task.progress.percent = Math.round((thisYr / totalYears) * 100);
                    task.progress.message = `Mengeksekusi ${modelStr.trim() || 'SWAT+'} tahun ${yrProg} (${thisYr} dari ${totalYears})`;
                }
            } else {
                if (!task.hasCorrectOutput) {
                    task.progress.message = str.length > 50 ? str.substring(0, 50) + '...' : str;
                }
            }
        });

        unsubscribeStderr = api.processStderr('run-swat', (data: any) => {
            task.error = 'Terjadi kesalahan saat menjalankan model SWAT+';
            task.modelMessages.push(data);
            task.running = false;
            task.currentPids = task.currentPids.filter(p => p !== pid);
            cleanupListeners();
        });

        unsubscribeClose = api.processClose('run-swat', () => {
            task.currentPids = task.currentPids.filter(p => p !== pid);
            cleanupListenersOnly();

            if (!task.hasCorrectOutput && !task.error) {
                task.error = 'Simulasi SWAT+ tidak mengeluarkan output console yang benar.';
                task.running = false;
                return;
            }

            if (onComplete) {
                onComplete();
            } else {
                task.running = false;
            }
        });
    } else {
        task.error = "Gagal memulai proses biner SWAT+.";
        task.running = false;
    }
  }


function cleanupListenersOnly() {
    if (unsubscribeStdout) { unsubscribeStdout(); unsubscribeStdout = undefined; }
    if (unsubscribeStderr) { unsubscribeStderr(); unsubscribeStderr = undefined; }
    if (unsubscribeClose) { unsubscribeClose(); unsubscribeClose = undefined; }
  }

  function cleanupListeners() {
    cleanupListenersOnly();
    task.running = false;
    task.currentPids = [];
  }

  function cancelTask() {
    const electron = (window as any).electronApi;
    task.currentPids.forEach((pid) => {
        electron.killProcess(pid);
    });

    task.currentPids = [];
    task.running = false;
    task.killMode = true; 
    task.error = null;
    cleanupListeners();
  }

  return { task, runTask, runSwatTask, cancelTask, cleanupListeners };
});