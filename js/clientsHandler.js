$(document).ready(function () {
    const clientRow = document.querySelector('#clientsCards');

    $.get('/rutas/clientes/listado',function (response) {
        if (response.data.length !==0){
            clientRow.style.display = 'block';
            response.data.forEach(function (row) {
                clientCards(row,clientRow);
            });
        }
    });

    let input = document.querySelector('#search');
    input.addEventListener('keyup',function () {
        myFunction(input);
    });

});

function clientCards(row,clientRow) {
    let outerDiv = document.createElement('div'), clientCard = document.createElement('div'), mainRow = document.createElement('div'),
        block1 = document.createElement('div'), ahref1 = document.createElement('a'), icon1 = document.createElement('i'),
        block2 = document.createElement('div'), ahref2 = document.createElement('a'), icon2 = document.createElement('i'),
        block3 = document.createElement('div'), clientAvatar = document.createElement('div'), ahrefAvatar = document.createElement('a'),
        img = document.createElement('img'), header = document.createElement('h3'), ahref = document.createElement('a');

    img.setAttribute('class','clientImage');
    img.setAttribute('alt','Imagen del Cliente');
    img.setAttribute('src','/images/'+row[1]);
    ahrefAvatar.setAttribute('href','/rutas/clientes/actualizarCliente/'+row[0]);
    ahrefAvatar.appendChild(img);
    header.setAttribute('class','clientsTitle');
    header.style.fontSize = '14px';
    header.innerHTML = row[2].split(' ')[0]+'<br>'+row[3].split(' ')[0];
    ahref.setAttribute('href','/rutas/prestamos/alCliente/'+row[0]);
    ahref.setAttribute('class','btn btn-primary btnPrestamo');
    ahref.innerHTML = 'Préstamos';
    clientAvatar.setAttribute('class','client-avatar');
    clientAvatar.appendChild(ahrefAvatar);
    block3.setAttribute('class','card-body text-center');
    block3.appendChild(clientAvatar);
    block3.appendChild(header);
    block3.appendChild(ahref);

    icon2.setAttribute('class','fa fa-remove');
    ahref2.setAttribute('href','#');
    ahref2.setAttribute('class','btnActionDelete');
    ahref2.setAttribute('onclick','deleteClient('+row[0]+')');
    ahref2.appendChild(icon2);
    block2.setAttribute('class',' rightBtn');
    block2.appendChild(ahref2);

    icon1.setAttribute('class','fa fa-exclamation');
    ahref1.setAttribute('href','/rutas/clientes/'+row[0]);
    ahref1.setAttribute('class','btnActionDetails');
    ahref1.appendChild(icon1);
    block1.setAttribute('class','leftBtn');
    block1.appendChild(ahref1);

    mainRow.setAttribute('class','row');
    mainRow.appendChild(block1);
    mainRow.appendChild(block2);
    mainRow.appendChild(block3);
    clientCard.setAttribute('class','client-card');
    clientCard.appendChild(mainRow);
    outerDiv.setAttribute('class','col-12 col-md-3 clientBox');
    outerDiv.appendChild(clientCard);

    clientRow.appendChild(outerDiv);
}

function myFunction(input) {
    let filter = input.value.toLowerCase(), result = null;
    let nodes = document.getElementsByClassName('col-12');

    for (let i=0;i<nodes.length;i++){
        result = nodes[i].getElementsByTagName('h3')[0].innerHTML;
        if (result.toLowerCase().includes(filter)) {
            nodes[i].style.display = "inline-block";
        } else {
            nodes[i].style.display = "none";
        }
    }
}

function deleteClient(val) {
    if (confirm('Seguro que desea eliminar este cliente?')) {
        $.ajax({
            "url": '/rutas/clientes/eliminarCliente/'+val,
            "type": 'delete',

            success: function (response) {
                window.location.href = '/rutas/clientes/';
            },

            error: function(xhr) {
                alert('Usted no tiene permiso para interactuar con este contenido.');
            }
        });
    }
}