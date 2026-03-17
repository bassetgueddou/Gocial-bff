import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CreateActivityData } from '../types';

interface CreateActivityFormData extends Partial<CreateActivityData> {
    // Step 1: Category
    selectedCategory?: string;
    selectedActivityName?: string;
    // Step 2: Information
    location?: string;
    meetingPoint?: string;
    // Step 3: Restriction
    genderRestriction?: string;
    requireApproval?: boolean;
    // Step 4: Participants
    minAge?: number;
    maxAge?: number;
    minParticipants?: number;
    // Step 5: Title
    imageUri?: string;
}

interface CreateActivityContextType {
    formData: CreateActivityFormData;
    updateForm: (updates: Partial<CreateActivityFormData>) => void;
    resetForm: () => void;
}

const CreateActivityContext = createContext<CreateActivityContextType | undefined>(undefined);

export const CreateActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<CreateActivityFormData>({});

    const updateForm = useCallback((updates: Partial<CreateActivityFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({});
    }, []);

    const value = useMemo(() => ({ formData, updateForm, resetForm }), [formData, updateForm, resetForm]);

    return (
        <CreateActivityContext.Provider value={value}>
            {children}
        </CreateActivityContext.Provider>
    );
};

export const useCreateActivity = (): CreateActivityContextType => {
    const context = useContext(CreateActivityContext);
    if (!context) {
        throw new Error('useCreateActivity must be used within CreateActivityProvider');
    }
    return context;
};
