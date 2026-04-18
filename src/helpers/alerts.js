import Swal from 'sweetalert2/dist/sweetalert2.js'
export const showAlert = (title, text, icon) => {
  Swal.fire({
    title: title,
    text: text,
    icon: icon
  });
};

