/**
 * CurationForm - Reusable form component for curation interfaces.
 *
 * Provides consistent styling and validation patterns.
 */
import { useState } from 'react';

/**
 * Reusable curation form wrapper with common styling.
 *
 * @param {Object} props
 * @param {string} props.title - Form title
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.submitting - Whether form is submitting
 * @param {string} props.submitText - Submit button text
 * @param {string} props.error - Error message to display
 * @param {React.ReactNode} props.children - Form fields
 */
function CurationForm({
  title,
  onSubmit,
  onCancel,
  submitting = false,
  submitText = 'Submit',
  error,
  children,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div style={styles.container}>
      {title && <h3 style={styles.title}>{title}</h3>}

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {children}

        <div style={styles.buttons}>
          <button
            type="submit"
            disabled={submitting}
            style={styles.submitButton}
          >
            {submitting ? 'Processing...' : submitText}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/**
 * Form field wrapper with label.
 */
export function FormField({
  label,
  required = false,
  hint,
  children,
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      <div style={styles.fieldContent}>
        {children}
        {hint && <span style={styles.hint}>{hint}</span>}
      </div>
    </div>
  );
}

/**
 * Text input field.
 */
export function TextField({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  width = '250px',
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      style={{ ...styles.input, width }}
    />
  );
}

/**
 * Select dropdown field.
 */
export function SelectField({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  required = false,
  disabled = false,
  width = '200px',
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      style={{ ...styles.select, width }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
  );
}

/**
 * Textarea field.
 */
export function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  disabled = false,
  width = '300px',
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      style={{ ...styles.textarea, width }}
    />
  );
}

/**
 * Checkbox group field.
 */
export function CheckboxGroup({
  options,
  selected,
  onChange,
  disabled = false,
}) {
  const handleChange = (value, checked) => {
    if (checked) {
      onChange([...selected, value]);
    } else {
      onChange(selected.filter((v) => v !== value));
    }
  };

  return (
    <div style={styles.checkboxGroup}>
      {options.map((opt) => {
        const value = opt.value || opt;
        const label = opt.label || opt;
        return (
          <label key={value} style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={(e) => handleChange(value, e.target.checked)}
              disabled={disabled}
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  title: {
    marginTop: 0,
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #ddd',
  },
  error: {
    padding: '0.5rem 1rem',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c00',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  label: {
    width: '120px',
    fontWeight: 'bold',
    paddingTop: '0.5rem',
    flexShrink: 0,
  },
  required: {
    color: '#c00',
    marginLeft: '0.25rem',
  },
  fieldContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  hint: {
    fontSize: '0.85rem',
    color: '#666',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  textarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    paddingTop: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
  },
  buttons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  submitButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  cancelButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default CurationForm;
