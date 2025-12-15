import { useEffect, useState } from 'react';
import apiClient, { accountAPI } from '../api/client';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({ bio: '', clear: false, file: null });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await accountAPI.getProfile();
        setProfile(res.data);
        setPreviewUrl(res.data.avatar_url || null);
        setForm(f => ({ ...f, bio: res.data.bio || '' }));
      } catch (e) {
        console.error('Error loading profile', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Resize image to max 400x400 before uploading
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height / width) * maxSize;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { type: file.type });
          setForm(f => ({ ...f, file: resizedFile, clear: false }));
          setPreviewUrl(URL.createObjectURL(blob));
        }, file.type, 0.9);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function onSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      const formData = new FormData();
      if (form.file && !form.clear) {
        formData.append('avatar', form.file);
      }
      formData.append('bio', form.bio || '');
      formData.append('clear', form.clear ? 'true' : 'false');
      
      await apiClient.put('/auth/profile/avatar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const res = await accountAPI.getProfile();
      setProfile(res.data);
      setPreviewUrl(res.data.avatar_url || null);
      setForm(f => ({ ...f, file: null, clear: false }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Profile save failed', e);
      alert('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-[#9B8B7E]">Loading profile...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold gold-text">Edit Profile</h1>
      </div>
      <form onSubmit={onSave} className="glass p-8 rounded-2xl space-y-8">
        <div className="flex items-start gap-6">
          <div className="avatar-profile flex-shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xl font-semibold text-[#E8E6E3]">@{profile?.username}</p>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-[#9B8B7E]">Avatar: Currently {profile?.avatar_url ? <a href={profile.avatar_url} className="text-[#D4AF37] hover:underline">avatar</a> : 'none'}</div>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={onFileChange} className="text-sm" />
                <label className="flex items-center gap-2 text-sm text-[#9B8B7E] cursor-pointer">
                  <input type="checkbox" checked={form.clear} onChange={(e) => setForm(f => ({ ...f, clear: e.target.checked, file: e.target.checked ? null : f.file }))} />
                  Clear
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#E8E6E3] mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-[#1A1612] border border-[#2E261D] text-[#E8E6E3] focus:outline-none focus:border-[#D4AF37]"
            placeholder="Write whatever you like about yourself!"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-xl bg-[#0F0D0A] border border-[#2E261D] p-6">
            <p className="text-sm text-[#9B8B7E]">Current Teams</p>
            <p className="text-3xl font-bold gold-text">{profile?.team_count ?? 0}</p>
          </div>
          <div className="rounded-xl bg-[#0F0D0A] border border-[#2E261D] p-6">
            <p className="text-sm text-[#9B8B7E]">Total Upvotes Given</p>
            <p className="text-3xl font-bold gold-text">{profile?.upvote_count ?? 0}</p>
          </div>
          <div className="rounded-xl bg-[#0F0D0A] border border-[#2E261D] p-6">
            <p className="text-sm text-[#9B8B7E]">Total Upvotes Received</p>
            <p className="text-3xl font-bold gold-text">{profile?.upvotes_received ?? 0}</p>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="w-full py-3 rounded-full btn-gold-muted font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saveSuccess && (
            <div className="mt-3 p-3 rounded-lg bg-green-900/20 border border-green-600 text-green-400 text-sm text-center">
              ✓ Profile saved successfully!
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
