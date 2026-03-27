// Esta función se ejecuta cuando el doctor da clic en "Ingresar"
        async function iniciarSesion(event) {
            event.preventDefault(); // Evita que la página se recargue

            const email = document.getElementById('correo').value;
            const password = document.getElementById('password').value;
            const btnLogin = document.getElementById('btn-login');
            const errorDiv = document.getElementById('mensaje-error');

            // Cambiar aspecto del botón para mostrar que está cargando
            btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Verificando en Gateway...';
            btnLogin.disabled = true;
            btnLogin.classList.add('opacity-75', 'cursor-not-allowed');
            errorDiv.classList.add('hidden');

            try {
                // Apuntamos al puerto 3000 (el de tu compañero)
                const respuesta = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }) // Él usa "email" en su controller
                });

                const datos = await respuesta.json();

                if (respuesta.ok) {
                    // Guardamos el token que ÉL nos dio
                    localStorage.setItem('token_doctor', datos.token);
                    window.location.href = 'consultorio.html';
                } else {
                    mostrarError(datos.message || datos.mensaje || "Error al iniciar sesión");
                }
            } catch (error) {
                mostrarError("Error al conectar con el Gateway");
            }
        }

        // Función auxiliar para mostrar errores
        function mostrarError(mensaje) {
            const errorDiv = document.getElementById('mensaje-error');
            const textoError = document.getElementById('texto-error');
            const btnLogin = document.getElementById('btn-login');

            textoError.innerText = mensaje;
            errorDiv.classList.remove('hidden');

            // Restaurar botón
            btnLogin.innerHTML = '<span>Ingresar al Consultorio</span> <i class="fas fa-sign-in-alt ml-2"></i>';
            btnLogin.disabled = false;
            btnLogin.classList.remove('opacity-75', 'cursor-not-allowed');
        }