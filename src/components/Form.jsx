import { useState } from "react";

export default function Form({ fields, onSubmit }) {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field, index) => (
        <div key={index}>
          <label>{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            onChange={handleChange}
          />
        </div>
      ))}
      <button type="submit">Enviar</button>
    </form>
  );
}