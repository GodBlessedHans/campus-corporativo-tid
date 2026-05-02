import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../../components/Form";
import { showAlert } from "../../helpers/alerts";

export default function ForgotPassword() {
  const [isEmailValidated, setIsEmailValidated] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    if (!email) return false;
    const atIndex = email.indexOf("@");
    const dotIndex = email.lastIndexOf(".");
    return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < email.length - 1;
  };

  const handleSubmit = (formData) => {
    if (!isEmailValidated) {
      const email = formData.email?.trim();

      if (!email) {
        showAlert("Error", "Por favor, completa todos los campos", "error");
        return;
      }

      if (!validateEmail(email)) {
        showAlert("Error", "Por favor ingresa un correo válido", "error");
        return;
      }

      if (email === "admin@tid.com") {
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

    if (formData.password.length < 6) {
      showAlert("Error", "La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    showAlert("Contraseña actualizada", "Tu contraseña se actualizó correctamente", "success");
    setTimeout(() => {
      navigate("/login");
    }, 1200);
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
      <p>
        {isEmailValidated
          ? "Ingresa tu nueva contraseña y confírmala."
          : "Ingresa el correo electrónico asociado a tu cuenta."
        }
      </p>
      <Form
        key={isEmailValidated ? "reset-password" : "validate-email"}
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={isEmailValidated ? "Actualizar contraseña" : "Validar email"}
      />
    </div>
  );
}
