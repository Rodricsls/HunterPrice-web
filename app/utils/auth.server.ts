import { commitSession, destroySession, getSession } from "./session.server";

const API_URL = "https://api.hunterprice.online/api"; // Cambia esto a la URL de tu servidor

export async function loginUser(
    email: string,
    password: string,
    request: Request,
) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar sesión");
    }

    const data = await response.json();
    const session = await getSession(request.headers.get("Cookie"));
    session.set("user", {
        id: data.user.id,
        nombre: data.user.nombre,
        token: data.token,
    });

    return { headers: { "Set-Cookie": await commitSession(session) } };
}

export async function signUpUser(
    email: string,
    password: string,
    nombre: string,
    genero: string,
) {
    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nombre, genero }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrarse");
    }

    return response.json();
}

export async function logoutUser(request: Request) {
    const session = await getSession(request.headers.get("Cookie"));
    return { headers: { "Set-Cookie": await destroySession(session) } };
}
