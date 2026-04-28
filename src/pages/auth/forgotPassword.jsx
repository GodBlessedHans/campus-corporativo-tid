import { useState } from "react";
import Form from "../../components/Form";
import { showAlert } from "../../helpers/alerts";

export default function ForgotPassword() {
  const [isEmailValidated, setIsEmailValidated] = useState(false);

  const handleSubmit = (formData) => {
    if (!isEmailValidated) {
      if (!formData.email) {
        showAlert("Error", "Por favor, completa todos los campos", "error");
        return;
      }

      if (formData.email === "admin@tid.com") {
        showAlert("Correo confirmado", "Ahora puedes actualizar tu contraseña", "success");
        setIsEmailValidated(true);
      } else {
        showAlert("Error", "Correo no encontrado", "error");
      }

      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      showAlert("Error", "Por favor, completa todos los campos", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    showAlert("Contraseña actualizada", "Tu contraseña se actualizó correctamente", "success");
  };

  const fields = isEmailValidated
    ? [
        { label: "Nueva contraseña", type: "password", name: "password" },
        { label: "Confirmar contraseña", type: "password", name: "confirmPassword" }
      ]
    : [
        { label: "Email", type: "email", name: "email" }
      ];

  return (
    <div>
      <h2>Recuperar contraseña</h2>
      <Form
        key={isEmailValidated ? "reset-password" : "validate-email"}
        fields={fields}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
