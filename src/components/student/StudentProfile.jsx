import React, { useState, useEffect } from 'react';
import './StudentProfile.css';

const StudentProfile = ({ student, onUpdate }) => {
  const [profile, setProfile] = useState(student || {});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setProfile(student || {});
  }, [student]);

  const handleSave = () => {
    onUpdate(profile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(student || {});
    setIsEditing(false);
  };

  return (
    <div className="student-profile">
      <div className="profile-header">
        <h3>Student Profile</h3>
        {!isEditing ? (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="btn btn-success" onClick={handleSave}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h4>Basic Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h4>Academic Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>University</label>
              <input
                type="text"
                value={profile.university || ''}
                onChange={(e) => setProfile({...profile, university: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Major</label>
              <input
                type="text"
                value={profile.major || ''}
                onChange={(e) => setProfile({...profile, major: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={profile.gpa || ''}
                onChange={(e) => setProfile({...profile, gpa: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Graduation Year</label>
              <input
                type="number"
                value={profile.graduationYear || ''}
                onChange={(e) => setProfile({...profile, graduationYear: e.target.value})}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h4>About</h4>
          <textarea
            value={profile.about || ''}
            onChange={(e) => setProfile({...profile, about: e.target.value})}
            disabled={!isEditing}
            className="form-textarea"
            placeholder="Tell us about yourself..."
            rows="4"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
