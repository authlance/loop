import React from 'react'
import { FormLabel } from './form';

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => {
    const id = label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full space-y-2">
            <FormLabel className="block text-muted-foreground" htmlFor={id}>{label}</FormLabel>
            <input
                id={id}
                type="text"
                value={value}
                readOnly
                className="flex items-center w-full px-3 py-1 text-base transition-colors border rounded-md cursor-not-allowed h-9 bg-muted text-muted-foreground md:text-sm"
            />
        </div>
    );
}

export default ReadOnlyField;
