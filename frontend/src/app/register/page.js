"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { userSchema } from "../../schemas/user.schema";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    department: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = userSchema.userRegistrationSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach(({ path, message }) => {
        fieldErrors[path[0]] = message;
      });
      setErrors(fieldErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Đăng ký thất bại");
      } else {
        toast.success("Đăng ký thành công!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối tới server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Đăng ký</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {[
            { label: "Họ tên", name: "fullName", type: "text" },
            { label: "Tên đăng nhập", name: "username", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Mật khẩu", name: "password", type: "password" },
            { label: "Phòng ban", name: "department", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700"
              >
                {label}
              </label>
              <input
                type={type}
                id={name}
                name={name}
                placeholder={`Nhập ${label.toLowerCase()}`}
                value={formData[name]}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors[name] && (
                <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
              )}
            </div>
          ))}

          {/* Vai trò */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Vai trò
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">-- Chọn vai trò --</option>
              <option value="USER">USER</option>
              <option value="GIANG_VIEN_RA_DE">GIẢNG VIÊN RA ĐỀ</option>
              <option value="THU_KY">THƯ KÝ</option>
              <option value="TRUONG_KHOA">TRƯỞNG KHOA</option>
              <option value="BAN_GIAM_HIEU">BAN GIÁM HIỆU</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
