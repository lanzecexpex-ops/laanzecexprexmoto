(() => {
  const client = window.lanzecSupabase;
  const byId = (id) => document.getElementById(id);

  function message(form, text, isError = false) {
    const target = form.querySelector("[data-form-message]");
    if (!target) return;
    target.textContent = text;
    target.setAttribute("role", "status");
    target.style.color = isError ? "#c62828" : "var(--yellow, #d4a900)";
    target.style.marginTop = "12px";
  }

  function setBusy(form, busy, label) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = label || "Procesando…";
    } else if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }

  function destinationFor(role) {
    if (role === "admin") return "admin.html";
    if (role === "driver" || role === "transportista") return "motorizado.html";
    return "cliente.html";
  }

  async function routeSignedInUser() {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return false;
    const { data: profile, error } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("No se pudo leer el perfil:", error.message);
      return false;
    }
    window.location.replace(destinationFor(profile?.role || "client"));
    return true;
  }

  const registerForm = byId("register-form");
  if (registerForm) {
    const roleSelect = byId("register-role");
    const driverFields = document.querySelector("[data-driver-fields]");
    const updateRoleUI = () => {
      if (driverFields) driverFields.hidden = roleSelect.value !== "transportista";
    };
    roleSelect?.addEventListener("change", updateRoleUI);
    updateRoleUI();

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!client) return message(registerForm, "No se pudo inicializar Supabase. Revisa assets/supabase-config.js.", true);
      if (roleSelect?.value === "transportista") {
        return message(registerForm, "El registro de clientes ya puede conectarse. La postulación de transportistas necesita su tabla segura y revisión de documentos; la habilitaremos en el siguiente paso. No se creó ninguna cuenta.", true);
      }

      const formData = new FormData(registerForm);
      const fullName = String(formData.get("name") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      if (!fullName || !phone || !email || password.length < 8) {
        return message(registerForm, "Completa todos los campos. La contraseña debe tener al menos 8 caracteres.", true);
      }

      setBusy(registerForm, true, "Creando cuenta…");
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login.html`,
            data: { full_name: fullName, phone }
          }
        });
        if (error) throw error;
        if (data.session) {
          message(registerForm, "Cuenta creada correctamente. Entrando…");
          window.location.replace("cliente.html");
        } else {
          message(registerForm, "Cuenta creada. Revisa tu correo y confirma la dirección antes de iniciar sesión.");
          registerForm.reset();
          updateRoleUI();
        }
      } catch (error) {
        console.error("Error de registro:", error);
        message(registerForm, error.message || "No se pudo crear la cuenta. Inténtalo de nuevo.", true);
      } finally {
        setBusy(registerForm, false);
      }
    });
  }

  const loginForm = byId("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!client) return message(loginForm, "No se pudo inicializar Supabase. Revisa assets/supabase-config.js.", true);
      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      setBusy(loginForm, true, "Ingresando…");
      try {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const routed = await routeSignedInUser();
        if (!routed) message(loginForm, "Sesión iniciada, pero no pudimos leer tu perfil. Verifica las políticas SELECT de profiles.", true);
      } catch (error) {
        console.error("Error de inicio de sesión:", error);
        message(loginForm, error.message || "No se pudo iniciar sesión.", true);
      } finally {
        setBusy(loginForm, false);
      }
    });

    byId("forgot-password")?.addEventListener("click", async (event) => {
      event.preventDefault();
      if (!client) return message(loginForm, "Supabase no está configurado.", true);
      const email = String(byId("email")?.value || "").trim();
      if (!email) return message(loginForm, "Escribe tu correo electrónico primero.", true);
      try {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login.html`
        });
        if (error) throw error;
        message(loginForm, "Si el correo está registrado, recibirás un enlace para restablecer la contraseña.");
      } catch (error) {
        console.error("Error al recuperar contraseña:", error);
        message(loginForm, error.message || "No se pudo solicitar la recuperación.", true);
      }
    });
  }

  if (client) {
    client.auth.getSession().then(({ data }) => {
      if (data?.session && (registerForm || loginForm)) routeSignedInUser();
    });
  }
})();
