import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function LoginForm({ onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function submit(e) {
    e.preventDefault();
    setIsLoading(true);
    
    // Mô phỏng delay của request
    setTimeout(() => {
      onLogin && onLogin({ identifier, password, remember });
      setIsLoading(false);
    }, 600);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Trường Email/Điện thoại */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email hoặc số điện thoại</label>
        <div className="relative">
          <FiMail className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 placeholder-gray-400"
            placeholder="nguyenvana@example.com"
            required
          />
        </div>
      </div>

      {/* Trường Mật khẩu */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 placeholder-gray-400"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>

      {/* Ghi nhớ đăng nhập & Quên mật khẩu */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-700 transition-colors">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 cursor-pointer"
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
          Quên mật khẩu?
        </a>
      </div>

      {/* Nút Đăng nhập */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          "Đăng nhập"
        )}
      </button>

      {/* Đăng nhập bằng mạng xã hội */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
        >
          <FcGoogle size={20} />
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
        >
          <FaFacebook size={20} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Facebook</span>
        </button>
      </div>
    </form>
  );
}
