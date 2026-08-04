import React, { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { BarbellIcon, EmailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from './Icons';

interface ModalAuthProps {
  onAutenticado: () => void;
}

export default function ModalAuth({ onAutenticado }: ModalAuthProps) {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const validar = (): string | null => {
    if (!email.trim()) return 'Ingresa tu correo electronico.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'El correo electronico no es valido.';
    if (password.length < 6) return 'La contrasena debe tener al menos 6 caracteres.';
    if (modo === 'registro') {
      if (!nombre.trim()) return 'Ingresa tu nombre.';
      if (password !== confirmPassword) return 'Las contrasenas no coinciden.';
    }
    return null;
  };

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setCargando(true);
    try {
      if (modo === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (err) throw err;
        if (data.session) onAutenticado();
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { nombre: nombre.trim() } }
        });
        if (err) throw err;

        if (data.session) {
          onAutenticado();
        } else {
          setModo('login');
          setPassword('');
          setConfirmPassword('');
          setAviso('Cuenta creada. Revisa tu correo para confirmar el registro y luego inicia sesion.');
        }
      }
    } catch (err: any) {
      let mensaje = 'Ocurrio un error inesperado.';
      if (err?.message) {
        const msg = String(err.message).toLowerCase();
        if (msg.includes('invalid login')) mensaje = 'Correo o contrasena incorrectos.';
        else if (msg.includes('already registered')) mensaje = 'Este correo ya esta registrado.';
        else if (msg.includes('email not confirmed')) mensaje = 'Confirma tu correo antes de iniciar sesion.';
        else mensaje = err.message;
      }
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const cambiarModo = (nuevoModo: 'login' | 'registro') => {
    setModo(nuevoModo);
    setError(null);
    setAviso(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-obsidian)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div className="card-premium fade-in" style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Marca */}
        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-indigo-hover))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px var(--accent-indigo-glow)'
              }}
            >
              <BarbellIcon size={30} color="white" />
            </div>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            LifterLab
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '4px 0 0 0' }}>
            {modo === 'login' ? 'Accede a tu cuenta' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Cambio de modo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#0b0b0d', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => cambiarModo('login')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: modo === 'login' ? 'var(--accent-indigo)' : 'transparent',
              color: modo === 'login' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Iniciar Sesion
          </button>
          <button
            type="button"
            onClick={() => cambiarModo('registro')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: modo === 'registro' ? 'var(--accent-indigo)' : 'transparent',
              color: modo === 'registro' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {modo === 'registro' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
                Nombre
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <UserIcon size={15} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: Juan Perez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '34px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Correo electronico
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <EmailIcon size={15} />
              </div>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '34px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Contrasena
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <LockIcon size={15} />
              </div>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '34px', paddingRight: '34px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
              >
                {mostrarPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {modo === 'registro' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
                Confirmar contrasena
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <LockIcon size={15} />
                </div>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="Repite tu contrasena"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '34px' }}
                />
              </div>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: 'var(--accent-red-glow)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
              {error}
            </div>
          )}

          {aviso && (
            <div style={{ backgroundColor: 'var(--accent-emerald-glow)', border: '1px solid var(--accent-emerald)', color: '#a7f3d0', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
              {aviso}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={cargando}
            style={{ width: '100%', padding: '13px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', opacity: cargando ? 0.6 : 1 }}
          >
            {cargando ? (modo === 'login' ? 'Ingresando...' : 'Creando cuenta...') : (modo === 'login' ? 'Entrar' : 'Registrarme')}
          </button>
        </form>

        <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          Tus datos se almacenan de forma segura en la nube.
        </p>

      </div>
    </div>
  );
}
