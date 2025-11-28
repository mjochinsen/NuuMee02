export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center px-6 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00F0D9]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B1FE2]/20 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
