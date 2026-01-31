/**
 * Maintenance Page - Displayed when maintenance mode is active
 */

import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Wrench, Clock } from 'lucide-react';

export default function Maintenance() {
  const { settings } = useAdminSettings();
  const { maintenanceMode } = settings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1E35] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Wrench className="w-12 h-12 text-amber-400" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          {maintenanceMode.title}
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          {maintenanceMode.message}
        </p>

        {/* Estimated End Time */}
        {maintenanceMode.estimatedEnd && (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">
              Expected to be back: {new Date(maintenanceMode.estimatedEnd).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-500">
          Thank you for your patience
        </p>
      </div>
    </div>
  );
}
