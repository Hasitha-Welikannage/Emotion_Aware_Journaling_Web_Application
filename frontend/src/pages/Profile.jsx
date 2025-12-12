import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth.js";
import { updateUser } from "../services/user.js";
import { FiEye, FiEyeOff, FiEdit } from "react-icons/fi";
import Button from "../components/Button.jsx";
import Header from "../components/Header.jsx";

// --- Constants ---
const PASSWORD_MIN_LENGTH = 8;
const INITIAL_USER_DATA = {
  id: null,
  first_name: "",
  last_name: "",
  email: "",
};

function Profile() {
  const navigate = useNavigate();

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', 'saving'
  const [isEditing, setIsEditing] = useState(false);

  // State to hold the original, clean data for reverting changes
  const [initialUserData, setInitialUserData] = useState(INITIAL_USER_DATA);

  // State for user data (editable fields)
  const [userData, setUserData] = useState(INITIAL_USER_DATA);

  // State for password changes (separate for clarity)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for the new password toggle feature
  const [showPassword, setShowPassword] = useState(false);

  // --- Data Fetching Effect (Load entry) ---
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await getCurrentUser();
        const fetchedUser = response.data;

        if (response.success && fetchedUser) {
          const data = {
            id: fetchedUser.id,
            first_name: fetchedUser.first_name || "",
            last_name: fetchedUser.last_name || "",
            email: fetchedUser.email || "",
          };
          // Store both current and initial data
          setUserData(data);
          setInitialUserData(data);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // --- Handlers ---

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus("saving");
    setError("");

    // 1. Password Validation Check (only if newPassword is being set)
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        setSaveStatus("error");
        return;
      }
      if (newPassword.length < PASSWORD_MIN_LENGTH) {
        setError(
          `New password must be at least ${PASSWORD_MIN_LENGTH} characters.`
        );
        setSaveStatus("error");
        return;
      }
      if (!currentPassword) {
        setError("You must enter your current password to set a new password.");
        setSaveStatus("error");
        return;
      }
    }

    // 2. Prepare Payload
    const updateData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      ...(newPassword && {
        current_password: currentPassword,
        new_password: newPassword,
      }),
    };

    console.log("Update Data:", updateData); // Debug log

    try {
      const response = await updateUser(initialUserData.id, updateData);

      if (response.success) {
        // Update both current and initial data to the new saved state
        const savedData = {
          id: response.data.id,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
        };
        setUserData(savedData);
        setInitialUserData(savedData);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setSaveStatus("success");
        setIsEditing(false);
      } else {
        setError(response.message || "Failed to update profile.");
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setError("An unexpected error occurred while updating the profile.");
      setSaveStatus("error");
    } finally {
      // Clear status after 3 seconds, but keep error visible in the field if mode is still 'edit'
      if (saveStatus !== "error") {
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // *** IMPROVEMENT: REVERT UNSAVED CHANGES ***
    setUserData(initialUserData);

    // Reset password fields and error/status messages
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSaveStatus(null);
  };

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // --- Helper Component: Renders a Profile Field (No change here needed) ---
  const renderField = (
    label,
    name,
    value,
    isEditable = true,
    type = "text"
  ) => (
    <div className={`flex flex-col items-stretch gap-1`}>
      <label className="block text-sm text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={handleInputChange}
        className={`block sm:text-sm rounded-md py-2 px-3 border border-gray-300 focus:ring-orange-500 focus:border-orange-500 focus:outline-none`}
        disabled={!isEditable}
      />
    </div>
  );

  // --- Helper Component: Renders Password Fields (IMPROVED with Toggle) ---
  const renderPasswordFields = () => (
    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:py-5">
      <label className="block text-sm font-medium text-gray-700 sm:mt-px">
        Change Password
      </label>
      <div className="mt-1 sm:mt-0 sm:col-span-2">
        <div className="space-y-4">
          {/* Current Password */}
          <input
            type="password"
            placeholder="Current Password (required to change)"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="max-w-lg block w-full sm:text-sm rounded-lg py-2 px-3 border border-gray-300 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
          />

          {/* New Password & Confirm Password (with toggle option) */}
          {[
            {
              state: newPassword,
              setState: setNewPassword,
              placeholder: `New Password (min ${PASSWORD_MIN_LENGTH} chars)`,
            },
            {
              state: confirmPassword,
              setState: setConfirmPassword,
              placeholder: "Confirm New Password",
            },
          ].map((field, index) => (
            <div key={index} className="relative max-w-lg">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={field.placeholder}
                value={field.state}
                onChange={(e) => field.setState(e.target.value)}
                className="block w-full sm:text-sm rounded-lg py-2 px-3 border border-gray-300 focus:ring-orange-500 focus:border-orange-500 focus:outline-none pr-10" // Added padding-right
              />
              {/* Password Toggle Button */}
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 px-2 flex justify-center items-center text-gray-400 hover:text-gray-600 border-l border-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye icon (Visible)
                  <FiEye />
                ) : (
                  // Eye slash icon (Hidden)
                  <FiEyeOff />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- Loading and Error States (Unchanged) ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Loading profile data...</p>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  // --- FINAL RENDER ---
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Header
          title="Your Profile"
          discription="Manage your personal information and
        account settings."
          callToActionText="Edit Profile"
          onClick={() => setIsEditing(true)}
          callToActionIcon={<FiEdit className="h-5 w-5" />}
          callToActionVisible={!isEditing}
        />
        {/* Status Message (Success/Error) */}
        {(saveStatus === "success" || (error && isEditing)) && (
          <div
            className={`p-4 mb-4 rounded-lg shadow-sm ${
              saveStatus === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <p className="font-medium">
              {saveStatus === "success"
                ? "Profile successfully updated!"
                : `Error: ${error}`}
            </p>
          </div>
        )}
        {/* Profile Form/Details Card */}
        <form
          onSubmit={handleSave}
          className="bg-white rounded-md shadow-sm border border-gray-200 p-6 space-y-2"
        >
          {/* User Data Fields */}
          {renderField(
            "First Name",
            "first_name",
            userData.first_name,
            isEditing
          )}
          {renderField("Last Name", "last_name", userData.last_name, isEditing)}
          {/* Email is not editable, so always false, but we use the last prop conditionaly based on mode */}
          {renderField("Email Address", "email", userData.email, false)}

          {/* Password Fields (Only in Edit Mode) */}
          {isEditing && renderPasswordFields()}

          {/* Action Buttons for Editing */}
          {isEditing && (
            <div className="pt-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-xl transition-colors"
                disabled={saveStatus === "saving"}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={saveStatus === "saving"}
              >
                {saveStatus === "saving" && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
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
