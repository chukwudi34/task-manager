import { useState, useEffect } from "react";
import ReusableInput from "../../common/ReusableInput";
import ReusableButton from "../../common/ReusableButton";
import ReusableSelect from "../../common/ReusableSelect";
import { apiHelpers } from "../../services/axiosInstance";

const AddTask = ({ onClose, onTaskAdded }) => {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState({
    full_name: "",
    email: "",
  });
  const [userErrors, setUserErrors] = useState({});
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Check for existing user in localStorage
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("taskUser"));
    if (savedUser && savedUser.data) {
      setUserInfo({
        full_name: savedUser.data.full_name,
        email: savedUser.data.email,
      });
      setUserId(savedUser.data.id);
      setStep(2);
    }
  }, []);

  // Handle user info change
  const handleUserChange = (field) => (e) => {
    setUserInfo({ ...userInfo, [field]: e.target.value });
    setUserErrors({ ...userErrors, [field]: undefined });
  };

  // Validate user info
  const validateUserInfo = () => {
    const newErrors = {};
    if (!userInfo.full_name) newErrors.full_name = "Full name is required";
    if (!userInfo.email) newErrors.email = "Email is required";
    if (userInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      newErrors.email = "Invalid email address";
    }
    return newErrors;
  };

  // Handle user info submit
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateUserInfo();
    if (Object.keys(validationErrors).length) {
      setUserErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      // Create user and get user_id from API
      const res = await apiHelpers.post("/user", {
        full_name: userInfo.full_name,
        email: userInfo.email,
      });

      setUserId(res.data.data.id);
      localStorage.setItem("taskUser", JSON.stringify(res.data));
      setStep(2);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setUserErrors(err.response.data.errors);
      } else {
        setUserErrors({ general: "Failed to save user. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle task form change
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  // Validate task form
  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.description) newErrors.description = "Description is required";
    if (!form.status) newErrors.status = "Status is required";
    return newErrors;
  };

  // Handle task form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await apiHelpers.post("/tasks", {
        name: form.name,
        description: form.description,
        status: form.status,
        user_id: userId, // Use user_id from previous API call
      });
      if (onTaskAdded) onTaskAdded();
      if (onClose) onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: "something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: User Info
  if (step === 1) {
    return (
      <form className="rounded-t-3xl" onSubmit={handleUserSubmit}>
        <div className="bg-white text-gray-800 p-4 rounded-2xl">
          <ReusableInput
            label="Full Name"
            value={userInfo.full_name}
            onChange={handleUserChange("full_name")}
            error={userErrors.full_name}
          />
          <ReusableInput
            label="Email"
            type="email"
            value={userInfo.email}
            onChange={handleUserChange("email")}
            error={userErrors.email}
          />
          {userErrors.general && (
            <div className="text-red-500 text-sm mb-2">
              {userErrors.general}
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Saving user...</p>
            </div>
          ) : (
            <ReusableButton
              className="mt-6 w-full"
              label="Continue"
              type="submit"
            />
          )}
        </div>
      </form>
    );
  }

  // Step 2: Task Form
  return (
    <form className="rounded-t-3xl" onSubmit={handleSubmit}>
      <div className="bg-white text-gray-800 p-4 rounded-2xl">
        <ReusableInput
          label="Name"
          value={form.name}
          onChange={handleChange("name")}
          error={errors.name}
        />

        <ReusableInput
          label="Description"
          value={form.description}
          onChange={handleChange("description")}
          error={errors.description}
        />

        <ReusableSelect
          label="Task Status"
          value={form.status}
          onChange={handleChange("status")}
          options={[
            { label: "Pending", value: "pending" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
          ]}
          error={errors.status}
        />

        {errors.general && (
          <div className="text-red-500 text-sm mb-2">{errors.general}</div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Saving task...</p>
          </div>
        ) : (
          <ReusableButton
            className="bg-purple-600 text-white px-4 py-2 rounded-full w-full text-center text-sm sm:text-base mt-2"
            label="Save Task"
            disabled={loading}
            type="submit"
          />
        )}
      </div>
    </form>
  );
};

export default AddTask;
