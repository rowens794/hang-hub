"use client";

import { useState, useEffect, useRef } from "react";
import { updateProfileImage } from "@/lib/actions.auth";
import Image from "next/image";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Me",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Buster",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Sparky",
];

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string>(PRESET_AVATARS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedImage = localStorage.getItem("userProfileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const saveImage = async (image: string) => {
    setProfileImage(image);
    await updateProfileImage(image);
    // Dispatch a custom event so other components (like header) know to update
    window.dispatchEvent(new Event("profileImageUpdated"));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        saveImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-10">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black mb-2">Your Profile</h1>
        <p className="text-slate-500 font-medium">
          Customize how you look to the squad.
        </p>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col items-center gap-8">
          {/* Main Avatar Display */}
          <div className="relative group">
            <div className="h-40 w-40 rounded-[2.5rem] border-4 border-electric-purple overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-xl shadow-electric-purple/20 transition-transform group-hover:scale-[1.02]">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleUploadClick}
              className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-electric-purple text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
              title="Upload custom image"
            >
              📷
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="w-full space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
                Preset Avatars
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {PRESET_AVATARS.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => saveImage(avatar)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                      profileImage === avatar
                        ? "border-electric-purple ring-4 ring-electric-purple/10"
                        : "border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Preset ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={handleUploadClick}
                className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 py-4 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Upload Custom Image
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 p-6 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
        <p className="text-amber-700 dark:text-amber-400 text-sm font-bold flex gap-2">
          <span>💡</span>
          Your profile image is now saved to the HangHub database!
        </p>
      </section>
    </div>
  );
}
