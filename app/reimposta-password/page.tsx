import ResetForm from './ResetForm'

export default function ReimpostaPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#06060f 0%,#0d0d1f 100%)' }}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.15) 0%,transparent 70%)' }} />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚽</div>
          <h1 className="text-2xl font-black mb-1">Nuova password</h1>
          <p className="text-sm text-white/35">Scegli una nuova password</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <ResetForm />
        </div>
      </div>
    </div>
  )
}
