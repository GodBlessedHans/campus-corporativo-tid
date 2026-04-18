import Form from "../../components/Form";
import { showAlert } from "../../helpers/alerts";

export default function SignUp() {
  const fields = [
    { label: "Name", type: "text", name: "name" },
    { label: "Last Name", type: "text", name: "lastName" },
    { label: "Email", type: "email", name: "email" },
    { label: "Password", type: "password", name: "password" },
    { label: "Confirm Password", type: "password", name: "confirmPassword" }
  ];

  const handleSubmit = (formData) => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name || !formData.lastName) {
      showAlert("Error", "Por favor, completa todos los campos", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    if (formData.email === "admin@tid.com" && formData.password === "123456") {
      showAlert("¡Bienvenido!", "Te has registrado correctamente", "success");
      localStorage.setItem("user", JSON.stringify({ email: formData.email }));
    } else {
      showAlert("Error", "Credenciales incorrectas", "error");
    }
  };

  return (
    <div>
      <h2>Sign up</h2>
      <Form fields={fields} onSubmit={handleSubmit} />
    </div>
  );
}
