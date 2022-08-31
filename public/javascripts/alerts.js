const params = new URLSearchParams(window.location.search)

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

// Error en Login
if (params.has("errLI")) {
    Toast.fire({
        icon: "error",
        title: "Error al Iniciar Sesión"
    })
}

// Inicio de Sesión
if (params.has("hello")) {
    let p = params.get("hello")
    switch (p) {
        case "1":
            // Cuando un admin inicia sesión
            Toast.fire({
                icon: "success",
                title: "Bienvenido Admin"
            })
            break;
        case "2":
            // Cuando un alumno inicia sesión
            let a = params.get("user")
            Toast.fire({
                icon: "success",
                title: `Bienvenido Alumno ${a}`
            })
            break;
    }
}

// Cerrar Sesión
if (params.has("bye")) {
    Toast.fire({
        icon: "info",
        title: "¡Sesión Cerrada, hasta luego!"
    })
}

// Nuevo Usuario
if (params.has("newUs")) {
    let p = params.get("newUs")
    switch (p) {
        case "1":
            Toast.fire({
                icon: "warning",
                title: "Favor de llenar todos los campos del formulario"
            })

            break;
        case "2":
            Toast.fire({
                icon: "success",
                title: "Nuevo Estudiante dado de alta"
            })
            break;
        case "3":
            let e = params.get("err")
            Toast.fire({
                icon: "error",
                title: e
            })
            break;
    }
}

// Editar Contraseña
if (params.has("edP")) {
    let p = params.get("edP")
    switch (p) {
        case "1":
            Toast.fire({
                icon: "warning",
                title: "Favor de llenar todos los campos del formulario"
            })

            break;
        case "2":
            Toast.fire({
                icon: "success",
                title: "Contraseña Editada"
            })
            break;
        case "3":
            let e = params.get("err")
            Toast.fire({
                icon: "error",
                title: e
            })
            break;
    }
}

// Editar Contraseña
if (params.has("deac")) {
    let p = params.get("deac")
    switch (p) {
        case "1":
            Toast.fire({
                icon: "info",
                title: "Usuario Desactivado"
            })
            break;
        case "2":
            let e = params.get("err")
            Toast.fire({
                icon: "error",
                title: e
            })
            break;
    }
}

// STECH -----------------------------------------------
let idInput = document.getElementById("dealta");
let btnDeac = document.getElementById("btnDeac");

// Para cuando se vaya a desactivar una cuenta
btnDeac.addEventListener("click", () => {
    if (idInput.value == "") {
        Toast.fire({
            icon: "warning",
            title: "Favor de llenar todos los campos del formulario"
        })
    } else {
        Swal.fire({
            title: '¿Está seguro?',
            text: "Ya no podrá recuperar la cuenta...",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#a11d1d',
            cancelButtonColor: '#1d5da1',
            confirmButtonText: '¡Borrar!'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location = `http://localhost:3000/users/delete?user=${idInput.value}`
            }
        })
    }
})