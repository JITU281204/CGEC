import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { VoiceRecord } from '../types';

Chart.register(...registerables);

interface AdminChartsProps {
  voices: VoiceRecord[];
}

export const AdminCharts: React.FC<AdminChartsProps> = ({ voices }) => {
  const deptCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const deptChartInstance = useRef<Chart | null>(null);
  const statusChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Departments
    const depts = ['CSE', 'ECE', 'ME', 'EE', 'Civil'];
    const deptCounts = depts.map(d => voices.filter(v => v.studentDetails.department === d).length);

    // Statuses
    const pending = voices.filter(v => v.metadata.status === 'Pending').length;
    const progress = voices.filter(v => v.metadata.status === 'In Progress').length;
    const resolved = voices.filter(v => v.metadata.status === 'Resolved').length;

    // Destroy existing
    if (deptChartInstance.current) {
      deptChartInstance.current.destroy();
    }
    if (statusChartInstance.current) {
      statusChartInstance.current.destroy();
    }

    // 1. Department Bar Chart
    if (deptCanvasRef.current) {
      const ctx = deptCanvasRef.current.getContext('2d');
      if (ctx) {
        deptChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: depts,
            datasets: [{
              label: 'Voice Submissions',
              data: deptCounts,
              backgroundColor: ['#06B6D4', '#6366F1', '#10B981', '#F59E0B', '#EC4899'],
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#94A3B8', font: { family: 'Inter' } }
              },
              y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#94A3B8', stepSize: 1, font: { family: 'Inter' } }
              }
            }
          }
        });
      }
    }

    // 2. Status Doughnut Chart
    if (statusCanvasRef.current) {
      const ctx = statusCanvasRef.current.getContext('2d');
      if (ctx) {
        statusChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Pending', 'In Progress', 'Resolved'],
            datasets: [{
              data: [pending, progress, resolved],
              backgroundColor: ['#F59E0B', '#6366F1', '#10B981'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#94A3B8', font: { size: 11, family: 'Inter' }, padding: 16 }
              }
            },
            cutout: '70%'
          }
        });
      }
    }

    return () => {
      if (deptChartInstance.current) deptChartInstance.current.destroy();
      if (statusChartInstance.current) statusChartInstance.current.destroy();
    };
  }, [voices]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Department Bar Chart */}
      <div className="lg:col-span-8 p-6 rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-md">
        <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Department-Wise Voice Distribution</span>
        </h4>
        <div className="h-64 relative">
          <canvas ref={deptCanvasRef}></canvas>
        </div>
      </div>

      {/* Status Doughnut Chart */}
      <div className="lg:col-span-4 p-6 rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-md">
        <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
          <span>Status Overview</span>
        </h4>
        <div className="h-64 relative flex items-center justify-center">
          <canvas ref={statusCanvasRef}></canvas>
        </div>
      </div>

    </div>
  );
};
