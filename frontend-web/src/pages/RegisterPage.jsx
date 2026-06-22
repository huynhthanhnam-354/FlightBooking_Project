import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { CiPlane } from "react-icons/ci";
import { authApi } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (userData) => {
    setError("");
    setIsLoading(true);
    try {
      // Gửi yêu cầu đăng ký thực tế tới Backend
      await authApi.register({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone
      });
      
      alert("Đăng ký thành công! Chào mừng bạn đến với FlightBook.");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      // Hiển thị lỗi từ Backend (ví dụ: Email đã tồn tại)
      const message = err.response?.data?.message || "Đăng ký thất bại. Email có thể đã tồn tại hoặc dữ liệu không hợp lệ.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-700 flex items-center justify-center p-4">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-lg my-8">
        {/* Main Container */}
        <div className="backdrop-blur-md bg-white/95 rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-8 border border-white/20">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hover:rotate-12 transition-all duration-300 cursor-pointer group">
                <CiPlane size={36} className="text-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Tham gia FlightBooking</h1>
            <p className="text-sm text-slate-500">Khám phá thế giới cùng chúng tôi - Bắt đầu ngay hôm nay</p>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl text-center font-bold">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <RegisterForm onRegister={handleRegister} isLoading={isLoading} />

          {/* Link to Login */}
          <div className="pt-6 text-center border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Đã có tài khoản?{" "}
              <a href="/login" className="font-bold text-sky-600 hover:text-sky-700 transition-colors underline-offset-4 hover:underline">
                Đăng nhập
              </a>
            </p>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-8 text-center text-white/80 text-sm">
          <p>Bằng cách đăng ký, bạn đồng ý với <a href="#" className="underline hover:text-white transition-colors">Điều khoản</a> & <a href="#" className="underline hover:text-white transition-colors">Chính sách bảo mật</a></p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
