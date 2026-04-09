'use client';

import { Book, ShieldAlert, BadgeCheck, AlertTriangle, Scale } from 'lucide-react';

export default function Rules() {
  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Book size={24} style={{ color: 'var(--accent-secondary)' }} />
          আমাদের সমবায় - নিয়মাবলী
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          আমাদের সমবায় এর ফান্ড এবং লটারি পরিচালনার নিয়মাবলী
        </p>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="space-y-6">
          
          <div className="flex items-start gap-4 p-4 rounded-xl transition-all"
             style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'var(--gradient-primary)' }}>
              <Scale size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">নিয়ম ১: মাসিক সঞ্চয়</h3>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                প্রতি মাসে সর্বনিম্ন ৫০০ টাকা সঞ্চয় করা যাবে।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl transition-all"
               style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <BadgeCheck size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">নিয়ম ২: লটারি যোগ্যতা</h3>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                লটারিতে অংশ নিতে হলে ওই মাসে অবশ্যই ২০০০ টাকা জমা দিতে হবে।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl transition-all"
               style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">নিয়ম ৩: কিস্তি প্রদান</h3>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                লটারি বিজয়ী ব্যক্তি তার ঋণ (১০,০০০ টাকা) পরিশোধ না হওয়া পর্যন্ত প্রতি মাসে ২০০০ টাকা কিস্তি দিতে বাধ্য থাকবেন।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl transition-all"
               style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">নিয়ম ৪: পুনরায় লটারি</h3>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                ঋণী ব্যক্তি ঋণ পরিশোধ চলাকালীন লটারিতে পুনরায় অংশ নিতে পারবেন না।
              </p>
            </div>
          </div>

        </div>
        
        <div className="mt-8 text-center pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
           <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
             এই নিয়মগুলো অ্যাপ্লিকেশনে স্বয়ংক্রিয়ভাবে কার্যকর করা হয়েছে।
           </p>
        </div>
      </div>
    </div>
  );
}
