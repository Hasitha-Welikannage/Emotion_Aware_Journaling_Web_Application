import React, { useState } from 'react';

// --- Mock User Data (Simulate data loaded from an API) ---
const initialUserData = {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.j@example.com',
    passwordDisplay: '********', // Placeholder for password field display
};

function Profile() { // Renamed from ProfileSettings to match your component name
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(initialUserData);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSave = (e) => {
        e.preventDefault();

        // 1. Password Validation Check
        if (newPassword && newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        setPasswordError('');

        // 2. Simulate API Update based on form values
        const updatedData = { ...userData };
        
        // Update name fields (Only Name is editable)
        updatedData.firstName = e.target.elements.firstName.value;
        updatedData.lastName = e.target.elements.lastName.value;

        // If password was changed, update the display placeholder
        if (newPassword) {
            updatedData.passwordDisplay = '********'; 
        }

        setUserData(updatedData);
        setNewPassword('');
        setConfirmPassword('');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
    };

    const handleChange = (e) => {
        // Only handles changes for the Name fields
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    // --- Helper Component: Renders a Profile Field ---
    const renderField = (label, name, value, isEditable = true, type = 'text') => (
        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5 border-b border-gray-100 pb-5">
            <label className="block text-sm font-medium text-gray-700 sm:mt-px">
                {label}
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
                {isEditing && isEditable ? (
                    <input
                        type={type}
                        name={name}
                        id={name}
                        value={value}
                        onChange={handleChange}
                        className={`max-w-lg block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border ${
                            isEditable ? 'border-orange-300 focus:ring-orange-500 focus:border-orange-500' : 'border-gray-200 bg-gray-50'
                        }`}
                        disabled={!isEditable}
                    />
                ) : (
                    <p className="max-w-lg block w-full sm:text-sm text-gray-900 py-2">
                        {value}
                    </p>
                )}
            </div>
        </div>
    );
    
    // --- Helper Component: Renders Password Fields ---
    const renderPasswordFields = () => (
        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5 pb-5">
            <label className="block text-sm font-medium text-gray-700 sm:mt-px">
                Password
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="New Password (min 8 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="max-w-lg block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border border-orange-300 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="max-w-lg block w-full shadow-sm sm:text-sm rounded-md py-2 px-3 border border-orange-300 focus:ring-orange-500 focus:border-orange-500"
                        />
                        {passwordError && (
                            <p className="text-sm text-red-600 mt-1">{passwordError}</p>
                        )}
                    </div>
                ) : (
                    <p className="max-w-lg block w-full sm:text-sm text-gray-900 py-2">
                        {userData.passwordDisplay}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-orange-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Profile Settings' : 'Your Profile'}
                    </h1>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-colors"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Profile Form/Details Card */}
                <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 space-y-6">

                    <div className="space-y-6">
                        {/* First Name (Editable) */}
                        {renderField('First Name', 'firstName', userData.firstName, true)}

                        {/* Last Name (Editable) */}
                        {renderField('Last Name', 'lastName', userData.lastName, true)}

                        {/* Email (Not Editable) */}
                        {renderField('Email Address', 'email', userData.email, false)}
                        
                        {/* Password (Editable via separate fields) */}
                        {renderPasswordFields()}
                    </div>

                    {/* Action Buttons for Editing */}
                    {isEditing && (
                        <div className="pt-5 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>

            </div>
        </div>
    );
}

export default Profile;