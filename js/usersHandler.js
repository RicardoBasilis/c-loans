$(document).ready(function () {
    let selectedRow = null, fields = null;
    let usersTable = document.querySelector("#usersTable"), queryTable = $('#usersTable');
    tableRefresh();

    let sRow = null;

    queryTable.on('click', '.tableBtnDetail', function () {
        let table = queryTable.DataTable();
        selectedRow = table.row($(this).closest('tr')).data();
        sRow = selectedRow;
        window.location.href = '/rutas/usuarios/'+selectedRow[0];
    });

    queryTable.on('click', '.tableBtnUpdate', function () {
        let table = queryTable.DataTable();
        selectedRow = table.row($(this).closest('tr')).data();
        sRow = selectedRow;
        window.location.href = '/rutas/usuarios/actualizarUsuario/'+selectedRow[0];
        return false;
    });

    queryTable.on('click', '.tableBtnDelete', function () {
        let table = queryTable.DataTable();
        selectedRow = table.row($(this).closest('tr')).data();
        if (confirm('Seguro que desea eliminar este usuario?')) {
            sRow = selectedRow;
            $.ajax({
                url: '/rutas/usuarios/eliminarUsuario/'+selectedRow[0],
                type: 'delete',

                success: function (response) {
                    tableRefresh();
                },

                error: function(xhr) {
                    alert('Usted no tiene permiso para interactuar con este contenido.');
                }
            });
        }
    });

    function tableRefresh(){
        if ($.fn.DataTable.isDataTable("#usersTable")) {
            queryTable.DataTable().destroy();
            queryTable.empty();
        }

        $.ajax({
            url: '/rutas/usuarios/listado',
            datatype: "json",

            success: function(response) {
                let header = usersTable.createTHead();
                let row = header.insertRow(0);

                $.each(response.columns, function(i, val){
                    fields = row.insertCell(i);
                    fields.innerHTML = val;
                });

                let array = [{
                    targets: [0,1,3,4,5,6,7,9,10,11,12,13,14],
                    visible: false,
                    searchable: false,
                },{
                    targets: -3,
                    data: null,
                    defaultContent: "<button class='tableBtnDetail'>Detalles</button>"
                },{
                    targets: -2,
                    data: null,
                    defaultContent: "<button class='tableBtnUpdate'>Modificar</button>"
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
            },

            error: function(xhr) {
                alert('Usted no tiene permiso para interactuar con este contenido.');
            }
        });
    }

});

// ,{
//     targets: 1,
//         className: 'detail-control',
//         orderable: false,
//         data: null,
//         searchable: false,
//         defaultContent: ''
// },