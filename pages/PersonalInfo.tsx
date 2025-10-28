import React, { useState, useRef } from 'react';
import { User } from '../types';
import Card from '../components/Card';
import { BTN_PRIMARY_STYLE, INPUT_BASE_STYLE } from '../constants';

interface PersonalInfoProps {
  user: User;
  setUser: (user: User) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ user, setUser }) => {
  const [formData, setFormData] = useState<User>(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(formData);
    // Here you would typically show a success message
    alert('Profile updated successfully!');
  };

  const labelStyle = "block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Personal Info</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Update your profile information and preferences.</p>
      </header>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className={labelStyle}>Profile Picture</label>
            <div className="flex items-center gap-6">
              <img 
                src={formData.profilePictureUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover cursor-pointer shadow-neu-raised-light dark:shadow-neu-raised-dark"
                onClick={handlePictureClick}
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden" 
                accept="image/*"
              />
              <button type="button" onClick={handlePictureClick} className={BTN_PRIMARY_STYLE}>
                Upload Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className={labelStyle}>First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={INPUT_BASE_STYLE}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelStyle}>Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={INPUT_BASE_STYLE}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelStyle}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={INPUT_BASE_STYLE}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className={BTN_PRIMARY_STYLE}>Save Changes</button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PersonalInfo;
