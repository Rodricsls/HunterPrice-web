import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { signUpUser } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const genero = formData.get("genero") as string;

  try {
    await signUpUser(email, password, name, genero); // Replace "other" if your API needs gender
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message || "Error al registrarse" }, { status: 400 });
  }
};

export default function SignupRoute() {
  return null; // This route is only used for the action
}
