/*
  LANZEC MOTO EXPRESS — configuración de cliente Supabase.
  Sustituye los valores cuando tengamos el proyecto creado.
  La clave aquí debe ser la clave pública publishable/anon.
  NUNCA coloques la service_role key en el navegador.
*/
window.LANZEC_SUPABASE_CONFIG = {
  url: "PEGA_AQUI_LA_URL_DEL_PROYECTO",
  publishableKey: "PEGA_AQUI_LA_CLAVE_PUBLICA",
  configured: false
};

// La integración real se activa en la siguiente etapa, después de preparar
// el esquema, políticas RLS y funciones RPC en Supabase.
