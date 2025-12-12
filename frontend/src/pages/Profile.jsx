import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth.js";
import { updateUser } from "../services/user.js";
import { FiEdit, FiLoader } from "react-icons/fi";
import PasswordField from "../components/PasswordField.jsx";
import InputField from "../components/InputField.jsx";
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

  // RenderField Component: Renders a Profile Field
  const RenderField = ({ label, field }) => (
    <div className={`flex flex-col items-stretch gap-1`}>
      <label className="block text-sm text-gray-600">{label}</label>
      {field}
    </div>
  );

  // Loading and Error States
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
          <RenderField
            label="First Name"
            field={
              <InputField
                type="text"
                name="first_name"
                value={userData.first_name}
                onChange={handleInputChange}
                isEditable={isEditing}
              />
            }
          />
          <RenderField
            label="Last Name"
            field={
              <InputField
                type="text"
                name="last_name"
                value={userData.last_name}
                onChange={handleInputChange}
                isEditable={isEditing}
              />
            }
          />
          <RenderField
            label="Email Address"
            field={
              <InputField
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                isEditable={false} // Email is not editable
              />
            }
          />

          {/* Password Fields (Only in Edit Mode) */}
          {isEditing && (
            <>
              <RenderField
                label="Current Password (Required to change)"
                field={
                  <PasswordField
                    name="current_password"
                    value={currentPassword}
                    placeholder="Current Password"
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                    }}
                    isEditable={isEditing}
                  />
                }
              />
              <RenderField
                label="New Password"
                field={
                  <PasswordField
                    name="new_password"
                    value={newPassword}
                    placeholder={`New Password (min ${PASSWORD_MIN_LENGTH} chars)`}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                    }}
                    isEditable={isEditing}
                  />
                }
              />
              <RenderField
                label="Confirm New Password"
                field={
                  <PasswordField
                    name="confirm_password"
                    value={confirmPassword}
                    placeholder="Confirm New Password"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                    isEditable={isEditing}
                  />
                }
              />
            </>
          )}

          {/* Action Buttons for Editing */}
          {isEditing && (
            <div className="pt-5 border-t border-gray-100 flex justify-end gap-3">
              <Button
                onClick={handleCancel}
                bgColor="bg-gray-200"
                textColor="text-gray-600"
                hoverBgColor="hover:bg-gray-300"
                disabled={saveStatus === "saving"}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveStatus === "saving"}>
                {saveStatus === "saving" ? (
                  <FiLoader className="animate-spin h-5 w-5 text-white" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Profile;
