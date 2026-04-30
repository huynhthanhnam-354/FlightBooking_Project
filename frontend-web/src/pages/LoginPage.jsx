import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";
import { CiPlane } from "react-icons/ci";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (credentials) => {
    console.log("Login attempted:", credentials);
    // Gọi login từ AuthContext
    login({ name: credentials.identifier });
    // Chuyển đến trang chủ
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center p-4">
      {/* Các yếu tố trang trí */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md">
        {/* Container chính */}
        <div className="backdrop-blur-md bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-10 space-y-6 border border-white border-opacity-20">
          
          {/* Logo và tiêu đề */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CiPlane size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">SkyBooking</h1>
            <p className="text-sm text-gray-500">Đặt chuyến bay của bạn ngay hôm nay</p>
          </div>

          {/* Biểu mẫu đăng nhập */}
          <LoginForm onLogin={handleLogin} />

          {/* Liên kết đăng ký */}
          <div className="pt-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                Đăng ký ngay
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 space-y-1">
            <p>Đăng nhập có nghĩa là bạn đồng ý với Điều khoản dịch vụ của chúng tôi</p>
            <p>
              <a href="#" className="hover:text-gray-500 transition-colors">
                Chính sách bảo mật
              </a>
            </p>
          </div>
        </div>

        {/* Thông tin hỗ trợ */}
        <div className="mt-6 text-center text-white text-sm opacity-90">
          <p>Cần trợ giúp? <a href="#" className="underline hover:opacity-100">Liên hệ với chúng tôi</a></p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
