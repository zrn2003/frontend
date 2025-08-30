import React, { useState, useEffect } from 'react';
import './StudentSkills.css';

const StudentSkills = ({ skills = [], onUpdate }) => {
  const [skillList, setSkillList] = useState(skills);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    setSkillList(skills);
  }, [skills]);

  const addSkill = () => {
    if (newSkill.trim() && !skillList.some(skill => skill.toLowerCase() === newSkill.trim().toLowerCase())) {
      const updatedSkills = [...skillList, newSkill.trim()];
      setSkillList(updatedSkills);
      onUpdate(updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = skillList.filter(skill => skill !== skillToRemove);
    setSkillList(updatedSkills);
    onUpdate(updatedSkills);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="student-skills">
      <div className="skills-header">
        <h3>Skills</h3>
        <div className="skills-input-section">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new skill..."
            className="skill-input"
          />
          <button onClick={addSkill} className="btn btn-primary add-skill-btn">
            Add
          </button>
        </div>
      </div>

      <div className="skills-list">
        {skillList.length === 0 ? (
          <p className="no-skills">No skills added yet. Start by adding your first skill!</p>
        ) : (
          skillList.map((skill, index) => (
            <div key={index} className="skill-chip">
              <span className="skill-name">{skill}</span>
              <button
                onClick={() => removeSkill(skill)}
                className="remove-skill-btn"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {skillList.length > 0 && (
        <div className="skills-stats">
          <p>Total Skills: {skillList.length}</p>
        </div>
      )}
    </div>
  );
};

export default StudentSkills;
