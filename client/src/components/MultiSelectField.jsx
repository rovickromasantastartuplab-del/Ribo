import React from 'react';
import { SimpleMultiSelect } from '@/components/SimpleMultiSelect';

export function MultiSelectField({ field, formData, handleChange }) {
    // Ensure selected value is always an array of strings
    const selectedValues = Array.isArray(formData[field.name])
        ? formData[field.name]
        : formData[field.name]
            ? [formData[field.name].toString()]
            : [];

    return (
        <SimpleMultiSelect
            options={field.options || []}
            selected={selectedValues}
            onChange={(selected) => handleChange(field.name, selected)}
            placeholder={field.placeholder || `Select ${field.label}`}
        />
    );
}
