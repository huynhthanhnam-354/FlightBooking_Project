import React from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { CiPlane } from "react-icons/ci";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    console.log("Registration attempted:", userData);
    // Logic for registration would go here
    // After success, maybe auto-login or redirect to login
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    navigate("/login");
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
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Tham gia FlightBook</h1>
            <p className="text-sm text-slate-500">Khám phá thế giới cùng chúng tôi - Bắt đầu ngay hôm nay</p>
          </div>

          {/* Registration Form */}
          <RegisterForm onRegister={handleRegister} />

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
