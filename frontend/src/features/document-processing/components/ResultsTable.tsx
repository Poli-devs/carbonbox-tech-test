'use client';

import React, { useState } from 'react';
import { ActivityData } from '../types/upload.types';
import { Search, Flame, Zap, Truck, Trash2, Droplets, Database } from 'lucide-react';

interface ResultsTableProps {
  data: ActivityData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = Array.from(new Set(data.map((item) => item.category)));

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm);

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('electric') || lower.includes('luz')) {
      return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (lower.includes('gas') || lower.includes('diesel') || lower.includes('gasoline')) {
      return <Flame className="w-3.5 h-3.5 text-orange-400" />;
    }
    if (lower.includes('transport')) {
      return <Truck className="w-3.5 h-3.5 text-sky-400" />;
    }
    if (lower.includes('waste') || lower.includes('recicl') || lower.includes('basura')) {
      return <Trash2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (lower.includes('water') || lower.includes('agua')) {
      return <Droplets className="w-3.5 h-3.5 text-teal-400" />;
    }
    return <Database className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por categoría, unidad o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            Todas ({data.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800 z-10">
              <tr>
                <th className="px-6 py-3.5 font-semibold">#</th>
                <th className="px-6 py-3.5 font-semibold">Categoría</th>
                <th className="px-6 py-3.5 font-semibold text-right">Cantidad Registrada</th>
                <th className="px-6 py-3.5 font-semibold">Unidad</th>
                <th className="px-6 py-3.5 font-semibold">Fecha de Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-white flex items-center gap-2">
                      <div className="p-1 rounded-md bg-slate-800">
                        {getCategoryIcon(row.category)}
                      </div>
                      <span>{row.category}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-semibold text-emerald-400">
                      {row.amount.toLocaleString('es-ES', { minimumFractionDigits: 1 })}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-300">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 border border-slate-700">
                        {row.unit}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-400 font-mono">
                      {row.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando {filteredData.length} de {data.length} filas procesadas
          </span>
          <span className="font-mono text-emerald-400/80">100% Ingesta validada</span>
        </div>
      </div>
    </div>
  );
};
