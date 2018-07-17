$(document).ready(function () {
    let comboEmpleo = document.querySelector('#empleo'), profilePicture = document.querySelector('#imgInput');
    let hiddenFields = [document.querySelector('#nombreTrabajoDiv'), document.querySelector('#trabajoPosicion'),
      document.querySelector('#trabajoDireccion'), document.querySelector('#tiempoLaborando'), document.querySelector('#trabajoTelefono'),
      document.querySelector('label[for="trabajoPosicion"]'), document.querySelector('label[for="trabajoDireccion"]'),
        document.querySelector('label[for="tiempoLaborando"]'), document.querySelector('label[for="trabajoTelefono"]')
    ];

    profilePicture.addEventListener('change',function () {
        readURL(this);
    });

    comboEmpleo.addEventListener('change',function () {
        if (comboEmpleo.value==='Empleado'){
           hiddenFields.forEach(function (field) {
               field.style.display = 'block';
           })
       }else{
           hiddenFields.forEach(function (field) {
               field.style.display = 'none';
           })
       }
    });
});

function fillData(){
    let hiddenFields = [document.querySelector('#nombreTrabajoDiv'), document.querySelector('#trabajoPosicion'),
        document.querySelector('#trabajoDireccion'), document.querySelector('#tiempoLaborando'), document.querySelector('#trabajoTelefono'),
        document.querySelector('label[for="trabajoPosicion"]'), document.querySelector('label[for="trabajoDireccion"]'),
        document.querySelector('label[for="tiempoLaborando"]'), document.querySelector('label[for="trabajoTelefono"]')];

    let comboEmpleo = document.querySelector('#estado');

    if (comboEmpleo.value==='Empleado'){
        hiddenFields.forEach(function (field) {
            field.style.display = 'block';
        });
    }else{
        hiddenFields.forEach(function (field) {
            field.style.display = 'none';
        });
    }

    let comboBoxes = $("input[name='comboBox[]']");
    let array = [document.querySelector('#sexo'),document.querySelector('#vivienda'),document.querySelector('#estadoCivil'),document.querySelector('#empleo')];
    comboBoxes.each(function (index) {
        if (comboBoxes[index].value!==null && comboBoxes[index].value!==''){
            array[index].value = comboBoxes[index].value;
        }else{
            array[index].value = 'Desconocido';
        }
    });
}

function readURL(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function(e) {
            $('#avatar').attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
