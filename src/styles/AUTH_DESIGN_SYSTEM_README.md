# Authentication Pages Design System

This document provides comprehensive guidance for implementing the authentication pages (Login & Signup) using our standardized design system.

## 🎨 Design System Overview

Our authentication design system follows a modern, dark-mode aesthetic with high contrast for optimal readability and accessibility. It's built on an 8-point grid system and uses the Inter font family for consistent typography.

## 🌈 Color Palette

| Role | Color | HEX Code | Usage |
|------|-------|----------|-------|
| Background | Deep Navy | `#0D1117` | Main page background |
| UI Panel | Dark Charcoal | `#161B22` | "Frosted glass" card for forms |
| Accent Gradient | Purple to Blue | `#7928CA → #0070F3` | Primary buttons (CTAs) and selected states |
| Text Primary | Off-White | `#E6EDF3` | Headings and important text |
| Text Secondary | Light Grey | `#8B949E` | Helper text, descriptions, labels |
| Input Border | Medium Grey | `#30363D` | Default state for input fields |
| Input Focus | Bright Blue | `#58A6FF` | Border color when input is focused |
| Success | Green | `#238636` | Password strength, success messages |

## 🔤 Typography

| Element | Font Family | Font Weight | Font Size | Line Height | Usage |
|---------|-------------|-------------|-----------|-------------|-------|
| Heading 1 | Inter | Bold (700) | 28px | 36px | "Welcome back", "Create your account" |
| Heading 2 | Inter | SemiBold (600) | 24px | 32px | "Industry Collaboration Manager" |
| Body Large | Inter | Regular (400) | 16px | 24px | Input field text, primary button text |
| Body Small | Inter | Regular (400) | 14px | 20px | Descriptions, helper text, links |
| Label | Inter | Medium (500) | 14px | 20px | Input field labels ("Email", "Password") |

## 📏 Spacing & Layout

- **Grid System**: 8-point grid (8px, 16px, 24px, 32px, 40px)
- **Card Padding**: 40px on all sides
- **Form Element Margin**: 24px between input fields
- **Border Radius**: 16px for cards, 8px for buttons and inputs

## 🏗️ CSS Classes Reference

### Page Structure
```css
.auth-page                    /* Main container with grid layout */
.auth-brand-panel            /* Left side brand/logo panel */
.auth-form-panel             /* Right side form panel */
```

### Brand Panel Elements
```css
.auth-brand-content          /* Content wrapper for brand section */
.auth-logo-mark             /* Logo/brand mark (80x80px) */
.auth-brand-title           /* Main brand title (H1) */
.auth-brand-subtitle        /* Brand description text */
.auth-highlights            /* Feature highlights list */
.auth-highlights li         /* Individual highlight items */
```

### Form Elements
```css
.auth-form-card             /* Main form container with glass effect */
.auth-form-header           /* Form title and subtitle container */
.auth-form-title           /* Form heading (H1) */
.auth-form-subtitle        /* Form description text */
.auth-form                 /* Form element container */
```

### User Type Selection
```css
.auth-user-type-selector    /* Grid container for user type buttons */
.auth-type-btn             /* Individual user type button */
.auth-type-btn.active      /* Active/selected user type button */
```

### Form Fields
```css
.auth-field                /* Individual form field container */
.auth-label                /* Form field label */
.auth-input                /* Text input fields */
.auth-password-field       /* Password field container */
.auth-password-toggle      /* Show/hide password button */
```

### Password Strength
```css
.auth-password-strength    /* Password strength indicator container */
.auth-strength-bar         /* Strength bar background */
.auth-strength-fill        /* Strength bar fill (weak/medium/strong) */
.auth-strength-text        /* Strength description text */
```

### Buttons & Actions
```css
.auth-submit-btn           /* Primary submit button */
.auth-submit-btn:disabled  /* Disabled submit button state */
```

### Messages & States
```css
.auth-error                /* Error message container */
.auth-success-msg          /* Success message container */
.auth-loading              /* Loading state container */
.auth-spinner              /* Loading spinner animation */
```

## 🚀 Implementation Examples

