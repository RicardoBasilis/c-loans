$(document).ready(function () {
    const banks = document.querySelector('#bankList');
    let selectedRow = null, fields = null;
    let banksTable = document.querySelector("#banksTable"), queryTable = $('#banksTable');
    tableRefresh();

    let bankModal = [document.querySelector('#bankForm'),document.querySelector('#bankTemp'),document.querySelector('#bankName'),document.querySelector('#bankBtn')];

    document.querySelector('#bankPlus').addEventListener('click',function () {
        bankModal[0].setAttribute('action','/rutas/bancos');
        bankModal[1].innerText = 'Añadir Banco';
        bankModal[2].setAttribute('value','');
        bankModal[3].innerText = 'Crear';
    });

    queryTable.on('click', 'tbody td.detail-control', function () {
        let table = queryTable.DataTable();
        let tr = $(this).parents('tr');
        let row = table.row( tr );
        let child1 = row.child()[0].querySelector('button.tableBtnDelete');
        let child2 = row.child()[0].querySelector('button.tableBtnUpdate');
        child1.setAttribute('class','tableBtnDelete2');
        child2.setAttribute('class','tableBtnUpdate2');

        child1.addEventListener('click',function () {
            $.ajax({
                url: '/rutas/bancos/eliminarBanco/'+row.data()[0],
                type: 'delete',
                success: function () {
                    tableRefresh();
                },
                error: function(xhr) {
                    alert('Usted no tiene permiso para interactuar con este contenido.');
                }
            });
        });

        child2.addEventListener('click',function () {
            bankModal[0].setAttribute('action','/rutas/bancos/actualizarBanco/'+row.data()[0]);
            bankModal[1].innerText = 'Modificar Banco';
            bankModal[2].setAttribute('value',selectedRow[1]);
            bankModal[3].innerText = 'Actualizar';
        });

    });

    queryTable.on('click', '.tableBtnUpdate', function () {
        let table = queryTable.DataTable();
        selectedRow = table.row($(this).closest('tr')).data();
        bankModal[0].setAttribute('action','/rutas/bancos/actualizarBanco/'+selectedRow[0]);
        bankModal[1].innerText = 'Modificar Banco';
        bankModal[2].setAttribute('value',selectedRow[1]);
        bankModal[3].innerText = 'Actualizar';
    });

    queryTable.on('click', '.tableBtnDelete', function () {
        let table = queryTable.DataTable();
        selectedRow = table.row($(this).closest('tr')).data();
        if (confirm('Seguro que desea eliminar este banco?')) {
            $.ajax({
                url: '/rutas/bancos/eliminarBanco/'+selectedRow[0],
                type: 'delete',

                success: function () {
                    tableRefresh();
                },

                error: function(xhr) {
                    alert('Usted no tiene permiso para interactuar con este contenido.');
                }
            });
        }
    });

    function tableRefresh(){
        if ($.fn.DataTable.isDataTable("#banksTable")) {
            queryTable.DataTable().destroy();
            queryTable.empty();
        }

        $.ajax({
            url: '/rutas/bancos/listado',
            datatype: "json",

            success: function(response) {
                if (response.data.length!==0){
                    banks.style.display = 'block';

                    let header = banksTable.createTHead();
                    let row = header.insertRow(0);

                    $.each(response.columns, function(i, val){
                        fields = row.insertCell(i);
                        fields.innerHTML = val;
                    });

                    let array = [{
                        targets: [0],
                        visible: false,
                        searchable: false,
                    },{
                        targets: 1,
                        className: 'detail-control',
                        orderable: false,
                        data: null,
                        searchable: false,
                        defaultContent: ''
                    },{
                        targets: -2,
                        data: null,
                        defaultContent: "<button class='tableBtnUpdate' data-toggle='modal' data-target='#myModal'>Modificar</button>"
                    },{
                        targets: -1,
                        data: null,
                        defaultContent: "<button class='tableBtnDelete'>Eliminar</button>"
                    }];

                    queryTable.DataTable({
                        data: response.data,
                        columnDefs: array,
                        responsive: true,
                        language: {
                            sProcessing: "Procesando...",
                            sLengthMenu: "Mostrar _MENU_ registros",
                            sZeroRecords: "No se encontraron resultados",
                            sEmptyTable: "Ningún dato disponible en esta tabla",
                            sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                            sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
                            sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
                            sInfoPostFix: "",
                            sSearch: "Buscar:",
                            sUrl: "",
                            sInfoThousands: ",",
                            sLoadingRecords: "Cargando...",
                            oPaginate: {
                                sFirst: "Primero",
                                sLast: "Último",
                                sNext: "Siguiente",
                                sPrevious: "Anterior"
                            },
                            oAria: {
                                sSortAscending: ": Activar para ordenar la columna de manera ascendente",
                                sSortDescending: ": Activar para ordenar la columna de manera descendente"
                            }
                        }
                    });
                }
            },

            error: function(xhr) {
                alert('Usted no tiene permiso para interactuar con este contenido.');
            }
        });
    }
});