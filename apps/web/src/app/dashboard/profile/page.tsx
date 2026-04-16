'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import { api } from '../../../lib/api';
import { User, MapPin, Clock, Save, CheckCircle } from 'lucide-react';

const SKILLS = [
  'Teaching', 'Medical', 'Engineering', 'Construction', 'Cooking', 'Driving',
  'Translation', 'Counseling', 'IT Support', 'Legal Aid', 'Childcare', 'Elder Care',
  'First Aid', 'Agriculture', 'Plumbing', 'Electrical', 'Photography',
  'Social Media', 'Fundraising', 'Event Management',
];

const REGIONS = [
  'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    skills: [] as string[],
    location: '',
    availability: 'weekends',
    bio: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/volunteers/me');
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setProfile(p);
          setForm({
            skills: p.skills || [],
            location: p.location || '',
            availability: p.availability || 'weekends',
            bio: p.bio || '',
          });
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchProfile();
  }, []);

  const toggleSkill = (skill: string) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await api.put('/volunteers/me', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Volunteer Profile</h1>
          <p className="text-slate-400 mt-1">Your profile helps us match you with the most impactful tasks.</p>
        </div>

        {/* Identity Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-400">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{user?.name}</h2>
            <p className="text-sm text-indigo-400">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span>{profile?.tasksCompleted || 0} tasks completed</span>
              <span>·</span>
              <span>{profile?.hoursLogged || 0} hours logged</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" /> About Me
          </h3>
          <textarea
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none h-24"
            placeholder="Tell NGOs about your motivation and experience..."
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {/* Location & Availability */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" /> Location & Availability
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">City / Region</label>
              <select
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              >
                <option value="">Select your city</option>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Availability
              </label>
              <select
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={form.availability}
                onChange={e => setForm({ ...form, availability: e.target.value })}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="weekends">Weekends only</option>
                <option value="evenings">Evenings only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <h3 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
            Skills
          </h3>
          <p className="text-xs text-slate-500 mb-4">Select all skills you can offer ({form.skills.length} selected)</p>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  form.skills.includes(skill)
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-60"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : saved ? (
            <><CheckCircle className="w-5 h-5" /> Profile Saved!</>
          ) : (
            <><Save className="w-5 h-5" /> Save Profile</>
          )}
        </button>
      </div>
    </DashboardLayout>
  );
}