### Basic Login Page Structure
```jsx
import './auth-design-system.css';

function LoginPage() {
  return (
    <div className="auth-page">
      {/* Left Side - Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo-mark">TT</div>
          <h1 className="auth-brand-title">TrustTeams</h1>
          <p className="auth-brand-subtitle">
            Industry Collaboration Platform
          </p>
          <ul className="auth-highlights">
            <li>Secure authentication</li>
            <li>Role-based access</li>
            <li>Real-time collaboration</li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">Sign in to your account</p>
          </div>

          <form className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input 
                type="email" 
                className="auth-input" 
                placeholder="Enter your email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-password-field">
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="Enter your password"
                />
                <button type="button" className="auth-password-toggle">
                  👁️
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### User Type Selector
```jsx
<div className="auth-user-type-selector">
  <button 
    className={`auth-type-btn ${userType === 'student' ? 'active' : ''}`}
    onClick={() => setUserType('student')}
  >
    Student
  </button>
  <button 
    className={`auth-type-btn ${userType === 'icm' ? 'active' : ''}`}
    onClick={() => setUserType('icm')}
  >
    ICM
  </button>
  <button 
    className={`auth-type-btn ${userType === 'academic' ? 'active' : ''}`}
    onClick={() => setUserType('academic')}
  >
    Academic
  </button>
</div>
```

### Password Strength Indicator
```jsx
<div className="auth-password-strength">
  <div className="auth-strength-bar">
    <div className={`auth-strength-fill ${strengthClass}`}></div>
  </div>
  <div className="auth-strength-text">
    {strengthText}
  </div>
</div>
```

### Error & Success Messages
```jsx
{error && (
  <div className="auth-error">
    {error}
  </div>
)}

{success && (
  <div className="auth-success-msg">
    {success}
  </div>
)}
```

### Loading States
```jsx
<button 
  className={`auth-submit-btn ${loading ? 'auth-loading' : ''}`}
  disabled={loading}
>
  {loading && <span className="auth-spinner"></span>}
  {loading ? 'Signing in...' : 'Sign In'}
</button>
```

## 📱 Responsive Behavior

The design system automatically adapts to different screen sizes:

- **Desktop (>1024px)**: Two-column layout (brand + form)
- **Tablet (768px-1024px)**: Single column, stacked layout
- **Mobile (<768px)**: Optimized spacing and single column layout

## ♿ Accessibility Features

- **High Contrast Mode**: Automatic adaptation for high contrast preferences
- **Reduced Motion**: Respects user's motion preferences
- **Focus Indicators**: Clear focus states for keyboard navigation
- **Semantic HTML**: Proper heading hierarchy and form labels
- **Color Independence**: Information not conveyed solely through color

## 🎯 Best Practices

1. **Always use the provided CSS classes** - Don't override with custom styles
2. **Maintain the 8-point grid** - Use spacing variables for consistency
3. **Follow the color palette** - Use CSS variables for all colors
4. **Implement proper form validation** - Show errors using `.auth-error` class
5. **Include loading states** - Use `.auth-loading` and `.auth-spinner` classes
6. **Test accessibility** - Ensure keyboard navigation and screen reader compatibility

## 🔧 Customization

While the design system provides comprehensive styling, you can customize:

- **Content**: Update text, logos, and highlights
- **Validation Logic**: Implement your own form validation
- **API Integration**: Connect forms to your backend services
- **Routing**: Handle navigation after successful authentication

## 📚 Related Files

- `auth-design-system.css` - Main design system stylesheet
- `LoginForm.jsx` - Example login form implementation
- `Signup.jsx` - Example signup form implementation

## 🆘 Troubleshooting

### Common Issues

1. **Fonts not loading**: Ensure Google Fonts is accessible
2. **Glass effect not working**: Check browser support for `backdrop-filter`
3. **Responsive issues**: Verify viewport meta tag is set correctly
4. **CSS conflicts**: Ensure this stylesheet loads after other CSS files

### Browser Support

- **Modern browsers**: Full support for all features
- **Older browsers**: Graceful degradation for advanced CSS features
- **Mobile browsers**: Optimized for touch interactions

---

For questions or issues with the design system, refer to the component examples or contact the development team.
