import ForgotForm from './ForgotForm'

export default function PasswordDimenticataPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#0d1420' }}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(91,156,255,0.07) 0%,transparent 70%)' }} />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚽</div>
          <h1 className="text-2xl font-black mb-1">Password dimenticata</h1>
          <p className="text-sm text-white/35">Ti mandiamo un link per reimpostarla</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <ForgotForm />
        </div>
      </div>
    </div>
  )
}
