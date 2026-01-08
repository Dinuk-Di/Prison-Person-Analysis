import { useState } from "react";
import { User, Calendar, Users } from "lucide-react";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";
import axiosInstanceNoToken from "../../services/axiosInstanceNoToken";
import toast from "react-hot-toast";
import logo from "../../assets/logo.jpeg";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (isNaN(formData.age) || parseInt(formData.age) < 1 || parseInt(formData.age) > 150) {
      newErrors.age = "Please enter a valid age";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
      };

      await axiosInstanceNoToken.post("http://127.0.0.1:5010/api/inmate/register", registrationData);

      toast.success("Registration successful! 🎉");
      navigate("/sign-in");
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img src={logo} alt="Logo" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Inmate Registration
          </h1>
          <p className="text-slate-600 font-medium">
            Register a new inmate
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200 hover:shadow-2xl transition-shadow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="text"
              label="Name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              icon={User}
              required
            />

            <Input
              type="number"
              label="Age"
              placeholder="Enter age"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              error={errors.age}
              icon={Calendar}
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Male
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Female
                  </span>
                </label>
              </div>
              {errors.gender && (
                <span className="text-sm text-red-500 mt-1">{errors.gender}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Register
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already registered?{" "}
              <a
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Prison Management System - Registration Portal
        </p>
      </div>
    </div>
  );
}

