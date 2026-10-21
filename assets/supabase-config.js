/*
  LANZEC MOTO EXPRESS — configuración de cliente Supabase.
  Sustituye los valores cuando tengamos el proyecto creado.
  La clave aquí debe ser la clave pública publishable/anon.
  NUNCA coloques la service_role key en el navegador.
*/
// LANZEC MOTO EXPRESS — Supabase
(() => {
  const SUPABASE_URL =
    "https://ikkbkaugumkelarnwacl.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_8iHAbjZczhE7jcBus4yqgQ_rUsCqMlN";

  if (!window.supabase?.createClient) {
    console.error("No se ha cargado el cliente de la base de datos.");
    return;
  }

  window.lanzecSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  console.info("Cliente de Supabase inicializado.");
})();
// La integración real se activa en la siguiente etapa, después de preparar
// el esquema, políticas RLS y funciones RPC en Supabase.
