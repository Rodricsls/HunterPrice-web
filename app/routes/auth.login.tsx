import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { loginUser } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { headers } = await loginUser(email, password, request);
    return json({ success: true }, { headers });
  } catch (error: any) {
    return json({ error: error.message || "Error al iniciar sesión" }, { status: 400 });
  }
};

export default function LoginRoute() {
  return null; // This route only handles the login action
}
