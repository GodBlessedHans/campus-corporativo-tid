import Swal from 'sweetalert2/dist/sweetalert2.js'
export const showAlert = (title, text, icon) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: icon,
    title: title,
    text: text,
    customClass: {
      popup: 'swal2-toast'
    }
  });
};

