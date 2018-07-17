$(document).ready(function () {
   let submitForm = document.querySelector('#personalDetailsForm');

   if (submitForm.getAttribute('action')!=='/rutas/usuarios'){
       let password = document.querySelector('#password'), rePassword = document.querySelector('#rePassword');
       password.removeAttribute('required');
       rePassword.removeAttribute('required');
   }

    let profilePicture = document.querySelector('#profilePic');
    profilePicture.addEventListener('change',function () {
        readURL(this);
    });

   submitForm.addEventListener('submit',function (e) {
       let password = document.querySelector('#password'), rePassword = document.querySelector('#rePassword');
       if (password.value!==rePassword.value){
           e.preventDefault();
           alert('Las contraseñas NO coinciden.');
       }
   });

   let promise = Promise.resolve(
       $.get('/rutas/roles/listado',function (response) {
           let combo = document.querySelector('#userRole');
           response.data.forEach(function (row) {
               let option = document.createElement('option');
               option.setAttribute('id',row[1]);
               option.innerHTML = row[0]+' - '+row[1];
               combo.appendChild(option);
           })
       })
   );

   promise.then(function () {
       $('#userRole').children('option').each(function () {
           if (this.innerHTML[0] === document.getElementById('roleId').value){
               this.selected = true;
           }
       });
   });

});

function readURL(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function(e) {
            console.log(e.target.result);
            $('#avatar').attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
