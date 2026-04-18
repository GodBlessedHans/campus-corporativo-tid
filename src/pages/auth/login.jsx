import Form from "../../components/Form";
import { showAlert } from "../../helpers/alerts";

export default function Login() {
  const fields = [
    { label: "Email", type: "email", name: "email" },
    { label: "Password", type: "password", name: "password" }
  ];

  const handleSubmit = (formData) => {
    // Validación de campos completos
    if (!formData.email || !formData.password) {
      showAlert("Error", "Por favor, completa todos los campos", "error");
      return;
    }

    if (formData.email === "admin@tid.com" && formData.password === "123456") {
      showAlert("¡Bienvenido!", "Has iniciado sesión correctamente", "success");
      localStorage.setItem("user", JSON.stringify({ email: formData.email }));
    } else {
      showAlert("Error", "Credenciales incorrectas", "error");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <Form fields={fields} onSubmit={handleSubmit} />
    </div>
  );
}
